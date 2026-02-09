"use client";

import { useMemo, useState, useCallback } from "react";
import {
    Loader2,
    Upload,
    X,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Image as ImageIcon,
    FileSpreadsheet
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Types
type PortfolioImportDialogProps = {
    portfolioId: string;
    companyId: number;
    onSuccess: () => void;
};

type ExtractedAsset = {
    id: string;
    stock_name: string;
    ticker: string | null;
    isin: string | null;
    currency: string | null;
    asset_class: string;
    category: string | null;
    sector: string | null;
    confidence: "high" | "medium" | "low";
    needs_review: boolean;
    review_note: string | null;
    _isNew?: boolean;
};

type FileCategory = "csv" | "pdf" | "image" | null;

// Constants
const SUPPORTED_TYPES = {
    csv: ["text/csv", "application/csv", "text/plain"],
    pdf: ["application/pdf"],
    image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
};

const ASSET_CLASSES = ["Stocks", "ETF", "Crypto", "Funds", "Bonds", "Other"] as const;

const CURRENCIES = ["EUR", "USD", "CHF", "GBP", "JPY", "CAD", "AUD"] as const;

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 9);

const getFileCategory = (file: File): FileCategory => {
    const mimeType = file.type;
    const extension = file.name.split(".").pop()?.toLowerCase();

    // Check by extension first (more reliable for CSV)
    if (extension === "csv") return "csv";
    if (extension === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "webp"].includes(extension ?? "")) return "image";

    // Fallback to MIME type
    if (SUPPORTED_TYPES.csv.includes(mimeType)) return "csv";
    if (SUPPORTED_TYPES.pdf.includes(mimeType)) return "pdf";
    if (SUPPORTED_TYPES.image.includes(mimeType)) return "image";

    return null;
};

const getFileIcon = (category: FileCategory) => {
    switch (category) {
        case "csv": return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
        case "pdf": return <FileText className="h-5 w-5 text-red-400" />;
        case "image": return <ImageIcon className="h-5 w-5 text-blue-400" />;
        default: return <Upload className="h-5 w-5 text-muted-foreground" />;
    }
};

