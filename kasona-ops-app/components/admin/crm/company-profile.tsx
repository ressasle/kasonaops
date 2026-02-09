"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, CheckCircle, Clock3, Loader2, Pencil, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerLinksSection } from "@/components/admin/crm/customer-links-section";
import { PortfolioEditDialog } from "@/components/admin/crm/portfolio-edit-dialog";
import { parseFirecrawlEnrichmentHistory } from "@/lib/data/customer-enrichment";
import type { CustomerBasicInfo, CustomerContact, CustomerLink, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

type CompanyProfileProps = {
  customer: CustomerBasicInfo;
  profiles: InvestorProfile[];
  assets: PortfolioAsset[];
  contacts: CustomerContact[];
  links: CustomerLink[];
};

export function CompanyProfile({ customer, profiles, assets, contacts, links }: CompanyProfileProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [activePortfolio, setActivePortfolio] = useState<string | null>(profiles[0]?.portfolio_id ?? null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichMessage, setEnrichMessage] = useState<string | null>(null);
  const [companyDraft, setCompanyDraft] = useState<{
    company_name: string;
    email: string;
    website: string;
    contact_person_name: string;
    contact_person_position: string;
    industry: string;
    type: string;
    source: string;
    product_type: string;
    action_status: string;
  }>({
    company_name: customer.company_name ?? "",
    email: customer.email ?? "",
    website: customer.website ?? "",
    contact_person_name: customer.contact_person_name ?? "",
    contact_person_position: customer.contact_person_position ?? "",
    industry: customer.industry ?? "",
    type: customer.type ?? "",
    source: customer.source ?? "",
    product_type: customer.product_type ?? "",
    action_status: customer.action_status ?? "",
  });
  const [financeDraft, setFinanceDraft] = useState<{
    contract_size: string;
    charge_type: string;
    billing_type: string;
    billing_email: string;
    billing_address: string;
    start_date: string;
    end_date: string;
  }>({
    contract_size: customer.contract_size?.toString() ?? "",
    charge_type: customer.charge_type ?? "",
    billing_type: customer.billing_type ?? "",
    billing_email: customer.billing_email ?? "",
    billing_address: customer.billing_address ?? "",
    start_date: customer.start_date ?? "",
    end_date: customer.end_date ?? "",
  });
  const [selectedProfile, setSelectedProfile] = useState<InvestorProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reviewItems = useMemo(() => {
    const items: string[] = [];
    if (!customer.contact_person_name) items.push("Contact person");
    if (!customer.contact_person_position) items.push("Contact position");
    if (!customer.billing_address) items.push("Billing address");
    if (!customer.start_date) items.push("Start date (won)");
    return items;
  }, [customer]);

  const enrichmentHistory = useMemo(
    () => parseFirecrawlEnrichmentHistory(customer.notes, 10),
    [customer.notes]
  );
  const latestEnrichmentDate = enrichmentHistory[0]?.date ?? null;

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

  const saveCompanyOverview = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/customers/${customer.company_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyDraft.company_name.trim() || customer.company_name,
          email: companyDraft.email.trim() || null,
          website: companyDraft.website.trim() || null,
          contact_person_name: companyDraft.contact_person_name.trim() || null,
          contact_person_position: companyDraft.contact_person_position.trim() || null,
          industry: companyDraft.industry.trim() || null,
          type: companyDraft.type.trim() || null,
          source: companyDraft.source.trim() || null,
          product_type: companyDraft.product_type.trim() || null,
          action_status: companyDraft.action_status.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save company overview");
      }

      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save company overview");
    } finally {
      setIsSaving(false);
    }
  };

  const saveFinanceSnapshot = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const contractSize = financeDraft.contract_size.trim() ? Number(financeDraft.contract_size) : null;
      const response = await fetch(`/api/customers/${customer.company_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_size: Number.isFinite(contractSize) ? contractSize : null,
          charge_type: financeDraft.charge_type.trim() || null,
          billing_type: financeDraft.billing_type.trim() || null,
          billing_email: financeDraft.billing_email.trim() || null,
          billing_address: financeDraft.billing_address.trim() || null,
          start_date: financeDraft.start_date || null,
          end_date: financeDraft.end_date || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save finance snapshot");
      }

      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save finance snapshot");
    } finally {
      setIsSaving(false);
    }
  };

  const saveInvestorProfile = async () => {
    if (!selectedProfile?.portfolio_id) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/investor-profiles/${selectedProfile.portfolio_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_name: selectedProfile.portfolio_name?.trim() || null,
          product_status: selectedProfile.product_status || null,
          output_format: selectedProfile.output_format || null,
          output_frequency: selectedProfile.output_frequency || null,
          risk_appetite: selectedProfile.risk_appetite ?? null,
          recipient_email: selectedProfile.recipient_email?.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save investor profile");
      }

      setSelectedProfile(null);
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save investor profile");
    } finally {
      setIsSaving(false);
    }
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
      <Card id="company-overview" className="scroll-mt-28 p-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Company Overview</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Edit Company Overview</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Company Name</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.company_name} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, company_name: event.target.value }))} /></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Email</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.email} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, email: event.target.value }))} /></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Website</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.website} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, website: event.target.value }))} /></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Contact Person</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.contact_person_name} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, contact_person_name: event.target.value }))} /></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Position</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.contact_person_position} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, contact_person_position: event.target.value }))} /></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Industry</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={companyDraft.industry} onChange={(event) => setCompanyDraft((prev) => ({ ...prev, industry: event.target.value }))} /></div>
                </div>
                {saveError && <div className="text-sm text-red-300">{saveError}</div>}
                <div className="flex justify-end">
                  <Button onClick={saveCompanyOverview} disabled={isSaving} className="gap-2 cursor-pointer">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={customer.status?.includes("Paid") ? "success" : "default"}>
              {customer.status ?? "Lead"}
            </Badge>
            {latestEnrichmentDate && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 cursor-pointer" aria-label="Open enrichment history">
                    <Clock3 className="h-3.5 w-3.5" />
                    Enriched {latestEnrichmentDate}
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Enrichment History</DialogTitle>
                    <DialogDescription>
                      Firecrawl snapshots appended to customer notes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                    {enrichmentHistory.map((entry) => (
                      <div key={`${entry.date}-${entry.website ?? "none"}`} className="rounded-xl border border-border/60 bg-white/5 p-3">
                        <div className="text-sm font-medium">{entry.date}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{entry.website ?? "No website captured"}</div>
                        {entry.title && <div className="mt-2 text-xs">Title: {entry.title}</div>}
                        {entry.description && (
                          <div className="mt-1 text-xs text-muted-foreground">Description: {entry.description}</div>
                        )}
                        {entry.evidence.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.evidence.map((evidenceItem) => (
                              <Badge key={evidenceItem} variant="outline">{evidenceItem}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
          <div className="space-y-1 text-sm">
            <div className="text-muted-foreground">Ownership</div>
            <div>Owner: <span className="font-medium">{customer.owner_id ?? "Unassigned"}</span></div>
            <div>Creator: <span className="font-medium">{customer.creator_id ?? "-"}</span></div>
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

      <Card id="finance-snapshot" className="scroll-mt-28 p-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Finance Snapshot</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Finance Snapshot</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2"><div className="text-xs text-muted-foreground">Contract Size</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.contract_size} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, contract_size: event.target.value }))} /></div>
                <div className="space-y-2"><div className="text-xs text-muted-foreground">Charge Type</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.charge_type} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, charge_type: event.target.value }))} /></div>
                <div className="space-y-2"><div className="text-xs text-muted-foreground">Billing Type</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.billing_type} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, billing_type: event.target.value }))} /></div>
                <div className="space-y-2"><div className="text-xs text-muted-foreground">Billing Email</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.billing_email} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, billing_email: event.target.value }))} /></div>
                <div className="space-y-2"><div className="text-xs text-muted-foreground">Start Date</div><input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.start_date ?? ""} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, start_date: event.target.value }))} /></div>
                <div className="space-y-2"><div className="text-xs text-muted-foreground">End Date</div><input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.end_date ?? ""} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, end_date: event.target.value }))} /></div>
              </div>
              <div className="space-y-2"><div className="text-xs text-muted-foreground">Billing Address</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={financeDraft.billing_address} onChange={(event) => setFinanceDraft((prev) => ({ ...prev, billing_address: event.target.value }))} /></div>
              {saveError && <div className="text-sm text-red-300">{saveError}</div>}
              <div className="flex justify-end">
                <Button onClick={saveFinanceSnapshot} disabled={isSaving} className="gap-2 cursor-pointer">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      <Card id="investor-profiles" className="scroll-mt-28 p-6">
        <CardHeader>
          <CardTitle>Investor Profiles</CardTitle>
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
                  <Dialog
                    open={selectedProfile?.portfolio_id === profile.portfolio_id}
                    onOpenChange={(open) => setSelectedProfile(open ? profile : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="cursor-pointer">Edit</Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Edit Investor Profile</DialogTitle>
                      </DialogHeader>
                      {selectedProfile && (
                        <div className="space-y-3">
                          <div className="space-y-2"><div className="text-xs text-muted-foreground">Portfolio Name</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.portfolio_name ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, portfolio_name: event.target.value } : null)} /></div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2"><div className="text-xs text-muted-foreground">Status</div><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.product_status ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, product_status: event.target.value as InvestorProfile["product_status"] } : null)}><option value="">-</option><option value="to create">to create</option><option value="created">created</option><option value="to review">to review</option><option value="to send">to send</option><option value="sent out">sent out</option></select></div>
                            <div className="space-y-2"><div className="text-xs text-muted-foreground">Risk Appetite</div><input type="number" className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.risk_appetite ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, risk_appetite: event.target.value ? Number(event.target.value) : null } : null)} /></div>
                            <div className="space-y-2"><div className="text-xs text-muted-foreground">Output Format</div><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.output_format ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, output_format: event.target.value as InvestorProfile["output_format"] } : null)}><option value="">-</option><option value="Podcast">Podcast</option><option value="Newsletter">Newsletter</option><option value="Other">Other</option></select></div>
                            <div className="space-y-2"><div className="text-xs text-muted-foreground">Output Frequency</div><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.output_frequency ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, output_frequency: event.target.value as InvestorProfile["output_frequency"] } : null)}><option value="">-</option><option value="daily">daily</option><option value="weekly">weekly</option><option value="bi-weekly">bi-weekly</option><option value="monthly">monthly</option><option value="quarterly">quarterly</option></select></div>
                          </div>
                          <div className="space-y-2"><div className="text-xs text-muted-foreground">Recipient Email</div><input className="h-10 w-full rounded-md border border-input bg-background px-3" value={selectedProfile.recipient_email ?? ""} onChange={(event) => setSelectedProfile((prev) => prev ? { ...prev, recipient_email: event.target.value } : null)} /></div>
                          {saveError && <div className="text-sm text-red-300">{saveError}</div>}
                          <div className="flex justify-end">
                            <Button onClick={saveInvestorProfile} disabled={isSaving} className="gap-2 cursor-pointer">
                              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                              Save Profile
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
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

      <Card id="portfolio-assets" className="scroll-mt-28 p-6">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Portfolio Assets</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{visibleAssets.length} assets</Badge>
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="cursor-pointer"
            >
              Open all portfolios
            </Button>
            <Button
              variant={viewMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("single")}
              className="cursor-pointer"
            >
              Open single
            </Button>
            {viewMode === "single" && profiles.length > 0 && (
              <select
                value={activePortfolio ?? profiles[0]?.portfolio_id ?? ""}
                onChange={(event) => setActivePortfolio(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {profiles.map((profile) => (
                  <option key={profile.portfolio_id} value={profile.portfolio_id}>
                    {profile.portfolio_name ?? profile.portfolio_id}
                  </option>
                ))}
              </select>
            )}
            <PortfolioEditDialog assets={visibleAssets} onSaved={refreshAssets} />
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

      <Card id="contact-persons" className="scroll-mt-28 p-6">
        <CardHeader>
          <CardTitle>Contact Persons</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No contact persons linked to this customer yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Primary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "-"}</TableCell>
                    <TableCell>{contact.position ?? "-"}</TableCell>
                    <TableCell>{contact.email ?? "-"}</TableCell>
                    <TableCell>{contact.phone ?? "-"}</TableCell>
                    <TableCell>{contact.is_primary ? <Badge variant="success">Primary</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerLinksSection companyId={customer.company_id} initialLinks={links} onUpdated={refreshAssets} />
    </div>
  );
}
