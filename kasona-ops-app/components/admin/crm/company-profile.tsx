"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

type CompanyProfileProps = {
  customer: CustomerBasicInfo;
  profiles: InvestorProfile[];
  assets: PortfolioAsset[];
};

export function CompanyProfile({ customer, profiles, assets }: CompanyProfileProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [activePortfolio, setActivePortfolio] = useState<string | null>(profiles[0]?.portfolio_id ?? null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichMessage, setEnrichMessage] = useState<string | null>(null);

  const reviewItems = useMemo(() => {
    const items: string[] = [];
    if (!customer.contact_person_name) items.push("Contact person");
    if (!customer.contact_person_position) items.push("Contact position");
    if (!customer.billing_address) items.push("Billing address");
    if (!customer.start_date) items.push("Start date (won)");
    return items;
  }, [customer]);

  const completeness = useMemo(() => {
    const requiredFields: Array<keyof CustomerBasicInfo> = [
      "company_name",
      "contact_person_name",
      "email",
      "phone"
    ];
    const filled = requiredFields.filter((field) => customer[field]);
    return Math.round((filled.length / requiredFields.length) * 100);
  }, [customer]);

  const groupedAssets = useMemo(() => {
    return assets.reduce<Record<string, PortfolioAsset[]>>((acc, asset) => {
      const key = asset.portfolio_id ?? "Unknown";
      acc[key] = acc[key] ?? [];
      acc[key].push(asset);
      return acc;
    }, {});
  }, [assets]);

  const visibleAssets = viewMode === "all"
    ? assets
    : groupedAssets[activePortfolio ?? ""] ?? [];

  const refreshAssets = () => {
    router.refresh();
  };

  const handleEnrichAll = async () => {
    const portfolioId = activePortfolio ?? profiles[0]?.portfolio_id;
    if (!portfolioId) {
      setEnrichMessage("No portfolio available to enrich.");
      return;
    }

    setIsEnriching(true);
    setEnrichMessage(null);
    try {
      const response = await fetch("/api/portfolio-assets/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "portfolio",
          portfolio_id: portfolioId,
          skipEnriched: false
        })
      });

      if (!response.ok) {
        throw new Error("Enrichment failed");
      }

      const result = await response.json();
      setEnrichMessage(`Enriched ${result.enriched ?? 0} of ${result.total ?? 0} assets.`);
      refreshAssets();
    } catch (error) {
      setEnrichMessage(error instanceof Error ? error.message : "Enrichment failed");
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={customer.status?.includes("Paid") ? "success" : "default"}>
              {customer.status ?? "Lead"}
            </Badge>
            {completeness < 100 ? (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Profile Incomplete ({completeness}%)
              </Badge>
            ) : (
              <Badge variant="success">Complete</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Company</div>
            <div className="text-lg font-semibold">{customer.company_name}</div>
            <div className="text-xs text-muted-foreground">Customer ID {customer.company_id}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>Email: {customer.email ?? "-"}</div>
            <div>Website: {customer.website ?? "-"}</div>
            <div>Contact: {customer.contact_person_name ?? "-"}</div>
            <div>Position: {customer.contact_person_position ?? "-"}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>Industry: {customer.industry ?? "-"}</div>
            <div>Source: {customer.source ?? "-"}</div>
            <div>Type: {customer.type ?? "-"}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>Product: {customer.product_type ?? "-"}</div>
            <div>Action: {customer.action_status ?? "-"}</div>
            <div>Updated: {customer.updated_at ?? "-"}</div>
          </div>
        </CardContent>
      </Card>

      {reviewItems.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Needs Review</CardTitle>
            <Badge variant="warning">Missing fields</Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {reviewItems.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Finance Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <div>Contract Size: {customer.contract_size ?? "-"}</div>
            <div>Charge Type: {customer.charge_type ?? "-"}</div>
            <div>Billing Type: {customer.billing_type ?? "-"}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>Billing Email: {customer.billing_email ?? "-"}</div>
            <div>Billing Address: {customer.billing_address ?? "-"}</div>
            <div>Term: {customer.start_date ?? "-"} → {customer.end_date ?? "-"}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Investor Profiles</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("all")}
            >
              Open all portfolios
            </Button>
            <Button
              variant={viewMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("single")}
            >
              Open single
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.length === 0 && <div className="text-sm text-muted-foreground">No profiles yet.</div>}
          {profiles.map((profile) => (
            <div key={profile.portfolio_id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{profile.portfolio_name ?? profile.portfolio_id}</div>
                  <div className="text-xs text-muted-foreground">{profile.portfolio_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.product_status === "to review" ? "warning" : "default"}>
                    {profile.product_status ?? "-"}
                  </Badge>
                  {viewMode === "single" && (
                    <Button variant="outline" size="sm" onClick={() => setActivePortfolio(profile.portfolio_id)}>
                      Open
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-muted-foreground md:grid-cols-3">
                <div>Output: {profile.output_format ?? "-"}</div>
                <div>Frequency: {profile.output_frequency ?? "-"}</div>
                <div>Risk appetite: {profile.risk_appetite ?? "-"}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Portfolio Assets</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{visibleAssets.length} assets</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnrichAll}
              disabled={isEnriching || profiles.length === 0}
              className="gap-2"
            >
              {isEnriching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Enrich All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrichMessage && (
            <div className="text-xs text-muted-foreground">{enrichMessage}</div>
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
              {visibleAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-xs">{asset.portfolio_id ?? "-"}</TableCell>
                  <TableCell>{asset.ticker ?? "-"}</TableCell>
                  <TableCell>{asset.stock_name ?? "-"}</TableCell>
                  <TableCell>{asset.isin ?? "-"}</TableCell>
                  <TableCell>{asset.asset_class ?? "-"}</TableCell>
                  <TableCell>
                    {asset.ticker_eod && asset.description ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Complete
                      </Badge>
                    ) : asset.ticker_eod ? (
                      <Badge variant="warning" className="gap-1">
                        <AlertCircle className="h-3 w-3" /> Partial
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" /> Not Enriched
                      </Badge>
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
