"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { PortfolioAsset } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrichmentResultsModal, type EnrichmentResult } from "./enrichment-results-modal";

type PortfolioAssetsManagerProps = {
  assets: PortfolioAsset[];
  supabaseReady: boolean;
};

type ParsedAsset = {
  portfolio_id: string;
  company_id: number | null;
  ticker: string | null;
  stock_name: string | null;
  bourse: string | null;
  country: string | null;
  category: string | null;
  sector: string | null;
  owner_comment: string | null;
  currency: string | null;
  ticker_finnhub: string | null;
  ticker_eod: string | null;
  isin: string | null;
  asset_class: "Crypto" | "Stocks" | "ETF" | "Other" | null;
  watchtower: boolean | null;
};

const normalizeHeader = (value: string) => value.trim().toLowerCase();

const headerAliases: Record<keyof ParsedAsset, string[]> = {
  portfolio_id: ["portfolio_id", "portfolio id", "portfolio"],
  company_id: ["company_id", "company id", "company"],
  ticker: ["ticker", "symbol"],
  stock_name: ["stock_name", "stock name", "name"],
  bourse: ["bourse", "exchange"],
  country: ["country"],
  category: ["category"],
  sector: ["sector"],
  owner_comment: ["owner_comment", "owner comment", "comment"],
  currency: ["currency"],
  ticker_finnhub: ["ticker_finnhub", "ticker finnhub", "finnhub"],
  ticker_eod: ["ticker_eod", "ticker eod", "eod"],
  isin: ["isin"],
  asset_class: ["asset_class", "asset class", "class"],
  watchtower: ["watchtower", "watch tower", "watchlist", "watch"]
};

const normalizeAssetClass = (value: string) => {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return null;
  if (cleaned === "crypto") return "Crypto";
  if (cleaned === "stocks" || cleaned === "stock" || cleaned === "equity") return "Stocks";
  if (cleaned === "etf" || cleaned === "etfs") return "ETF";
  return "Other";
};

const parseBoolean = (value: string) => {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return null;
  if (["true", "yes", "y", "1"].includes(cleaned)) return true;
  if (["false", "no", "n", "0"].includes(cleaned)) return false;
  return null;
};

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "," || char === "\n")) {
      row.push(current);
      current = "";
      if (char === "\n") {
        rows.push(row);
        row = [];
      }
      continue;
    }

    if (!inQuotes && char === "\r") {
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((rowItem) => rowItem.some((cell) => cell.trim().length > 0));
};

