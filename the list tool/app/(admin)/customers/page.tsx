import { PageHeader } from "@/components/admin/page-header";
import { CustomerManager } from "@/components/admin/crm/customer-manager";
import { InvestorProfileManager } from "@/components/admin/crm/investor-profile-manager";
import { PortfolioAssetsManager } from "@/components/admin/crm/portfolio-assets-manager";
import { Badge } from "@/components/ui/badge";
import { getCustomers, getInvestorProfiles, getPortfolioAssets } from "@/lib/data/customers";

type CustomersPageProps = {
  searchParams?: {
    status?: string;
    action?: string;
    industry?: string;
    search?: string;
  };
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const [customers, profiles, assets] = await Promise.all([
    getCustomers(),
    getInvestorProfiles(),
    getPortfolioAssets()
  ]);
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return (
    <div className="space-y-10">
      <PageHeader showNewCustomer />
      {!supabaseReady && <Badge variant="warning">Supabase not configured</Badge>}
      <CustomerManager
        customers={customers}
        supabaseReady={supabaseReady}
        initialFilters={{
          status: searchParams?.status ?? "",
          action: searchParams?.action ?? "",
          industry: searchParams?.industry ?? "",
          search: searchParams?.search ?? ""
        }}
      />
      <InvestorProfileManager profiles={profiles} supabaseReady={supabaseReady} />
      <PortfolioAssetsManager assets={assets} supabaseReady={supabaseReady} />
    </div>
  );
}
