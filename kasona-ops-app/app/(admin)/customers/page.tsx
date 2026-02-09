import Link from "next/link";

import { ChecklistPopup } from "@/components/admin/crm/checklist-popup";
import { CustomerManager } from "@/components/admin/crm/customer-manager";
import { CustomersOverviewStats } from "@/components/admin/crm/customers-overview-stats";
import { FulfillmentTasks } from "@/components/admin/crm/fulfillment-tasks";
import { InvestorProfileManager } from "@/components/admin/crm/investor-profile-manager";
import { PortfolioAssetsManager } from "@/components/admin/crm/portfolio-assets-manager";
import { UpcomingCustomers } from "@/components/admin/crm/upcoming-customers";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomers, getInvestorProfiles, getPortfolioAssets } from "@/lib/data/customers";

type CustomersPageProps = {
  searchParams?: Promise<{
    status?: string;
    action?: string;
    industry?: string;
    type?: string;
    product?: string;
    search?: string;
    view?: string;
    ownerId?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = await searchParams;
  const [customers, profiles, assets] = await Promise.all([
    getCustomers(1000),
    getInvestorProfiles(),
    getPortfolioAssets()
  ]);

  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  const activeView = resolvedSearchParams?.view ?? "overview";
  const currentOwnerId = resolvedSearchParams?.ownerId ?? process.env.NEXT_PUBLIC_DEFAULT_OWNER_ID ?? "julian";

  const operationsPending = profiles.filter((profile) =>
    ["to create", "to review", "to send"].includes(profile.product_status ?? "")
  ).length;
  const operationsWaiting = profiles.filter((profile) => profile.product_status === "to review").length;
  const assignedToMe = customers.filter((customer) => customer.owner_id === currentOwnerId).length;

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-3">
        <PageHeader />
        <ChecklistPopup />
      </div>

      <CustomersOverviewStats
        totalCustomers={customers.length}
        assignedToMe={assignedToMe}
        operationsQueue={{ pending: operationsPending, waiting: operationsWaiting }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Button asChild variant={activeView === "overview" ? "default" : "ghost"} size="sm">
            <Link href="/customers?view=overview">Overview</Link>
          </Button>
          <Button asChild variant={activeView === "profiles" ? "default" : "ghost"} size="sm">
            <Link href="/customers?view=profiles">Investor Profiles</Link>
          </Button>
          <Button asChild variant={activeView === "assets" ? "default" : "ghost"} size="sm">
            <Link href="/customers?view=assets">Portfolio Assets</Link>
          </Button>
          <Button asChild variant={activeView === "tasks" ? "default" : "ghost"} size="sm">
            <Link href="/customers?view=tasks">Tasks</Link>
          </Button>
          <Button asChild variant={activeView === "upcoming" ? "default" : "ghost"} size="sm">
            <Link href="/customers?view=upcoming">Upcoming</Link>
          </Button>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/customers/new">Add Customer</Link>
        </Button>
      </div>

      {!supabaseReady && <Badge variant="warning">Supabase not configured</Badge>}

      {activeView === "overview" && (
        <CustomerManager
          customers={customers}
          supabaseReady={supabaseReady}
          mode="list"
          initialFilters={{
            status: resolvedSearchParams?.status ?? "",
            action: resolvedSearchParams?.action ?? "",
            industry: resolvedSearchParams?.industry ?? "",
            type: resolvedSearchParams?.type ?? "",
            product: resolvedSearchParams?.product ?? "",
            search: resolvedSearchParams?.search ?? ""
          }}
        />
      )}
      {activeView === "profiles" && (
        <InvestorProfileManager profiles={profiles} supabaseReady={supabaseReady} />
      )}
      {activeView === "assets" && (
        <PortfolioAssetsManager assets={assets} supabaseReady={supabaseReady} />
      )}
      {activeView === "tasks" && <FulfillmentTasks customers={customers} supabaseReady={supabaseReady} />}
      {activeView === "upcoming" && <UpcomingCustomers customers={customers} />}
    </div>
  );
}
