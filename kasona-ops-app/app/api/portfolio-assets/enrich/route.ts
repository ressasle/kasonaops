import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getExchangeTickers, getFundamentalsData, getStocksFromSearch } from "@/lib/mcp/eodhd";

type EnrichMode = "single" | "portfolio" | "company" | "customer";

type EnrichRequest = {
  mode?: EnrichMode;
  asset_id?: string;
  portfolio_id?: string;
  company_id?: number | null;
  customer_id?: number | null;
  stock_name?: string;
  query?: string;
  exchange?: string;
  skipEnriched?: boolean; // If true, skip assets that are already fully enriched (default: true)
  ticker_override?: string; // Manual ticker override e.g. "AAPL.US" for re-enrichment
};

type PortfolioAssetRow = {
  id: string;
  portfolio_id: string | null;
  company_id: number | null;
  ticker: string | null;
  stock_name: string | null;
  exchange: string | null;
  exchange_code: string | null;
  country: string | null;
  country_name: string | null;
  category: string | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
  officers: Record<string, unknown> | Array<Record<string, unknown>> | null;
  owner_comment: string | null;
  currency: string | null;
  ticker_finnhub: string | null;
  ticker_eod: string | null;
  isin: string | null;
  asset_class: "Crypto" | "Stocks" | "ETF" | "Other" | null;
  website_url: string | null;
  logo_url: string | null;
  fiscal_year_end: string | null;
  other_listings: Record<string, unknown> | Array<Record<string, unknown>> | null;
  watchtower: boolean | null;
};

/**
 * Checks if an asset is "fully enriched" — meaning it has all critical data fields populated.
 * Used to skip re-enrichment of already complete assets.
 * 
 * Critical fields checked:
 * - ticker_eod, stock_name, exchange, country, industry (basic identifiers)
 * - description, sector (fundamental data)
 * - website_url (contact info)
 */
const isFullyEnriched = (asset: PortfolioAssetRow): boolean => {
  return !!(
    asset.ticker_eod &&
    asset.stock_name &&
    asset.exchange &&
    asset.country &&
    asset.industry &&
    asset.description &&
    asset.sector &&
    asset.website_url
  );
};

type EnrichOutcome = {
  asset_id: string | null;
  portfolio_id: string | null;
  stock_name: string | null;
  ticker_eod: string | null;
  status: "updated" | "inserted" | "skipped" | "error";
  error?: string;
};

type EnrichUpdateResult = {
  outcome: EnrichOutcome;
  update?: Record<string, unknown>;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenScore = (query: string, target: string) => {
  if (!query || !target) return 0;
  const queryTokens = new Set(query.split(" ").filter(Boolean));
  const targetTokens = new Set(target.split(" ").filter(Boolean));
  const intersection = [...queryTokens].filter((token) => targetTokens.has(token)).length;
  const union = new Set([...queryTokens, ...targetTokens]).size;
  return union === 0 ? 0 : intersection / union;
};

const scoreMatch = (query: string, result: Record<string, unknown>) => {
  const codeRaw = String(result.Code ?? result.Ticker ?? "");
  const nameRaw = String(result.Name ?? "");
  const isinRaw = String(result.ISIN ?? result.Isin ?? "");
  const queryNorm = normalizeText(query);
  const codeNorm = normalizeText(codeRaw);
  const nameNorm = normalizeText(nameRaw);
  const isinNorm = normalizeText(isinRaw);

  if (queryNorm && queryNorm === codeNorm) return 1;
  if (queryNorm && queryNorm === nameNorm) return 1;
  if (queryNorm && isinNorm && queryNorm === isinNorm) return 0.98;

  if (nameNorm && queryNorm && nameNorm.includes(queryNorm)) return 0.94;
  if (codeNorm && queryNorm && codeNorm.startsWith(queryNorm)) return 0.9;

  return Math.max(tokenScore(queryNorm, nameNorm), tokenScore(queryNorm, codeNorm));
};

const normalizeAssetClass = (value: string | null) => {
  if (!value) return null;
  const cleaned = value.toLowerCase();
  if (cleaned.includes("crypto")) return "Crypto";
  if (cleaned.includes("etf")) return "ETF";
  if (cleaned.includes("fund")) return "Funds";
  if (cleaned.includes("index")) return "Other";
  return "Stocks";
};

const pickValue = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    } else if (value != null) {
      return value;
    }
  }
  return null;
};

const resolveQuery = (asset: PortfolioAssetRow, fallback?: string | null) =>
  pickValue(fallback ?? null, asset.stock_name, asset.ticker, asset.isin);

