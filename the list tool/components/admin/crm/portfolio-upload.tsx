"use client";

import { useState, useCallback } from "react";
import { Loader2, Upload, FileText, CheckCircle, Trash2, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PortfolioUploadProps = {
    companyId: number;
    portfolioId?: string | null;
    onComplete: () => void;
};

type Asset = {
    stock_name: string;
    ticker?: string;
    isin?: string;
    shares?: number | string;
    avgCost?: number | string;
    asset_class?: string;
    sector?: string;
    currency?: string;
};

const EMPTY_HOLDING: Asset = {
    stock_name: "",
    ticker: "",
    isin: "",
    shares: "",
    avgCost: "",
    asset_class: "Stocks",
    sector: "",
    currency: ""
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
        };
        reader.onerror = (error) => reject(error);
    });

export function PortfolioUpload({ companyId, portfolioId, onComplete }: PortfolioUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<Asset[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadMode, setUploadMode] = useState<"upload" | "manual">("upload");
    const [manualHolding, setManualHolding] = useState<Asset>(EMPTY_HOLDING);
    const [manualHoldings, setManualHoldings] = useState<Asset[]>([]);
    const [portfolioSlug, setPortfolioSlug] = useState<string>(portfolioId ?? "");

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Please upload a PDF file.");
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleHoldingChange = (field: keyof Asset) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setManualHolding((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const addManualHolding = () => {
        if (!manualHolding.ticker && !manualHolding.stock_name) return;
        setManualHoldings((prev) => [
            ...prev,
            {
                ...manualHolding,
                ticker: manualHolding.ticker?.toString().trim() || undefined,
                stock_name: manualHolding.stock_name?.toString().trim() || manualHolding.ticker || ""
            }
        ]);
        setManualHolding(EMPTY_HOLDING);
    };

    const processFile = async () => {
        if (!file) return;
        if (!portfolioSlug.trim()) {
            setError("Please provide a portfolio ID first.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const base64 = await fileToBase64(file);
            const response = await fetch("/api/portfolio-assets/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file: base64, filename: file.name, mimetype: file.type })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to extract data");
            }

            const result = await response.json();
            setExtractedData(result.holdings ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Extraction failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const saveAssets = async () => {
        const portfolioIdToUse = portfolioSlug.trim();
        if (!portfolioIdToUse) {
            setError("Please provide a portfolio ID first.");
            return;
        }

        const assetsToSave = extractedData ?? manualHoldings;
        if (!assetsToSave || assetsToSave.length === 0) return;

        setIsProcessing(true);
        try {
            const response = await fetch("/api/portfolio-assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assets: assetsToSave.map((asset) => ({
                        portfolio_id: portfolioIdToUse,
                        company_id: companyId,
                        ticker: asset.ticker || null,
                        stock_name: asset.stock_name || null,
                        isin: asset.isin || null,
                        asset_class: asset.asset_class || null,
                        sector: asset.sector || null,
                        currency: asset.currency || null,
                        owner_comment: [
                            asset.shares ? `shares: ${asset.shares}` : null,
                            asset.avgCost ? `avgCost: ${asset.avgCost}` : null
                        ]
                            .filter(Boolean)
                            .join(", ") || null
                    }))
                })
            });

            if (!response.ok) throw new Error("Failed to save assets");

            onComplete();
        } catch (err) {
            setError("Failed to save confirmed assets");
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className={cn(
                "border-2 border-dashed transition-all duration-200",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                extractedData ? "opacity-50 pointer-events-none" : ""
            )}>
                <CardContent
                    className="flex flex-col items-center justify-center py-12 text-center"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="mb-6 flex items-center gap-2">
                        <Button variant={uploadMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setUploadMode("upload")}>
                            Upload
                        </Button>
                        <Button variant={uploadMode === "manual" ? "default" : "outline"} size="sm" onClick={() => setUploadMode("manual")}>
                            Manual
                        </Button>
                    </div>
                    <div className="mb-6 w-full max-w-sm space-y-2 text-left">
                        <Label>Portfolio ID</Label>
                        <Input value={portfolioSlug} onChange={(e) => setPortfolioSlug(e.target.value)} placeholder="e.g. 261001-A" />
                    </div>

                    {uploadMode === "manual" && (
                        <div className="w-full max-w-sm space-y-4 text-left">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ticker</Label>
                                    <Input value={manualHolding.ticker ?? ""} onChange={handleHoldingChange("ticker")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={manualHolding.stock_name ?? ""} onChange={handleHoldingChange("stock_name")} />
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>ISIN</Label>
                                    <Input value={manualHolding.isin ?? ""} onChange={handleHoldingChange("isin")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Asset Class</Label>
                                    <select
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={manualHolding.asset_class ?? "Stocks"}
                                        onChange={handleHoldingChange("asset_class")}
                                    >
                                        <option value="Stocks">Stocks</option>
                                        <option value="ETF">ETF</option>
                                        <option value="Crypto">Crypto</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Shares</Label>
                                    <Input value={manualHolding.shares ?? ""} onChange={handleHoldingChange("shares")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Avg Cost</Label>
                                    <Input value={manualHolding.avgCost ?? ""} onChange={handleHoldingChange("avgCost")} />
                                </div>
                            </div>
                            <Button type="button" onClick={addManualHolding} className="w-full">
                                <Plus className="h-4 w-4" /> Add Holding
                            </Button>
                        </div>
                    )}

                    {uploadMode === "upload" && (
                        <>
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                        <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">Upload Portfolio</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
                        Drag and drop your PDF report or CSV here. AI will extract holdings.
                    </p>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                    />

                    <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                        Select File
                    </Button>

                    {file && (
                        <div className="mt-6 flex items-center gap-3 rounded-lg border bg-background p-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div className="text-sm font-medium">{file.name}</div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    )}

                    {file && !isProcessing && !extractedData && (
                        <Button className="mt-4 w-full max-w-[200px]" onClick={processFile}>
                            Process File
                        </Button>
                    )}

                    {isProcessing && (
                        <div className="mt-4 flex flex-col items-center text-sm text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mb-2" />
                            Analyzing document...
                        </div>
                    )}
                        </>
                    )}

                    {error && <div className="mt-4 text-sm text-red-400 bg-red-400/10 p-2 rounded">{error}</div>}
                </CardContent>
            </Card>

            <Card className="h-full overflow-hidden">
                <CardContent className="h-full p-6 flex flex-col">
                    {!extractedData && manualHoldings.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground py-12">
                            <Database className="mb-4 h-12 w-12 opacity-20" />
                            <p>Extracted assets will appear here for review.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Review Extraction
                                </h3>
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-mono">
                                    {(extractedData ?? manualHoldings).length} items
                                </span>
                            </div>

                            <div className="flex-1 overflow-auto rounded-xl border bg-muted/30 p-2 space-y-2 max-h-[450px]">
                                {(extractedData ?? manualHoldings).map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 bg-background rounded-lg border border-border/50 items-center shadow-sm">
                                        <div className="col-span-12 md:col-span-6">
                                            <div className="font-semibold truncate">{item.stock_name || "Unknown Asset"}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono flex gap-2">
                                                {item.ticker && <span>Ticker: {item.ticker}</span>}
                                                {item.isin && <span>ISIN: {item.isin}</span>}
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-3 text-xs text-muted-foreground italic">
                                            {item.asset_class || "Other"}
                                        </div>
                                        <div className="col-span-6 md:col-span-3 text-right font-bold text-primary">
                                            {item.shares && `${item.shares} shares`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                                <Button variant="outline" onClick={() => { setExtractedData(null); setFile(null); setManualHoldings([]); }}>
                                    Discard
                                </Button>
                                <Button onClick={saveAssets} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Import"}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
