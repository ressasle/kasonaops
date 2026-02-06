"use client";

import { useMemo, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CSVImportDialogProps = {
  portfolioId: string;
  companyId: number;
  onSuccess: () => void;
};

type ParsedRow = Record<string, string>;

export function CSVImportDialog({ portfolioId, companyId, onSuccess }: CSVImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const headers = useMemo(() => {
    return parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];
  }, [parsedRows]);

  const resetDialog = () => {
    setParsedRows([]);
    setAutoEnrich(true);
    setIsImporting(false);
    setError(null);
    setFileName("");
  };

  const closeDialog = () => {
    setIsOpen(false);
    resetDialog();
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) ?? "";
      const rows = text
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.split(","));

      if (rows.length === 0) {
        setParsedRows([]);
        setError("No rows found in CSV.");
        return;
      }

      const headerRow = rows[0].map((header) => header.trim());
      const data = rows.slice(1).map((row) => {
        return headerRow.reduce<ParsedRow>((acc, header, index) => {
          acc[header] = row[index]?.trim() ?? "";
          return acc;
        }, {});
      });

      setParsedRows(data.filter((row) => Object.values(row).some((value) => value)));
      setError(null);
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    parseCSV(file);
  };

  const handleImport = async () => {
    if (!parsedRows.length) return;
    if (!portfolioId) {
      setError("Portfolio ID is required.");
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      const response = await fetch("/api/portfolio-assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          company_id: companyId,
          assets: parsedRows,
          auto_enrich: autoEnrich
        })
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      onSuccess();
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70"
            onClick={closeDialog}
          />
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Import Portfolio Assets</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV with columns: stock_name, ticker, isin, currency, asset_class
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 p-8 text-center transition-colors hover:border-primary/50">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop CSV here or click to browse</p>
                  <p className="text-xs text-muted-foreground">{fileName || "No file selected"}</p>
                </div>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="sr-only" />
              </label>

              {parsedRows.length > 0 && (
                <div className="rounded-xl border border-border/50 p-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.slice(0, 5).map((row, index) => (
                        <TableRow key={`${row.ticker ?? "row"}-${index}`}>
                          {headers.map((header) => (
                            <TableCell key={`${header}-${index}`}>{row[header] || "-"}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="auto-enrich"
                  type="checkbox"
                  checked={autoEnrich}
                  onChange={(event) => setAutoEnrich(event.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background"
                />
                <Label htmlFor="auto-enrich">Run enrichment after import</Label>
              </div>

              {error && <div className="text-xs text-red-400">{error}</div>}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleImport} disabled={!parsedRows.length || isImporting} className="gap-2">
                {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                Import {parsedRows.length} assets
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
