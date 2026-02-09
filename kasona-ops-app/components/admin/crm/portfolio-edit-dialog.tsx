"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PortfolioAsset } from "@/lib/data/types";

type PortfolioEditDialogProps = {
  assets: PortfolioAsset[];
  onSaved: () => void;
};

type EditableAsset = {
  id: string;
  ticker: string;
  stock_name: string;
  isin: string;
  asset_class: string;
  category: string;
  shares: string;
  avg_cost: string;
};

const toNumberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toEditable = (asset: PortfolioAsset): EditableAsset => ({
  id: asset.id,
  ticker: asset.ticker ?? "",
  stock_name: asset.stock_name ?? "",
  isin: asset.isin ?? "",
  asset_class: asset.asset_class ?? "Other",
  category: asset.category ?? "",
  shares: asset.shares?.toString() ?? "",
  avg_cost: asset.avg_cost?.toString() ?? "",
});

export function PortfolioEditDialog({ assets, onSaved }: PortfolioEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<EditableAsset[]>(() => assets.map(toEditable));

  const initialRows = useMemo(() => assets.map(toEditable), [assets]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setRows(assets.map(toEditable));
      setError(null);
    }
  };

  const handleChange = (id: string, field: keyof EditableAsset, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const dirtyRows = useMemo(() => {
    const initialById = new Map(initialRows.map((row) => [row.id, row]));
    return rows.filter((row) => {
      const initial = initialById.get(row.id);
      if (!initial) return false;
      return (
        row.ticker !== initial.ticker ||
        row.stock_name !== initial.stock_name ||
        row.isin !== initial.isin ||
        row.asset_class !== initial.asset_class ||
        row.category !== initial.category ||
        row.shares !== initial.shares ||
        row.avg_cost !== initial.avg_cost
      );
    });
  }, [initialRows, rows]);

  const handleSave = async () => {
    if (dirtyRows.length === 0) {
      setOpen(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await Promise.all(
        dirtyRows.map(async (row) => {
          const response = await fetch(`/api/portfolio-assets/${row.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticker: row.ticker.trim() || null,
              stock_name: row.stock_name.trim() || null,
              isin: row.isin.trim() || null,
              asset_class: row.asset_class || null,
              category: row.category.trim() || null,
              shares: toNumberOrNull(row.shares),
              avg_cost: toNumberOrNull(row.avg_cost),
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? `Unable to update asset ${row.id}`);
          }
        })
      );

      setOpen(false);
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save updates");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <Pencil className="h-4 w-4" />
          Edit Table
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-6xl">
        <DialogHeader>
          <DialogTitle>Edit Portfolio Assets</DialogTitle>
          <DialogDescription>
            Update tickers, names, classification, and optional tracking fields in one table.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ISIN</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Avg Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><Input value={row.ticker} onChange={(event) => handleChange(row.id, "ticker", event.target.value)} className="h-8" /></TableCell>
                  <TableCell><Input value={row.stock_name} onChange={(event) => handleChange(row.id, "stock_name", event.target.value)} className="h-8 min-w-[200px]" /></TableCell>
                  <TableCell><Input value={row.isin} onChange={(event) => handleChange(row.id, "isin", event.target.value)} className="h-8" /></TableCell>
                  <TableCell>
                    <select
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={row.asset_class}
                      onChange={(event) => handleChange(row.id, "asset_class", event.target.value)}
                    >
                      <option value="Stocks">Stocks</option>
                      <option value="ETF">ETF</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Other">Other</option>
                    </select>
                  </TableCell>
                  <TableCell><Input value={row.category} onChange={(event) => handleChange(row.id, "category", event.target.value)} className="h-8" /></TableCell>
                  <TableCell><Input value={row.shares} onChange={(event) => handleChange(row.id, "shares", event.target.value)} className="h-8" /></TableCell>
                  <TableCell><Input value={row.avg_cost} onChange={(event) => handleChange(row.id, "avg_cost", event.target.value)} className="h-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