export function PortfolioImportDialog({
    portfolioId,
    companyId,
    onSuccess
}: PortfolioImportDialogProps) {
    // Dialog state
    const [isOpen, setIsOpen] = useState(false);

    // File state
    const [fileName, setFileName] = useState("");
    const [fileCategory, setFileCategory] = useState<FileCategory>(null);

    // Data state
    const [assets, setAssets] = useState<ExtractedAsset[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Options
    const [autoEnrich, setAutoEnrich] = useState(true);

    // Error/feedback
    const [error, setError] = useState<string | null>(null);
    const [extractionNote, setExtractionNote] = useState<string | null>(null);

    // Computed values
    const needsReviewCount = useMemo(() =>
        assets.filter(a => a.needs_review).length,
        [assets]
    );

    const highConfidenceCount = useMemo(() =>
        assets.filter(a => a.confidence === "high").length,
        [assets]
    );

    // Reset dialog state
    const resetDialog = useCallback(() => {
        setAssets([]);
        setAutoEnrich(true);
        setIsExtracting(false);
        setIsImporting(false);
        setError(null);
        setExtractionNote(null);
        setFileName("");
        setFileCategory(null);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        resetDialog();
    }, [resetDialog]);

    // CSV Parsing (local, fast)
    const parseCSV = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = (event.target?.result as string) ?? "";
                const rows = text
                    .split(/\r?\n/)
                    .map((row) => row.trim())
                    .filter(Boolean)
                    .map((row) => row.split(","));

                if (rows.length === 0) {
                    setError("No rows found in CSV.");
                    return;
                }

                const headerRow = rows[0].map((h) => h.trim().toLowerCase());
                const data = rows.slice(1).map((row) => {
                    const asset: ExtractedAsset = {
                        id: generateId(),
                        stock_name: "",
                        ticker: null,
                        isin: null,
                        currency: null,
                        asset_class: "Other",
                        category: null,
                        sector: null,
                        confidence: "high",
                        needs_review: false,
                        review_note: null,
                    };

                    headerRow.forEach((header, index) => {
                        const value = row[index]?.trim() ?? "";
                        if (!value) return;

                        // Flexible header mapping
                        if (["stock_name", "name", "bezeichnung", "wertpapier", "holding"].includes(header)) {
                            asset.stock_name = value;
                        } else if (["ticker", "symbol", "kürzel"].includes(header)) {
                            asset.ticker = value;
                        } else if (["isin"].includes(header)) {
                            asset.isin = value;
                        } else if (["currency", "währung", "curr"].includes(header)) {
                            asset.currency = value.toUpperCase();
                        } else if (["asset_class", "type", "typ", "kategorie"].includes(header)) {
                            asset.asset_class = normalizeAssetClass(value);
                        } else if (["category", "gruppe", "subcategory"].includes(header)) {
                            asset.category = value;
                        } else if (["sector", "branche", "sektor"].includes(header)) {
                            asset.sector = value;
                        }
                    });

                    // Mark for review if missing critical data
                    if (!asset.stock_name) {
                        asset.needs_review = true;
                        asset.review_note = "Missing name";
                        asset.confidence = "low";
                    }

                    return asset;
                });

                setAssets(data.filter((a) => a.stock_name || a.ticker || a.isin));
                setExtractionNote(`Parsed ${data.length} rows from CSV`);
                setError(null);
            } catch (e) {
                setError("Failed to parse CSV file");
            }
        };
        reader.readAsText(file);
    }, []);

    // PDF/Image extraction via Gemini API
    const extractWithGemini = useCallback(async (file: File) => {
        setIsExtracting(true);
        setError(null);
        setExtractionNote(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileType", fileCategory ?? "unknown");

            const response = await fetch("/api/portfolio-assets/extract", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Extraction failed");
            }

            const result = await response.json();

            if (result.data && Array.isArray(result.data)) {
                const extractedAssets: ExtractedAsset[] = result.data.map((item: any) => ({
                    id: generateId(),
                    stock_name: item.stock_name || item.name || "",
                    ticker: item.ticker || null,
                    isin: item.isin || null,
                    currency: item.currency || null,
                    asset_class: normalizeAssetClass(item.asset_class),
                    category: item.category || null,
                    sector: item.sector || null,
                    confidence: item.confidence || "medium",
                    needs_review: item.needs_review || false,
                    review_note: item.review_note || null,
                }));

                setAssets(extractedAssets);
                setExtractionNote(result.extraction_note || `Extracted ${extractedAssets.length} assets`);
            } else {
                setError("No assets found in document");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Extraction failed");
        } finally {
            setIsExtracting(false);
        }
    }, [fileCategory]);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const category = getFileCategory(file);
        if (!category) {
            setError("Unsupported file type. Please upload CSV, PDF, or image files.");
            return;
        }

        setFileName(file.name);
        setFileCategory(category);
        setAssets([]);
        setError(null);

        // Route based on file type
        if (category === "csv") {
            parseCSV(file);
        } else {
            extractWithGemini(file);
        }
    }, [parseCSV, extractWithGemini]);

    // Edit handlers
    const updateAsset = useCallback((id: string, field: keyof ExtractedAsset, value: string) => {
        setAssets(prev => prev.map(asset =>
            asset.id === id
                ? {
                    ...asset,
                    [field]: value,
                    needs_review: field === "stock_name" && !value ? true : asset.needs_review,
                }
                : asset
        ));
    }, []);

    const deleteAsset = useCallback((id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id));
    }, []);

    const addNewAsset = useCallback(() => {
        const newAsset: ExtractedAsset = {
            id: generateId(),
            stock_name: "",
            ticker: null,
            isin: null,
            currency: "EUR",
            asset_class: "Other",
            category: null,
            sector: null,
            confidence: "high",
            needs_review: true,
            review_note: "Manually added - please fill in details",
            _isNew: true,
        };
        setAssets(prev => [...prev, newAsset]);
    }, []);

    // Handle import
    const handleImport = async () => {
        if (!assets.length) return;
        if (!portfolioId) {
            setError("Portfolio ID is required.");
            return;
        }

        // Warn if items need review
        const reviewItems = assets.filter(a => a.needs_review);
        if (reviewItems.length > 0) {
            const names = reviewItems.map(a => a.stock_name || "(unnamed)").join(", ");
            if (!confirm(`${reviewItems.length} items need review: ${names}\n\nImport anyway?`)) {
                return;
            }
        }

        setIsImporting(true);
        setError(null);

        try {
            const payload = assets.map(({ id, confidence, needs_review, review_note, _isNew, ...rest }) => rest);

            const response = await fetch("/api/portfolio-assets/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    portfolio_id: portfolioId,
                    company_id: companyId,
                    assets: payload,
                    auto_enrich: autoEnrich,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Import failed");
            }

            onSuccess();
            closeDialog();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Import failed");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <>
            <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
                <Upload className="h-4 w-4" />
                Import Assets
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <button
                        type="button"
                        aria-label="Close"
                        className="absolute inset-0 bg-black/70"
                        onClick={closeDialog}
                    />

                    <div className="glass-panel relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 p-6 border-b border-border/50">
                            <div>
                                <h2 className="text-lg font-semibold">Import Portfolio Assets</h2>
                                <p className="text-sm text-muted-foreground">
                                    Upload CSV, PDF statement, or screenshot • AI-powered extraction
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeDialog}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* File Upload Zone */}
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                                {fileName ? (
                                    <>
                                        {getFileIcon(fileCategory)}
                                        <div>
                                            <p className="text-sm font-medium">{fileName}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {fileCategory} file • Click to change
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Drop file here or click to browse
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                CSV, PDF, PNG, JPG, WEBP
                                            </p>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept=".csv,.pdf,.png,.jpg,.jpeg,.webp"
                                    onChange={handleFileUpload}
                                    className="sr-only"
                                />
                            </label>

                            {/* Extraction Loading State */}
                            {isExtracting && (
                                <div className="flex items-center justify-center gap-3 py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        Analyzing document with AI...
                                    </span>
                                </div>
                            )}

                            {/* Extraction Notes */}
                            {extractionNote && !isExtracting && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    {extractionNote}
                                    {needsReviewCount > 0 && (
                                        <span className="ml-auto flex items-center gap-1 text-yellow-500">
                                            <AlertTriangle className="h-4 w-4" />
                                            {needsReviewCount} need review
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Editable Preview Table */}
                            {assets.length > 0 && !isExtracting && (
                                <div className="rounded-xl border border-border/50 overflow-hidden">
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
                                                <TableRow>
                                                    <TableHead className="w-10"></TableHead>
                                                    <TableHead>Name *</TableHead>
                                                    <TableHead>Ticker</TableHead>
                                                    <TableHead>ISIN</TableHead>
                                                    <TableHead>Currency</TableHead>
                                                    <TableHead>Asset Class</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead className="w-10"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {assets.map((asset) => (
                                                    <TableRow
                                                        key={asset.id}
                                                        className={asset.needs_review ? "bg-yellow-500/5" : ""}
                                                    >
                                                        <TableCell>
                                                            {asset.needs_review ? (
                                                                <span title={asset.review_note || "Needs review"}>
                                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                                </span>
                                                            ) : (
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={asset.stock_name}
                                                                onChange={(e) => updateAsset(asset.id, "stock_name", e.target.value)}
                                                                placeholder="Asset name"
                                                                className="h-8 text-sm"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={asset.ticker ?? ""}
                                                                onChange={(e) => updateAsset(asset.id, "ticker", e.target.value)}
                                                                placeholder="e.g. AAPL"
                                                                className="h-8 text-sm w-24"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={asset.isin ?? ""}
                                                                onChange={(e) => updateAsset(asset.id, "isin", e.target.value)}
                                                                placeholder="e.g. US0378331005"
                                                                className="h-8 text-sm w-32"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={asset.currency ?? ""}
                                                                onValueChange={(v: string) => updateAsset(asset.id, "currency", v)}
                                                            >
                                                                <SelectTrigger className="h-8 text-sm w-20">
                                                                    <SelectValue placeholder="—" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CURRENCIES.map((c) => (
                                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={asset.asset_class}
                                                                onValueChange={(v: string) => updateAsset(asset.id, "asset_class", v)}
                                                            >
                                                                <SelectTrigger className="h-8 text-sm w-24">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {ASSET_CLASSES.map((c) => (
                                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={asset.category ?? ""}
                                                                onChange={(e) => updateAsset(asset.id, "category", e.target.value)}
                                                                placeholder="e.g. Growth"
                                                                className="h-8 text-sm w-28"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                onClick={() => deleteAsset(asset.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Add Row Button */}
                                    <div className="p-3 border-t border-border/50 bg-muted/20">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-muted-foreground"
                                            onClick={addNewAsset}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add missing asset
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Auto-enrich Checkbox */}
                            {assets.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <input
                                        id="auto-enrich"
                                        type="checkbox"
                                        checked={autoEnrich}
                                        onChange={(e) => setAutoEnrich(e.target.checked)}
                                        className="h-4 w-4 rounded border-border bg-background"
                                    />
                                    <Label htmlFor="auto-enrich">
                                        Run enrichment after import (adds descriptions, sectors, etc.)
                                    </Label>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 p-6 border-t border-border/50 bg-muted/10">
                            <div className="text-sm text-muted-foreground">
                                {assets.length > 0 && (
                                    <>
                                        {assets.length} asset{assets.length !== 1 ? "s" : ""} ready
                                        {highConfidenceCount > 0 && (
                                            <span className="text-green-500 ml-2">
                                                ({highConfidenceCount} high confidence)
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={closeDialog}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={!assets.length || isImporting || isExtracting}
                                    className="gap-2"
                                >
                                    {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Import {assets.length} asset{assets.length !== 1 ? "s" : ""}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper function to normalize asset class values
function normalizeAssetClass(value?: string): string {
    if (!value) return "Other";
    const cleaned = value.toLowerCase();
    if (cleaned.includes("crypto") || cleaned.includes("krypto")) return "Crypto";
    if (cleaned.includes("etf")) return "ETF";
    if (cleaned.includes("fund") || cleaned.includes("fonds")) return "Funds";
    if (cleaned.includes("stock") || cleaned.includes("equit") || cleaned.includes("aktie")) return "Stocks";
    if (cleaned.includes("bond") || cleaned.includes("anleihe")) return "Bonds";
    return "Other";
}