const findBestMatch = async (query: string) => {
  const searchResults = await getStocksFromSearch(query);
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return null;
  }

  const best = searchResults
    .map((result) => ({
      result,
      score: scoreMatch(query, result as Record<string, unknown>)
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (!best || best.score < 0.25) {
    return null;
  }

  return best;
};

const buildAssetUpdate = (params: {
  asset: PortfolioAssetRow;
  selected: Record<string, unknown> | null;
  exchangeCode: string;
  eodTicker: string;
  exchangeMatch: Record<string, unknown> | null;
  fundamentals: Record<string, unknown> | null;
}) => {
  const { asset, selected, exchangeCode, eodTicker, exchangeMatch, fundamentals } = params;
  const general = (fundamentals?.General ?? {}) as Record<string, unknown>;
  const officers = general.Officers ?? fundamentals?.Officers ?? null;

  const assetClass =
    normalizeAssetClass(String(general.Type ?? selected?.Type ?? asset.asset_class ?? "")) ??
    asset.asset_class ??
    "Stocks";

  // Overwrite mode: EOD data takes priority over existing values (except owner_comment and IDs)
  return {
    ticker: pickValue(String(selected?.Code ?? selected?.Ticker ?? "") || null, asset.ticker),
    stock_name: pickValue(
      (general.Name as string) || null,
      (selected?.Name as string) || null,
      asset.stock_name
    ),
    exchange: pickValue(
      (general.Exchange as string) || null,
      (exchangeMatch?.Exchange as string) || null,
      // User requested Exchange Name -> "exchange" column
      // We prioritize the full name from General.Exchange or Match.Exchange
      asset.exchange
    ),
    exchange_code: pickValue(exchangeCode, asset.exchange_code),
    // User requested "exchange_code looks like country code so this needs to be in 'country'"
    // So we map exchangeCode ("US", "HK") -> country column
    country: pickValue(exchangeCode, asset.country),

    country_name: pickValue(
      (general.CountryName as string) || null,
      (selected?.Country as string) || null,
      asset.country_name
    ),
    // User requested: "category is supposed to be possible to set as individual name... so move from category to industry"
    // So we map General.Industry -> industry, and leave category empty (null) unless it already deals with manual input logic (here we just null it for overwrite or keep asset.category if we want to preserve manual? User said "move content... to industry", implying we populate industry and maybe leave category blank for new?)
    // But specific instruction "category is supposed to be possible to set as individual name... so move content from category to industry"
    // And "sector looks correct (you can override existing industries here if you populate it)"
    // So:
    category: asset.category, // Preserve existing manual category? Or null it? User said "move content", implying clean slate? Let's preserve existing if it was manually set, but don't populate from API.
    // Actually, user said "move the content from 'category' to 'industry'". We did that in SQL.
    // So for enrichment, we should POPULATE industry from API, and NOT populate category.

    sector: pickValue((general.Sector as string) || null, asset.sector),
    industry: pickValue(
      (general.Industry as string) || null,
      // If we moved category -> industry in SQL, asset.industry might have old category data. 
      // We overwrite with API Industry if available.
      asset.industry
    ),
    description: pickValue((general.Description as string) || null, asset.description),
    officers: officers ?? asset.officers,
    currency: pickValue((general.CurrencyCode as string) || null, (selected?.Currency as string) || null, asset.currency),
    ticker_eod: pickValue(eodTicker, asset.ticker_eod),
    isin: pickValue(
      (general.ISIN as string) || null,
      (selected?.ISIN as string) || null,
      (selected?.Isin as string) || null,
      asset.isin
    ),
    asset_class: pickValue(assetClass, asset.asset_class),
    website_url: pickValue(
      (general.WebURL as string) || null,
      (general.Website as string) || null,
      (general.WebsiteURL as string) || null,
      asset.website_url
    ),
    logo_url: pickValue((general.LogoURL as string) || null, (general.Logo as string) || null, asset.logo_url),
    fiscal_year_end: pickValue((general.FiscalYearEnd as string) || null, asset.fiscal_year_end),
    other_listings:
      (general.Listings as Record<string, unknown>) ??
      (general.OtherListings as Record<string, unknown>) ??
      asset.other_listings ??
      null
  };
};

const enrichAsset = async (
  asset: PortfolioAssetRow,
  queryOverride?: string | null,
  exchangeOverride?: string | null,
  tickerOverride?: string | null
): Promise<EnrichUpdateResult> => {
  // If tickerOverride is provided, use it directly as ticker_eod
  const effectiveTicker = tickerOverride ?? asset.ticker_eod;

  // If ticker_eod exists (or override provided), use it directly without searching
  if (effectiveTicker) {
    const eodTicker = effectiveTicker;
    const parts = eodTicker.split(".");
    const code = parts[0] ?? "";
    const exchangeCode = exchangeOverride ?? parts.slice(1).join(".") ?? asset.exchange_code ?? "";

    if (!code || !exchangeCode) {
      return {
        outcome: {
          asset_id: asset.id,
          portfolio_id: asset.portfolio_id,
          stock_name: asset.stock_name,
          ticker_eod: asset.ticker_eod,
          status: "error",
          error: "Invalid ticker_eod format"
        }
      };
    }

    const [exchangeTickers, fundamentals] = await Promise.all([
      getExchangeTickers(exchangeCode),
      getFundamentalsData(eodTicker)
    ]);

    const exchangeMatch = Array.isArray(exchangeTickers)
      ? exchangeTickers.find((ticker) => String(ticker.Code ?? "") === code)
      : null;

    const update = buildAssetUpdate({
      asset,
      selected: null,
      exchangeCode,
      eodTicker,
      exchangeMatch: exchangeMatch as Record<string, unknown> | null,
      fundamentals: fundamentals as Record<string, unknown> | null
    });

    return {
      outcome: {
        asset_id: asset.id,
        portfolio_id: asset.portfolio_id,
        stock_name: update.stock_name ?? asset.stock_name,
        ticker_eod: update.ticker_eod ?? asset.ticker_eod,
        status: "updated",
      } as any,
      update
    };
  }

  // No ticker_eod - search by stock_name/ticker
  const query = resolveQuery(asset, queryOverride);
  if (!query) {
    return {
      outcome: {
        asset_id: asset.id,
        portfolio_id: asset.portfolio_id,
        stock_name: asset.stock_name,
        ticker_eod: asset.ticker_eod,
        status: "skipped",
        error: "Missing query"
      }
    };
  }

  const best = await findBestMatch(query);
  if (!best) {
    return {
      outcome: {
        asset_id: asset.id,
        portfolio_id: asset.portfolio_id,
        stock_name: asset.stock_name,
        ticker_eod: asset.ticker_eod,
        status: "error",
        error: "No confident match found"
      }
    };
  }

  const selected = best.result as Record<string, unknown>;
  const code = String(selected.Code ?? selected.Ticker ?? "").trim();
  const exchangeCode = pickValue(exchangeOverride ?? null, asset.exchange_code, (selected.Exchange as string) || null, asset.exchange);

  if (!code || !exchangeCode) {
    return {
      outcome: {
        asset_id: asset.id,
        portfolio_id: asset.portfolio_id,
        stock_name: asset.stock_name,
        ticker_eod: asset.ticker_eod,
        status: "error",
        error: "Missing ticker or exchange code"
      }
    };
  }

  const eodTicker = `${code}.${exchangeCode}`;

  const [exchangeTickers, fundamentals] = await Promise.all([
    getExchangeTickers(exchangeCode),
    getFundamentalsData(eodTicker)
  ]);

  const exchangeMatch = Array.isArray(exchangeTickers)
    ? exchangeTickers.find((ticker) => String(ticker.Code ?? "") === code)
    : null;

  const update = buildAssetUpdate({
    asset,
    selected,
    exchangeCode,
    eodTicker,
    exchangeMatch: exchangeMatch as Record<string, unknown> | null,
    fundamentals: fundamentals as Record<string, unknown> | null
  });

  return {
    outcome: {
      asset_id: asset.id,
      portfolio_id: asset.portfolio_id,
      stock_name: update.stock_name ?? asset.stock_name,
      ticker_eod: update.ticker_eod ?? asset.ticker_eod,
      status: "updated"
    },
    update
  };
};

export async function POST(request: Request) {
  try {
    const supabaseRaw = getSupabaseServerClient();
    if (!supabaseRaw) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = supabaseRaw as any;

    const payload = (await request.json()) as EnrichRequest;
    const mode = payload.mode ?? "single";
    const portfolioId = payload.portfolio_id?.trim();
    const companyId = payload.company_id ?? null;
    const customerId = payload.customer_id ?? null;
    const query = payload.query?.trim() || payload.stock_name?.trim() || null;
    const exchangeOverride = payload.exchange?.trim() || null;

    if (mode === "single") {
      if (payload.asset_id) {
        const { data: asset, error } = await supabase
          .from("kasona_portfolio_assets")
          .select("*")
          .eq("id", payload.asset_id as any)
          .single();

        if (error || !asset) {
          return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        // If ticker_override is provided, use it directly as the ticker_eod for enrichment
        const tickerOverride = payload.ticker_override?.trim();
        const { outcome, update } = await enrichAsset(asset as unknown as PortfolioAssetRow, query, exchangeOverride, tickerOverride);
        if (outcome.status === "error" || outcome.status === "skipped" || !update) {
          return NextResponse.json({ error: outcome.error ?? "Enrichment failed" }, { status: 400 });
        }

        const { data, error: updateError } = await supabase
          .from("kasona_portfolio_assets")
          .update(update as any)
          .eq("id", (asset as any).id as any)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ data, outcome });
      }

      if (!portfolioId) {
        return NextResponse.json({ error: "portfolio_id is required" }, { status: 400 });
      }

      if (!query) {
        return NextResponse.json({ error: "stock_name is required" }, { status: 400 });
      }

      const { data: existingAssets } = await supabase
        .from("kasona_portfolio_assets")
        .select("*")
        .eq("portfolio_id", portfolioId as any)
        .or(`stock_name.ilike.%${query}%,ticker.ilike.%${query}%,isin.ilike.%${query}%`);

      const existingAsset = Array.isArray(existingAssets) ? existingAssets[0] : null;

      if (existingAsset) {
        const { outcome, update } = await enrichAsset(existingAsset as unknown as PortfolioAssetRow, query, exchangeOverride);
        if (outcome.status === "error" || outcome.status === "skipped" || !update) {
          return NextResponse.json({ error: outcome.error ?? "Enrichment failed" }, { status: 400 });
        }

        const { data, error: updateError } = await supabase
          .from("kasona_portfolio_assets")
          .update(update as any)
          .eq("id", (existingAsset as any).id as any)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ data, outcome });
      }

      const best = await findBestMatch(query);
      if (!best) {
        return NextResponse.json({ error: "No confident match found" }, { status: 404 });
      }

      const selected = best.result as Record<string, unknown>;
      const code = String(selected.Code ?? selected.Ticker ?? "").trim();
      const exchangeCode = pickValue(exchangeOverride, (selected.Exchange as string) || null);

      if (!code || !exchangeCode) {
        return NextResponse.json({ error: "Missing ticker or exchange code" }, { status: 400 });
      }

      const eodTicker = `${code}.${exchangeCode}`;

      const [exchangeTickers, fundamentals] = await Promise.all([
        getExchangeTickers(exchangeCode),
        getFundamentalsData(eodTicker)
      ]);

      const exchangeMatch = Array.isArray(exchangeTickers)
        ? exchangeTickers.find((ticker) => String(ticker.Code ?? "") === code)
        : null;

      const assetBase: PortfolioAssetRow = {
        id: "",
        portfolio_id: portfolioId,
        company_id: companyId,
        ticker: null,
        stock_name: query,
        exchange: null,
        exchange_code: null,
        country: null,
        country_name: null,
        category: null,
        sector: null,
        industry: null,
        description: null,
        officers: null,
        owner_comment: null,
        currency: null,
        ticker_finnhub: null,
        ticker_eod: null,
        isin: null,
        asset_class: null,
        website_url: null,
        logo_url: null,
        fiscal_year_end: null,
        other_listings: null,
        watchtower: null
      };

      const insertPayload = buildAssetUpdate({
        asset: assetBase,
        selected,
        exchangeCode,
        eodTicker,
        exchangeMatch: exchangeMatch as Record<string, unknown> | null,
        fundamentals: fundamentals as Record<string, unknown> | null
      });

      const { data, error } = await supabase
        .from("kasona_portfolio_assets")
        .insert({
          portfolio_id: portfolioId,
          company_id: companyId,
          ...insertPayload
        } as any)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data, matched: selected, score: best.score });
    }

    if (mode === "portfolio") {
      if (!portfolioId) {
        return NextResponse.json({ error: "portfolio_id is required" }, { status: 400 });
      }

      const shouldSkipEnriched = payload.skipEnriched !== false; // Default: true

      const { data: assets, error } = await supabase
        .from("kasona_portfolio_assets")
        .select("*")
        .eq("portfolio_id", portfolioId as any);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!assets || assets.length === 0) {
        return NextResponse.json({ error: "No assets found for portfolio" }, { status: 404 });
      }

      const results: EnrichOutcome[] = [];
      let skippedCount = 0;

      for (const asset of assets) {
        const typedAsset = asset as unknown as PortfolioAssetRow;

        // Skip already enriched assets if requested
        if (shouldSkipEnriched && isFullyEnriched(typedAsset)) {
          results.push({
            asset_id: typedAsset.id,
            portfolio_id: typedAsset.portfolio_id,
            stock_name: typedAsset.stock_name,
            ticker_eod: typedAsset.ticker_eod,
            status: "skipped"
          });
          skippedCount++;
          continue;
        }

        const { outcome, update } = await enrichAsset(typedAsset, null, exchangeOverride);
        if (outcome.status === "updated" && update) {
          const { error: updateError } = await supabase
            .from("kasona_portfolio_assets")
            .update(update as any)
            .eq("id", (asset as any).id as any);
          if (updateError) {
            results.push({ ...outcome, status: "error", error: updateError.message });
            continue;
          }
        }
        results.push(outcome);
      }

      return NextResponse.json({
        mode,
        total: assets.length,
        enriched: results.filter(r => r.status === "updated").length,
        skipped: skippedCount,
        errors: results.filter(r => r.status === "error").length,
        results
      });
    }

    if (mode === "company") {
      if (!companyId) {
        return NextResponse.json({ error: "company_id is required" }, { status: 400 });
      }

      const { data: assets, error } = await supabase
        .from("kasona_portfolio_assets")
        .select("*")
        .eq("company_id", companyId as any);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!assets || assets.length === 0) {
        return NextResponse.json({ error: "No assets found for company" }, { status: 404 });
      }

      const results: EnrichOutcome[] = [];

      for (const asset of assets) {
        const { outcome, update } = await enrichAsset(asset as unknown as PortfolioAssetRow, null, exchangeOverride);
        if (outcome.status === "updated" && update) {
          const { error: updateError } = await supabase
            .from("kasona_portfolio_assets")
            .update(update as any)
            .eq("id", (asset as any).id as any);
          if (updateError) {
            results.push({ ...outcome, status: "error", error: updateError.message });
            continue;
          }
        }
        results.push(outcome);
      }

      return NextResponse.json({ mode, count: results.length, results });
    }

    if (mode === "customer") {
      const resolvedCustomerId = customerId ?? companyId;
      if (!resolvedCustomerId) {
        return NextResponse.json({ error: "customer_id is required" }, { status: 400 });
      }

      const { data: profiles, error: profileError } = await supabase
        .from("kasona_investor_profiles")
        .select("portfolio_id")
        .eq("company_id", resolvedCustomerId as any);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      const portfolioIds = ((profiles ?? []) as any[]).map((profile) => profile.portfolio_id).filter(Boolean);
      if (portfolioIds.length === 0) {
        return NextResponse.json({ error: "No portfolios found for customer" }, { status: 404 });
      }

      const { data: assets, error: assetsError } = await supabase
        .from("kasona_portfolio_assets")
        .select("*")
        .in("portfolio_id", portfolioIds);

      if (assetsError) {
        return NextResponse.json({ error: assetsError.message }, { status: 500 });
      }

      if (!assets || assets.length === 0) {
        return NextResponse.json({ error: "No assets found for customer portfolios" }, { status: 404 });
      }

      const shouldSkipEnriched = payload.skipEnriched !== false; // Default: true
      const results: EnrichOutcome[] = [];
      let skippedCount = 0;

      for (const asset of assets) {
        const typedAsset = asset as unknown as PortfolioAssetRow;

        // Skip already enriched assets if requested
        if (shouldSkipEnriched && isFullyEnriched(typedAsset)) {
          results.push({
            asset_id: typedAsset.id,
            portfolio_id: typedAsset.portfolio_id,
            stock_name: typedAsset.stock_name,
            ticker_eod: typedAsset.ticker_eod,
            status: "skipped"
          });
          skippedCount++;
          continue;
        }

        const { outcome, update } = await enrichAsset(typedAsset, null, exchangeOverride);
        if (outcome.status === "updated" && update) {
          const { error: updateError } = await supabase
            .from("kasona_portfolio_assets")
            .update(update as any)
            .eq("id", (asset as any).id as any);
          if (updateError) {
            results.push({ ...outcome, status: "error", error: updateError.message });
            continue;
          }
        }
        results.push(outcome);
      }

      return NextResponse.json({
        mode,
        total: assets.length,
        enriched: results.filter(r => r.status === "updated").length,
        skipped: skippedCount,
        errors: results.filter(r => r.status === "error").length,
        results
      });
    }

    return NextResponse.json({ error: "Invalid enrichment mode" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
