"use client";

import Link from "next/link";
import { FileText, Pencil, Sparkles, TrendingUp } from "lucide-react";

import { CompanyProfile } from "@/components/admin/crm/company-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

type CustomerProfileHubProps = {
  customer: CustomerBasicInfo;
  profiles: InvestorProfile[];
  assets: PortfolioAsset[];
};

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

export function CustomerProfileHub({ customer, profiles, assets }: CustomerProfileHubProps) {
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
            <Link href="/tasks#new-task">New Task</Link>
          </Button>
        </CardContent>
      </Card>

      <CompanyProfile customer={customer} profiles={profiles} assets={assets} />

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
