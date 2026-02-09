import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AssetPayload = {
    stock_name?: string;
    name?: string;
    ticker?: string;
    isin?: string;
    currency?: string;
    asset_class?: string;
    category?: string;
    sector?: string;
    owner_comment?: string;
    amount?: number;
    shares?: number;
    avg_cost?: number;
    avgCost?: number;
    price?: number;
};

type BulkPayload = {
    portfolio_id?: string;
    company_id?: number;
    assets: AssetPayload[];
    auto_enrich?: boolean; // If true, trigger enrichment after insert
};

const VALID_ASSET_CLASSES = ["Crypto", "Stocks", "ETF", "Funds", "Other"] as const;
type AssetClass = (typeof VALID_ASSET_CLASSES)[number];

const normalizeAssetClass = (value?: string): AssetClass => {
    if (!value) return "Other";
    const cleaned = value.toLowerCase();
    if (cleaned.includes("crypto")) return "Crypto";
    if (cleaned.includes("etf")) return "ETF";
    if (cleaned.includes("fund")) return "Funds";
    if (cleaned.includes("stock") || cleaned.includes("equit")) return "Stocks";
    return "Other";
};

const normalizeOptionalNumber = (value?: number | string): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export async function POST(request: Request) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const body = (await request.json()) as BulkPayload;
    const { portfolio_id, company_id, assets, auto_enrich } = body;

    if (!portfolio_id || !Array.isArray(assets) || assets.length === 0) {
        return NextResponse.json(
            { error: "portfolio_id and non-empty assets array are required" },
            { status: 400 }
        );
    }

    // Map assets to schema columns
    const dbAssets = assets.map((asset) => {
        const shares = normalizeOptionalNumber(asset.shares);
        const avgCost = normalizeOptionalNumber(asset.avg_cost ?? asset.avgCost);
        const category = asset.category?.trim() || null;

        return {
            portfolio_id,
            company_id: company_id ?? null,
            stock_name: asset.stock_name || asset.name || null,
            ticker: asset.ticker || null,
            isin: asset.isin || null,
            currency: asset.currency || null,
            asset_class: normalizeAssetClass(asset.asset_class),
            category,
            sector: asset.sector || null,
            owner_comment: asset.owner_comment || null,
            ...(shares !== null ? { shares } : {}),
            ...(avgCost !== null ? { avg_cost: avgCost } : {}),
        };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("kasona_portfolio_assets")
        .insert(dbAssets)
        .select();

    if (error) {
        console.error("Error saving portfolio assets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional: Trigger enrichment for newly inserted assets
    if (auto_enrich && data && data.length > 0) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const enrichRes = await fetch(`${baseUrl}/api/portfolio-assets/enrich`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "portfolio", portfolio_id }),
            });
            const enrichResult = await enrichRes.json();
            return NextResponse.json({
                inserted: data.length,
                data,
                enrichment: enrichResult,
            });
        } catch (enrichError) {
            console.error("Auto-enrichment failed:", enrichError);
            return NextResponse.json({
                inserted: data.length,
                data,
                enrichment_error: "Enrichment trigger failed",
            });
        }
    }

    return NextResponse.json({ inserted: data?.length ?? 0, data });
}
