"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Trash2,
  RefreshCw
} from "lucide-react";

import type { PortfolioAsset } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrichmentResultsModal, type EnrichmentResult } from "./enrichment-results-modal";
import { PortfolioImportDialog } from "./portfolio-import-dialog";

type PortfolioAssetsManagerProps = {
  assets: PortfolioAsset[];
  supabaseReady: boolean;
  portfolioId?: string;
  companyId?: number;
};

export function PortfolioAssetsManager({ assets, supabaseReady, portfolioId = "", companyId = 0 }: PortfolioAssetsManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);

  // Filter State
  const [showNeedsReview, setShowNeedsReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Enrichment State
  const [enrichAsset, setEnrichAsset] = useState({
    stock_name: "",
    exchange: ""
  });
  const [batchEnrich, setBatchEnrich] = useState({
    portfolio_id: portfolioId, // Default to current
    company_id: companyId.toString(),
    customer_id: ""
  });
  const [skipEnriched, setSkipEnriched] = useState(true);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [enrichmentResults, setEnrichmentResults] = useState<EnrichmentResult[]>([]);
  const [enrichmentSummary, setEnrichmentSummary] = useState({ total: 0, enriched: 0, skipped: 0, errors: 0 });
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Filter Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 1. Text Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        asset.stock_name?.toLowerCase().includes(searchLower) ||
        asset.ticker?.toLowerCase().includes(searchLower) ||
        asset.isin?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Needs Review Filter
      // Condition: Missing essential data OR flagged as error
      if (showNeedsReview) {
        const isMissingTicker = !asset.ticker_eod && !asset.ticker;
        const isErrorStatus = asset.owner_comment?.includes("error") || false;
        return isMissingTicker || isErrorStatus;
      }

      return true;
    });
  }, [assets, searchQuery, showNeedsReview]);

  const handleEnrichChange =
    (field: keyof typeof enrichAsset) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnrichAsset((prev) => ({
          ...prev,
          [field]: event.target.value
        }));
      };

  const handleBatchChange =
    (field: keyof typeof batchEnrich) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setBatchEnrich((prev) => ({
        ...prev,
        [field]: event.target.value
      }));
    };

  const handleEnrich = async () => {
    if (!supabaseReady) {
      toast.error("Supabase is not configured");
      return;
    }

    if (!enrichAsset.stock_name.trim()) {
      toast.error("Stock name is required");
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
          portfolio_id: portfolioId,
          company_id: companyId,
          stock_name: enrichAsset.stock_name.trim(),
          exchange: enrichAsset.exchange.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Enrichment failed");
      }

      setEnrichAsset(prev => ({ ...prev, stock_name: "", exchange: "" }));
      toast.success("Asset enriched successfully");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Enrichment failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleBatchEnrich = async (mode: "portfolio" | "company" | "customer") => {
    if (!supabaseReady) {
      toast.error("Supabase is not configured");
      return;
    }

    // Validation
    if (mode === "portfolio" && !batchEnrich.portfolio_id.trim()) {
      toast.error("Portfolio ID is required");
      return;
    }

    setIsEnriching(true);
    setEnrichmentProgress(10);
    setError(null);

    try {
      const payload = {
        mode,
        portfolio_id: batchEnrich.portfolio_id.trim() || undefined,
        company_id: Number(batchEnrich.company_id) || undefined,
        customer_id: Number(batchEnrich.customer_id) || undefined,
        skipEnriched
      };

      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setEnrichmentProgress(80);

      if (!response.ok) {
        throw new Error("Batch enrichment failed");
      }

      const data = await response.json();
      setEnrichmentProgress(100);

      setEnrichmentResults(data.results ?? []);
      setEnrichmentSummary({
        total: data.total ?? 0,
        enriched: data.enriched ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0
      });

      // Notification Logic
      if ((data.errors ?? 0) > 0) {
        toast.warning(`Enrichment complete with ${data.errors} errors. Please review.`);
      } else {
        toast.success(`Enrichment complete. ${data.enriched} assets enriched.`);
      }

      setShowResultsModal(true);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Batch enrichment failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleRowEnrich = async (assetId: string) => {
    if (!supabaseReady) return;

    setIsEnriching(true);
    const toastId = toast.loading("Enriching asset...");

    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          asset_id: assetId
        })
      });

      if (!response.ok) throw new Error("Failed");

      toast.success("Enriched", { id: toastId });
      router.refresh();
    } catch (err) {
      toast.error("Failed to enrich", { id: toastId });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Delete this asset?")) return;

    const toastId = toast.loading("Deleting...");
    try {
      const response = await fetch(`/api/portfolio-assets/${assetId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed");

      toast.success("Deleted", { id: toastId });
      router.refresh();
    } catch (err) {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const handleImportSuccess = () => {
    toast.success("Assets imported successfully");
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Column: Import & Quick Add */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg">Input Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 1. Import Dialog */}
              <div className="rounded-xl border border-border/50 p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">Import Assets</Label>
                  <PortfolioImportDialog
                    portfolioId={portfolioId}
                    companyId={companyId}
                    onSuccess={handleImportSuccess}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports CSV, Bank Statements (PDF), and Screenshots.
                </p>
              </div>

              {/* 2. Manual Quick Add (Simplified Enrich Form) */}
              <div className="rounded-xl border border-border/50 p-4">
                <Label className="font-semibold mb-3 block">Quick Add (Smart Search)</Label>
                <div className="space-y-3">
                  <Input
                    placeholder="Stock Name (e.g. Apple)"
                    value={enrichAsset.stock_name}
                    onChange={handleEnrichChange("stock_name")}
                  />
                  <Input
                    placeholder="Exchange (e.g. US) - Optional"
                    value={enrichAsset.exchange}
                    onChange={handleEnrichChange("exchange")}
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleEnrich}
                    disabled={isEnriching}
                  >
                    {isEnriching && <RefreshCw className="mr-2 h-3 w-3 animate-spin" />}
                    Add & Enrich
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Actions */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg">Batch Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Company ID</Label>
                  <Input
                    value={batchEnrich.company_id}
                    onChange={handleBatchChange("company_id")}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Customer ID</Label>
                  <Input
                    value={batchEnrich.customer_id}
                    onChange={handleBatchChange("customer_id")}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchEnrich("portfolio")}
                  disabled={isEnriching}
                >
                  Enrich This Portfolio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchEnrich("company")}
                  disabled={isEnriching}
                >
                  Enrich All (Company)
                </Button>
              </div>

              {isEnriching && enrichmentProgress > 0 && (
                <Progress value={enrichmentProgress} className="h-1" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Asset List */}
        <div className="w-full lg:w-2/3">
          <Card className="h-full">
            <CardHeader className="border-b border-border/50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Portfolio Assets</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{assets.length} Total</Badge>
                    <Badge variant={supabaseReady ? "success" : "warning"}>
                      {supabaseReady ? "DB Connected" : "DB Offline"}
                    </Badge>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-[150px] pl-9 lg:w-[200px]"
                    />
                  </div>
                  <Button
                    variant={showNeedsReview ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowNeedsReview(!showNeedsReview)}
                    className="gap-2"
                  >
                    <Filter className="h-3 w-3" />
                    Review
                    {showNeedsReview && <span className="ml-1 rounded-full bg-white/20 px-1 text-[10px]">{filteredAssets.length}</span>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[800px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background hover:bg-background">
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No assets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-mono font-medium">{asset.ticker || asset.ticker_eod || "—"}</span>
                              {asset.isin && <span className="text-[10px] text-muted-foreground">{asset.isin}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col max-w-[200px]">
                              <span className="truncate" title={asset.stock_name ?? ""}>{asset.stock_name ?? "Unknown"}</span>
                              {!asset.ticker_eod && !asset.ticker && (
                                <span className="flex items-center gap-1 text-[10px] text-red-400">
                                  <AlertTriangle className="h-3 w-3" /> Missing Ticker
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{asset.asset_class ?? "Other"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleRowEnrich(asset.id)}>
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(asset.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {showResultsModal && (
          <EnrichmentResultsModal
            isOpen={showResultsModal}
            onClose={() => setShowResultsModal(false)}
            results={enrichmentResults}
            summary={enrichmentSummary}
            onReEnrich={() => handleBatchEnrich("portfolio")}
          />
        )}
      </div>
    </section>
  );
}
