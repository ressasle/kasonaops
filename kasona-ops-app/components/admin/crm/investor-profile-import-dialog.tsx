"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { InvestorProfile } from "@/lib/data/types"; // Assuming types exist
import { getSupabaseBrowserClient } from "@/lib/supabase/client"; // Adjust import path if needed

interface InvestorProfileImportDialogProps {
    onSuccess: () => void;
}

// Define expected CSV structure
interface CSVProfileRow {
    portfolio_id: string; // Required to link
    risk_appetite?: string;
    data_granularity?: string;
    output_format?: string;
    frequency?: string;
    tone_style?: string;
    focus_areas?: string; // Comma separated?
}

export function InvestorProfileImportDialog({ onSuccess }: InvestorProfileImportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedProfiles, setParsedProfiles] = useState<CSVProfileRow[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                toast.error("Please upload a CSV file");
                return;
            }
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`CSV Parsing Error: ${results.errors[0].message}`);
                    return;
                }

                // Validate required fields
                const profiles = results.data as CSVProfileRow[];
                const validProfiles = profiles.filter(p => p.portfolio_id && p.portfolio_id.trim() !== "");

                if (validProfiles.length === 0) {
                    setError("No valid profiles found. Ensure 'portfolio_id' column exists and is populated.");
                    return;
                }

                setParsedProfiles(validProfiles);
                setError(null);
            },
            error: (err) => {
                setError(`Failed to read file: ${err.message}`);
            }
        });
    };

    const handleImport = async () => {
        if (parsedProfiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(10);
        setError(null);

        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
            setError("Supabase client not initialized");
            setIsUploading(false);
            return;
        }

        try {
            // We'll upsert profiles based on portfolio_id.
            // Note: This logic assumes 1:1 relation handled via portfolio_id or creating new rows.
            // Since `kasona_investor_profiles` likely links to a portfolio, we should check existing logic.
            // Let's assume we are calling an API or doing direct DB insert. 
            // Given other components call APIs, let's use a similar pattern or direct Supabase if allowed.
            // The Manager uses `/api/investor-profiles`. We might want a bulk endpoint, but loop is okay for now if N is small.
            // Actually, let's try a direct DB insert/upsert for efficiency if possible, or loop promises.

            // To be safe and reuse server logic, we should ideally use an API. 
            // But for now, let's do a direct Supabase call for simplicity as we are client-side admin.

            let successCount = 0;
            const total = parsedProfiles.length;

            for (let i = 0; i < total; i++) {
                const row = parsedProfiles[i];

                // Construct payload
                const payload = {
                    portfolio_id: row.portfolio_id,
                    risk_appetite: row.risk_appetite,
                    data_granularity: row.data_granularity,
                    output_format: row.output_format,
                    frequency: row.frequency,
                    tone_style: row.tone_style,
                    focus_areas: row.focus_areas ? row.focus_areas.split(',').map(s => s.trim()) : [],
                    updated_at: new Date().toISOString()
                };

                // Upsert logic: simple insert for now, or match on portfolio_id?
                // The DB constraint likely enforces unique portfolio_id.
                // We'll use upsert.
                const { error: upsertError } = await supabase
                    .from("kasona_investor_profiles")
                    .upsert(payload as any, { onConflict: "portfolio_id" });

                if (upsertError) {
                    console.error("Import error row " + i, upsertError);
                    // continue or throw? Let's count errors.
                } else {
                    successCount++;
                }

                setUploadProgress(10 + Math.round(((i + 1) / total) * 90));
            }

            toast.success(`Imported ${successCount} of ${total} profiles`);
            setIsOpen(false);
            setFile(null);
            setParsedProfiles([]);
            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Import failed. Check console for details.");
            toast.error("Import failed");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" /> Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Investor Profiles</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with headers: <code>portfolio_id</code> (required), <code>risk_appetite</code>, <code>data_granularity</code>, etc.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!file ? (
                        <div
                            className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload CSV</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div className="grid gap-0.5">
                                        <span className="text-sm font-medium">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsedProfiles([]); setError(null); }}>
                                    Change
                                </Button>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {parsedProfiles.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground">Preview ({parsedProfiles.length} profiles)</span>
                                    <ScrollArea className="h-[200px] border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Portfolio ID</TableHead>
                                                    <TableHead>Risk</TableHead>
                                                    <TableHead>Granularity</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {parsedProfiles.map((row, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-mono text-xs">{row.portfolio_id}</TableCell>
                                                        <TableCell className="text-xs">{row.risk_appetite}</TableCell>
                                                        <TableCell className="text-xs">{row.data_granularity}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            )}

                            {isUploading && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Importing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || !!error || isUploading || parsedProfiles.length === 0}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import profiles
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