export function PortfolioAssetsManager({ assets, supabaseReady }: PortfolioAssetsManagerProps) {
  const router = useRouter();
  const [parsedAssets, setParsedAssets] = useState<ParsedAsset[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [uploadMode, setUploadMode] = useState<"csv" | "manual" | "enrich">("csv");
  const [manualAsset, setManualAsset] = useState<ParsedAsset>({
    portfolio_id: "",
    company_id: null,
    ticker: "",
    stock_name: "",
    bourse: null,
    country: null,
    category: null,
    sector: null,
    owner_comment: null,
    currency: null,
    ticker_finnhub: null,
    ticker_eod: null,
    isin: "",
    asset_class: "Stocks",
    watchtower: null
  });
  const [enrichAsset, setEnrichAsset] = useState({
    portfolio_id: "",
    company_id: null as number | null,
    stock_name: "",
    exchange: ""
  });
  const [batchEnrich, setBatchEnrich] = useState({
    portfolio_id: "",
    company_id: "",
    customer_id: ""
  });
  const [skipEnriched, setSkipEnriched] = useState(true);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [enrichmentResults, setEnrichmentResults] = useState<EnrichmentResult[]>([]);
  const [enrichmentSummary, setEnrichmentSummary] = useState({ total: 0, enriched: 0, skipped: 0, errors: 0 });
  const [showResultsModal, setShowResultsModal] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length < 2) {
      setError("CSV must include a header and at least one row.");
      setParsedAssets([]);
      return;
    }

    const headers = rows[0].map(normalizeHeader);
    const headerIndex = new Map<string, number>();
    headers.forEach((header, index) => headerIndex.set(header, index));

    const getIndex = (aliases: string[]) => {
      for (const alias of aliases) {
        const key = normalizeHeader(alias);
        if (headerIndex.has(key)) return headerIndex.get(key) as number;
      }
      return -1;
    };

    const indices = Object.fromEntries(
      Object.entries(headerAliases).map(([key, aliases]) => [key, getIndex(aliases)])
    ) as Record<keyof ParsedAsset, number>;

    const newAssets: ParsedAsset[] = [];

    rows.slice(1).forEach((row) => {
      const portfolioId = indices.portfolio_id >= 0 ? row[indices.portfolio_id]?.trim() : "";
      if (!portfolioId) return;

      const companyIdValue = indices.company_id >= 0 ? row[indices.company_id]?.trim() : "";
      const companyId = companyIdValue ? Number(companyIdValue) : null;

      const assetClassValue = indices.asset_class >= 0 ? row[indices.asset_class]?.trim() : "";
      const assetClass = assetClassValue ? normalizeAssetClass(assetClassValue) : null;
      const watchtowerValue = indices.watchtower >= 0 ? row[indices.watchtower]?.trim() : "";
      const watchtower = watchtowerValue ? parseBoolean(watchtowerValue) : null;

      newAssets.push({
        portfolio_id: portfolioId,
        company_id: Number.isFinite(companyId) ? companyId : null,
        ticker: indices.ticker >= 0 ? row[indices.ticker]?.trim() || null : null,
        stock_name: indices.stock_name >= 0 ? row[indices.stock_name]?.trim() || null : null,
        bourse: indices.bourse >= 0 ? row[indices.bourse]?.trim() || null : null,
        country: indices.country >= 0 ? row[indices.country]?.trim() || null : null,
        category: indices.category >= 0 ? row[indices.category]?.trim() || null : null,
        sector: indices.sector >= 0 ? row[indices.sector]?.trim() || null : null,
        owner_comment: indices.owner_comment >= 0 ? row[indices.owner_comment]?.trim() || null : null,
        currency: indices.currency >= 0 ? row[indices.currency]?.trim() || null : null,
        ticker_finnhub: indices.ticker_finnhub >= 0 ? row[indices.ticker_finnhub]?.trim() || null : null,
        ticker_eod: indices.ticker_eod >= 0 ? row[indices.ticker_eod]?.trim() || null : null,
        isin: indices.isin >= 0 ? row[indices.isin]?.trim() || null : null,
        asset_class: assetClass,
        watchtower
      });
    });

    if (newAssets.length === 0) {
      setError("No valid assets found. Ensure portfolio_id is present.");
      setParsedAssets([]);
      return;
    }

    setFileName(file.name);
    setParsedAssets(newAssets);
    setError(null);
  };

  const handleManualChange =
    (field: keyof ParsedAsset) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setManualAsset((prev) => ({
        ...prev,
        [field]:
          field === "company_id"
            ? value
              ? Number(value)
              : null
            : field === "watchtower"
              ? value
                ? value === "true"
                : null
              : value
      }));
    };

  const addManualAsset = () => {
    if (!manualAsset.portfolio_id.trim()) {
      setError("portfolio_id is required.");
      return;
    }

    setParsedAssets((prev) => [
      ...prev,
      {
        ...manualAsset,
        portfolio_id: manualAsset.portfolio_id.trim(),
        ticker: manualAsset.ticker?.trim() || null,
        stock_name: manualAsset.stock_name?.trim() || null,
        isin: manualAsset.isin?.trim() || null
      }
    ]);

    setManualAsset({
      portfolio_id: "",
      company_id: null,
      ticker: "",
      stock_name: "",
      bourse: null,
      country: null,
      category: null,
      sector: null,
      owner_comment: null,
      currency: null,
      ticker_finnhub: null,
      ticker_eod: null,
      isin: "",
      asset_class: "Stocks",
      watchtower: null
    });
    setError(null);
  };

  const handleEnrichChange =
    (field: keyof typeof enrichAsset) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEnrichAsset((prev) => ({
          ...prev,
          [field]: field === "company_id" ? (value ? Number(value) : null) : value
        }));
      };

  const handleBatchChange =
    (field: keyof typeof batchEnrich) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setBatchEnrich((prev) => ({
        ...prev,
        [field]: value
      }));
    };

  const handleEnrich = async () => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    if (!enrichAsset.portfolio_id.trim()) {
      setError("portfolio_id is required.");
      return;
    }

    if (!enrichAsset.stock_name.trim()) {
      setError("stock name is required.");
      return;
    }

    setIsEnriching(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          portfolio_id: enrichAsset.portfolio_id.trim(),
          company_id: enrichAsset.company_id,
          stock_name: enrichAsset.stock_name.trim(),
          exchange: enrichAsset.exchange.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Enrichment failed");
      }

      setEnrichAsset({
        portfolio_id: "",
        company_id: null,
        stock_name: "",
        exchange: ""
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrichment failed");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleBatchEnrich = async (mode: "portfolio" | "company" | "customer") => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    if (mode === "portfolio" && !batchEnrich.portfolio_id.trim()) {
      setError("portfolio_id is required for batch enrichment.");
      return;
    }

    if (mode === "company" && !batchEnrich.company_id.trim()) {
      setError("company_id is required for batch enrichment.");
      return;
    }

    if (mode === "customer" && !batchEnrich.customer_id.trim()) {
      setError("customer_id is required for batch enrichment.");
      return;
    }

    const companyIdValue = batchEnrich.company_id.trim();
    const customerIdValue = batchEnrich.customer_id.trim();
    const parsedCompanyId = companyIdValue ? Number(companyIdValue) : undefined;
    const parsedCustomerId = customerIdValue ? Number(customerIdValue) : undefined;

    if (mode === "company" && (parsedCompanyId == null || !Number.isFinite(parsedCompanyId))) {
      setError("company_id must be a number.");
      return;
    }

    if (mode === "customer" && (parsedCustomerId == null || !Number.isFinite(parsedCustomerId))) {
      setError("customer_id must be a number.");
      return;
    }

    setIsEnriching(true);
    setEnrichmentProgress(10);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          portfolio_id: batchEnrich.portfolio_id.trim() || undefined,
          company_id: parsedCompanyId,
          customer_id: parsedCustomerId,
          skipEnriched
        })
      });

      setEnrichmentProgress(80);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Batch enrichment failed");
      }

      const data = await response.json();
      setEnrichmentProgress(100);

      // Store results for modal
      setEnrichmentResults(data.results ?? []);
      setEnrichmentSummary({
        total: data.total ?? 0,
        enriched: data.enriched ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0
      });
      setShowResultsModal(true);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch enrichment failed");
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };


  const handleRowEnrich = async (assetId: string) => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    setIsEnriching(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          asset_id: assetId
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Enrichment failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrichment failed");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleUpload = async () => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    if (parsedAssets.length === 0) {
      setError("No parsed assets to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: parsedAssets })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      setParsedAssets([]);
      setFileName(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    const confirmed = window.confirm("Delete this asset?");
    if (!confirmed) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio-assets/${assetId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to delete asset");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete asset");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Portfolio Upload</CardTitle>
          <Badge variant={supabaseReady ? "success" : "warning"}>
            {supabaseReady ? "Live" : "Offline"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={uploadMode === "csv" ? "default" : "outline"}
              onClick={() => setUploadMode("csv")}
            >
              CSV Upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant={uploadMode === "manual" ? "default" : "outline"}
              onClick={() => setUploadMode("manual")}
            >
              Manual Entry
            </Button>
            <Button
              type="button"
              size="sm"
              variant={uploadMode === "enrich" ? "default" : "outline"}
              onClick={() => setUploadMode("enrich")}
            >
              Smart Search
            </Button>
          </div>
          {uploadMode === "csv" && (
            <div className="space-y-2">
              <Label>CSV File</Label>
              <Input type="file" accept=".csv" onChange={handleFileChange} />
            </div>
          )}
          {uploadMode === "manual" && (
            <div className="space-y-3 rounded-2xl border border-border/60 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Portfolio ID</Label>
                  <Input value={manualAsset.portfolio_id} onChange={handleManualChange("portfolio_id")} />
                </div>
                <div className="space-y-2">
                  <Label>Company ID</Label>
                  <Input type="number" value={manualAsset.company_id ?? ""} onChange={handleManualChange("company_id")} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ticker</Label>
                  <Input value={manualAsset.ticker ?? ""} onChange={handleManualChange("ticker")} />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={manualAsset.stock_name ?? ""} onChange={handleManualChange("stock_name")} />
                </div>
                <div className="space-y-2">
                  <Label>ISIN</Label>
                  <Input value={manualAsset.isin ?? ""} onChange={handleManualChange("isin")} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Asset Class</Label>
                  <select
                    value={manualAsset.asset_class ?? ""}
                    onChange={handleManualChange("asset_class")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="ETF">ETF</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Input value={manualAsset.sector ?? ""} onChange={handleManualChange("sector")} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={manualAsset.currency ?? ""} onChange={handleManualChange("currency")} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Watchtower</Label>
                  <select
                    value={manualAsset.watchtower === null ? "" : manualAsset.watchtower ? "true" : "false"}
                    onChange={handleManualChange("watchtower")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Not set</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <Button type="button" size="sm" onClick={addManualAsset}>
                Add to batch
              </Button>
            </div>
          )}
          {uploadMode === "enrich" && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-border/60 p-4">
                <div className="text-sm font-medium">Single Asset Search</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Portfolio ID</Label>
                    <Input value={enrichAsset.portfolio_id} onChange={handleEnrichChange("portfolio_id")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company ID (optional)</Label>
                    <Input type="number" value={enrichAsset.company_id ?? ""} onChange={handleEnrichChange("company_id")} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Stock Name</Label>
                    <Input value={enrichAsset.stock_name} onChange={handleEnrichChange("stock_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Exchange Code (optional)</Label>
                    <Input value={enrichAsset.exchange} onChange={handleEnrichChange("exchange")} placeholder="US" />
                  </div>
                </div>
                <Button type="button" size="sm" onClick={handleEnrich} disabled={isEnriching}>
                  Search & Enrich
                </Button>
              </div>
              <div className="space-y-3 rounded-2xl border border-dashed border-border/60 p-4">
                <div className="text-sm font-medium">Batch Enrichment</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Portfolio ID</Label>
                    <Input value={batchEnrich.portfolio_id} onChange={handleBatchChange("portfolio_id")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company ID</Label>
                    <Input value={batchEnrich.company_id} onChange={handleBatchChange("company_id")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer ID</Label>
                    <Input value={batchEnrich.customer_id} onChange={handleBatchChange("customer_id")} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleBatchEnrich("portfolio")} disabled={isEnriching}>
                    Enrich Portfolio
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleBatchEnrich("company")} disabled={isEnriching}>
                    Enrich Company
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleBatchEnrich("customer")} disabled={isEnriching}>
                    Enrich Customer Portfolios
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipEnriched}
                    onChange={(e) => setSkipEnriched(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Skip already enriched assets
                </label>
                {isEnriching && enrichmentProgress > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Enriching assets...</div>
                    <Progress value={enrichmentProgress} />
                  </div>
                )}
              </div>
            </div>
          )}
          {fileName && (
            <div className="text-xs text-muted-foreground">Loaded: {fileName}</div>
          )}
          {parsedAssets.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Preview ({parsedAssets.length} rows)</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Portfolio</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>ISIN</TableHead>
                    <TableHead>Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedAssets.slice(0, 6).map((asset, index) => (
                    <TableRow key={`${asset.portfolio_id}-${index}`}>
                      <TableCell className="font-mono text-xs">{asset.portfolio_id}</TableCell>
                      <TableCell>{asset.ticker ?? "-"}</TableCell>
                      <TableCell>{asset.isin ?? "-"}</TableCell>
                      <TableCell>{asset.asset_class ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {error && <div className="text-sm text-red-300">{error}</div>}
          <Button onClick={handleUpload} disabled={isUploading || parsedAssets.length === 0} className="w-full">
            Upload Portfolio Assets
          </Button>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Portfolio Assets</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={supabaseReady ? "success" : "warning"}>
                {supabaseReady ? "Live" : "Offline"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2"
              >
                Enrich All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-xs">{asset.portfolio_id ?? "-"}</TableCell>
                  <TableCell>{asset.ticker ?? "-"}</TableCell>
                  <TableCell>{asset.stock_name ?? "-"}</TableCell>
                  <TableCell>{asset.asset_class ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleRowEnrich(asset.id)}>
                        Enrich
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EnrichmentResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={enrichmentResults}
        summary={enrichmentSummary}
        onReEnrich={async (assetId, tickerOverride) => {
          const response = await fetch("/api/portfolio-assets/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "single",
              asset_id: assetId,
              ticker_override: tickerOverride,
              skipEnriched: false
            })
          });
          if (response.ok) {
            router.refresh();
          }
        }}
        onMarkReviewed={async (assetId) => {
          const response = await fetch(`/api/portfolio-assets/${assetId}/mark-reviewed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewed_by: "user" })
          });
          if (response.ok) {
            // Update local state to reflect reviewed status
            setEnrichmentResults((prev) =>
              prev.map((r) =>
                r.asset_id === assetId ? { ...r, status: "updated" as const } : r
              )
            );
            router.refresh();
          }
        }}
      />
    </section>
  );
}
