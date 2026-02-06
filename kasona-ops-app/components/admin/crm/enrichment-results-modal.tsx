"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export type EnrichmentResult = {
    asset_id: string;
    portfolio_id: string | null;
    stock_name: string | null;
    ticker_eod: string | null;
    status: "updated" | "skipped" | "error" | "created";
    error?: string;
};

type EnrichmentResultsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    results: EnrichmentResult[];
    summary: {
        total: number;
        enriched: number;
        skipped: number;
        errors: number;
    };
    onReEnrich: (assetId: string, tickerOverride?: string) => Promise<void>;
    onMarkReviewed?: (assetId: string) => Promise<void>;
};

export function EnrichmentResultsModal({
    isOpen,
    onClose,
    results,
    summary,
    onReEnrich,
    onMarkReviewed
}: EnrichmentResultsModalProps) {
    const [tickerOverrides, setTickerOverrides] = useState<Record<string, string>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [filter, setFilter] = useState<"all" | "errors" | "skipped" | "updated">("all");

    if (!isOpen) return null;

    const filteredResults = results.filter((r) => {
        if (filter === "all") return true;
        if (filter === "errors") return r.status === "error";
        if (filter === "skipped") return r.status === "skipped";
        if (filter === "updated") return r.status === "updated" || r.status === "created";
        return true;
    });

    const getStatusBadge = (status: EnrichmentResult["status"]) => {
        switch (status) {
            case "updated":
            case "created":
                return <Badge variant="success">✓ Enriched</Badge>;
            case "skipped":
                return <Badge variant="default">⊘ Skipped</Badge>;
            case "error":
                return <Badge variant="danger">✗ Error</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleReEnrich = async (assetId: string) => {
        setLoadingStates((prev) => ({ ...prev, [assetId]: true }));
        try {
            await onReEnrich(assetId, tickerOverrides[assetId] || undefined);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [assetId]: false }));
        }
    };

    const handleMarkReviewed = async (assetId: string) => {
        if (!onMarkReviewed) return;
        setLoadingStates((prev) => ({ ...prev, [assetId]: true }));
        try {
            await onMarkReviewed(assetId);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [assetId]: false }));
        }
    };

    const successRate = summary.total > 0 ? Math.round(((summary.enriched + summary.skipped) / summary.total) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                <CardHeader className="p-6 border-b border-border/40">
                    <CardTitle className="flex items-center justify-between">
                        <span>Enrichment Results</span>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            ✕
                        </Button>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{summary.total}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">{summary.enriched}</div>
                            <div className="text-xs text-muted-foreground">Enriched</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{summary.skipped}</div>
                            <div className="text-xs text-muted-foreground">Skipped</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-rose-400">{summary.errors}</div>
                            <div className="text-xs text-muted-foreground">Errors</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Success Rate</span>
                            <span>{successRate}%</span>
                        </div>
                        <Progress value={successRate} />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                            All ({results.length})
                        </Button>
                        <Button variant={filter === "updated" ? "default" : "outline"} size="sm" onClick={() => setFilter("updated")}>
                            Enriched ({summary.enriched})
                        </Button>
                        <Button variant={filter === "skipped" ? "default" : "outline"} size="sm" onClick={() => setFilter("skipped")}>
                            Skipped ({summary.skipped})
                        </Button>
                        <Button variant={filter === "errors" ? "default" : "outline"} size="sm" onClick={() => setFilter("errors")}>
                            Errors ({summary.errors})
                        </Button>
                    </div>

                    {/* Results List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {filteredResults.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">No results to display</div>
                        )}
                        {filteredResults.map((result) => (
                            <div
                                key={result.asset_id}
                                className="rounded-2xl border border-border/60 p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{result.stock_name ?? "Unknown"}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {result.ticker_eod ?? "No ticker"} • {result.portfolio_id ?? "N/A"}
                                        </div>
                                    </div>
                                    {getStatusBadge(result.status)}
                                </div>

                                {result.error && (
                                    <div className="text-sm text-rose-300 bg-rose-500/10 rounded-lg px-3 py-2">
                                        {result.error}
                                    </div>
                                )}

                                {result.status === "error" && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Enter correct ticker (e.g., AAPL.US)"
                                            value={tickerOverrides[result.asset_id] ?? ""}
                                            onChange={(e) =>
                                                setTickerOverrides((prev) => ({
                                                    ...prev,
                                                    [result.asset_id]: e.target.value
                                                }))
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleReEnrich(result.asset_id)}
                                            disabled={loadingStates[result.asset_id]}
                                        >
                                            {loadingStates[result.asset_id] ? "..." : "Re-Enrich"}
                                        </Button>
                                        {onMarkReviewed && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMarkReviewed(result.asset_id)}
                                                disabled={loadingStates[result.asset_id]}
                                            >
                                                Mark OK
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {result.status === "skipped" && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReEnrich(result.asset_id)}
                                            disabled={loadingStates[result.asset_id]}
                                        >
                                            {loadingStates[result.asset_id] ? "..." : "Force Re-Enrich"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>

                <div className="p-6 border-t border-border/40">
                    <Button onClick={onClose} className="w-full">
                        Done
                    </Button>
                </div>
            </Card>
        </div>
    );
}
