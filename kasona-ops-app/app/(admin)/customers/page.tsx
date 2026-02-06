import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { CustomerManager } from "@/components/admin/crm/customer-manager";
import { InvestorProfileManager } from "@/components/admin/crm/investor-profile-manager";
import { PortfolioAssetsManager } from "@/components/admin/crm/portfolio-assets-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomers, getInvestorProfiles, getPortfolioAssets } from "@/lib/data/customers";

type CustomersPageProps = {
  searchParams?: Promise<{
    status?: string;
    action?: string;
    industry?: string;
    search?: string;
    view?: string;
    edit?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = await searchParams;
  const [customers, profiles, assets] = await Promise.all([
    getCustomers(),
    getInvestorProfiles(),
    getPortfolioAssets()
  ]);
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
  const activeView = resolvedSearchParams?.view ?? "overview";
  const editId = resolvedSearchParams?.edit ? Number(resolvedSearchParams.edit) : undefined;

  return (
    <div className="space-y-10">
      <PageHeader />
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <Button asChild variant={activeView === "overview" ? "default" : "ghost"} size="sm">
          <Link href="/customers?view=overview">Overview</Link>
        </Button>
        <Button asChild variant={activeView === "profiles" ? "default" : "ghost"} size="sm">
          <Link href="/customers?view=profiles">Investor Profiles</Link>
        </Button>
        <Button asChild variant={activeView === "assets" ? "default" : "ghost"} size="sm">
          <Link href="/customers?view=assets">Portfolio Assets</Link>
        </Button>
      </div>
      {!supabaseReady && <Badge variant="warning">Supabase not configured</Badge>}
      <CustomerManager
        customers={customers}
        supabaseReady={supabaseReady}
        initialEditId={Number.isFinite(editId ?? NaN) ? editId : undefined}
        initialFilters={{
          status: resolvedSearchParams?.status ?? "",
          action: resolvedSearchParams?.action ?? "",
          industry: resolvedSearchParams?.industry ?? "",
          search: resolvedSearchParams?.search ?? ""
        }}
      />
      <InvestorProfileManager profiles={profiles} supabaseReady={supabaseReady} />
      <PortfolioAssetsManager assets={assets} supabaseReady={supabaseReady} />
    </div>
  );
}
