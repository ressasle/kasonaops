"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerBasicInfo, InvestorProfile } from "@/lib/data/types";

type InvestorProfileOverviewProps = {
  customers: CustomerBasicInfo[];
  profiles: InvestorProfile[];
  defaultCustomerId?: number;
};

const renderValue = (value: string | number | null) => (value ? value : "-");

export function InvestorProfileOverview({ customers, profiles, defaultCustomerId }: InvestorProfileOverviewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(defaultCustomerId ?? "");

  const selectedProfiles = useMemo(() => {
    if (!selectedCustomerId) return [];
    return profiles.filter((profile) => profile.company_id === selectedCustomerId);
  }, [profiles, selectedCustomerId]);

  const activeProfile = selectedProfiles[0];

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>Investor Profile</CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={selectedCustomerId}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedCustomerId(value ? Number(value) : "");
            }}
            className="h-10 rounded-full border border-input bg-transparent px-4 text-sm"
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.company_id} value={customer.company_id}>
                {customer.company_name}
              </option>
            ))}
          </select>
          <Badge variant="outline">{selectedProfiles.length} profiles</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="content">Created Content</TabsTrigger>
            <TabsTrigger value="tokens">Token Usage</TabsTrigger>
            <TabsTrigger value="files">Accessible Files</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            {!activeProfile ? (
              <div className="text-sm text-muted-foreground">No investor profile found.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-xs text-muted-foreground">Portfolio</div>
                  <div className="text-sm font-semibold">{activeProfile.portfolio_name ?? activeProfile.portfolio_id}</div>
                  <div className="text-xs text-muted-foreground">{activeProfile.output_format ?? "-"} · {activeProfile.output_frequency ?? "-"}</div>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-xs text-muted-foreground">Product Status</div>
                  <div className="text-sm font-semibold">{activeProfile.product_status ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">Owner {activeProfile.owner_id ?? "Unassigned"}</div>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-xs text-muted-foreground">Investor DNA</div>
                  <div className="mt-2 grid gap-2 text-xs">
                    <div>Data granularity: {renderValue(activeProfile.data_granularity)}</div>
                    <div>Action frequency: {renderValue(activeProfile.action_frequency)}</div>
                    <div>Decision logic: {renderValue(activeProfile.decision_logic)}</div>
                    <div>Risk appetite: {renderValue(activeProfile.risk_appetite)}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-xs text-muted-foreground">Mandate</div>
                  <div className="mt-2 text-xs">Philosophy: {renderValue(activeProfile.investment_philosophy)}</div>
                  <div className="mt-1 text-xs">Noise filter: {renderValue(activeProfile.noise_filter)}</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <div className="rounded-2xl border border-border/60 p-4 text-sm text-muted-foreground">
              No content activity recorded yet.
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="mt-4">
            <div className="rounded-2xl border border-border/60 p-4 text-sm text-muted-foreground">
              Token usage data not available yet.
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <div className="rounded-2xl border border-border/60 p-4 text-sm text-muted-foreground">
              File access logs will appear here.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
