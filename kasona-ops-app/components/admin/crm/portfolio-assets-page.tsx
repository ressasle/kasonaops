"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { PortfolioImportDialog } from "@/components/admin/crm/portfolio-import-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

type PortfolioAssetsPageProps = {
  customer: CustomerBasicInfo;
  profiles: InvestorProfile[];
  assets: PortfolioAsset[];
};

export function PortfolioAssetsPage({ customer, profiles, assets }: PortfolioAssetsPageProps) {
  const router = useRouter();
  const [isEnriching, setIsEnriching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activePortfolio, setActivePortfolio] = useState(profiles[0]?.portfolio_id ?? "");

  const portfolioOptions = useMemo(() => {
    return profiles
      .map((profile) => profile.portfolio_id)
      .filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
  }, [profiles]);

  const handleEnrichAll = async () => {
    setIsEnriching(true);
    setMessage(null);
    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "company", company_id: customer.company_id, skipEnriched: false })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Enrichment failed");
      }

      const result = await response.json();
      setMessage(`Enriched ${result.enriched ?? 0} of ${result.total ?? 0} assets.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enrichment failed");
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Portfolio Assets</CardTitle>
            <div className="text-xs text-muted-foreground">Customer ID {customer.company_id}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{assets.length} assets</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnrichAll}
              disabled={isEnriching || assets.length === 0}
              className="gap-2"
            >
              {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Enrich All Assets
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <div className="text-xs text-muted-foreground">{message}</div>}
          {portfolioOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-xs text-muted-foreground">Import to portfolio</Label>
              <select
                value={activePortfolio}
                onChange={(event) => setActivePortfolio(event.target.value)}
                className="h-9 rounded-full border border-input bg-transparent px-3 text-xs"
              >
                {portfolioOptions.map((portfolio) => (
                  <option key={portfolio} value={portfolio}>
                    {portfolio}
                  </option>
                ))}
              </select>
              <PortfolioImportDialog
                portfolioId={activePortfolio}
                companyId={customer.company_id}
                onSuccess={() => {
                  setMessage("Import complete.");
                  router.refresh();
                }}
              />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ISIN</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-xs">{asset.portfolio_id ?? "-"}</TableCell>
                  <TableCell>{asset.ticker ?? "-"}</TableCell>
                  <TableCell>{asset.stock_name ?? "-"}</TableCell>
                  <TableCell>{asset.isin ?? "-"}</TableCell>
                  <TableCell>{asset.asset_class ?? "-"}</TableCell>
                  <TableCell>
                    {asset.ticker_eod && asset.description ? (
                      <Badge variant="success">Complete</Badge>
                    ) : asset.ticker_eod ? (
                      <Badge variant="warning">Partial</Badge>
                    ) : (
                      <Badge variant="destructive">Not Enriched</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
