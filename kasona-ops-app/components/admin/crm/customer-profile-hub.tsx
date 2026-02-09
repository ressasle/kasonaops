"use client";

import Link from "next/link";
import { AlertCircle, FileText, Pencil, Plus, Rocket, Sparkles, TrendingUp } from "lucide-react";

import { CompanyProfile } from "@/components/admin/crm/company-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerBasicInfo, CustomerContact, CustomerLink, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

type CustomerProfileHubProps = {
  customer: CustomerBasicInfo;
  profiles: InvestorProfile[];
  assets: PortfolioAsset[];
  contacts: CustomerContact[];
  links: CustomerLink[];
};

const PROFILE_SECTIONS = [
  { id: "company-overview", label: "Company" },
  { id: "finance-snapshot", label: "Finance" },
  { id: "investor-profiles", label: "Investor" },
  { id: "portfolio-assets", label: "Portfolio" },
  { id: "contact-persons", label: "Contacts" },
  { id: "customer-links", label: "Links" },
];

const mockFiles = [
  { name: "Portfolio_Import_Feb.pdf", type: "PDF", date: "2026-02-05" },
  { name: "Investor_DNA_Notes.docx", type: "DOCX", date: "2026-02-02" },
  { name: "Holdings_Q1.csv", type: "CSV", date: "2026-01-28" }
];

const mockTokenUsage = [
  { label: "Research Summaries", value: 18400 },
  { label: "Portfolio Updates", value: 9200 },
  { label: "Alerts & Signals", value: 6100 }
];

const formatTokens = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function CustomerProfileHub({ customer, profiles, assets, contacts, links }: CustomerProfileHubProps) {
  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Customer Profile</div>
          <div className="headline-serif text-3xl">{customer.company_name}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/sales">Sales</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/operations">Operations</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/customers">Customers</Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href={`/customers?edit=${customer.company_id}`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Missing Info Indicator */}
      {(() => {
        const missing: string[] = [];
        if (!customer.contact_person_name) missing.push("Contact Person");
        if (!customer.contact_person_position) missing.push("Position");
        if (!customer.email) missing.push("Email");
        if (!customer.industry) missing.push("Industry");
        if (!customer.type) missing.push("Type");
        if (!customer.phone) missing.push("Phone");
        return missing.length > 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{missing.length} fields incomplete: {missing.join(", ")}</span>
          </div>
        ) : null;
      })()}

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Wealth Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="gap-2">
            <Link href={`/customers/${customer.company_id}/investor-profile`}>
              <Sparkles className="h-4 w-4" />
              Investor Profile
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/customers/${customer.company_id}/assets`}>
              <TrendingUp className="h-4 w-4" />
              Portfolio Assets
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/onboarding?company_id=${customer.company_id}&company_name=${encodeURIComponent(customer.company_name)}`}>
              <Rocket className="h-4 w-4" />
              Start Onboarding
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/tasks#new-task">New Task</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-panel sticky top-16 z-10 p-3">
        <CardContent className="flex flex-wrap gap-2 p-0">
          {PROFILE_SECTIONS.map((section) => (
            <Button
              key={section.id}
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <CompanyProfile customer={customer} profiles={profiles} assets={assets} contacts={contacts} links={links} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockFiles.map((file) => (
              <div key={file.name} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{file.date}</div>
                  </div>
                </div>
                <Badge variant="outline">{file.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Token Usage (Mock)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTokenUsage.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{formatTokens(item.value)} tokens</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
