import { CustomerOnboarding } from "@/components/admin/onboarding/customer-onboarding";
import { getCustomers } from "@/lib/data/customers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{
    company_id?: string;
    company_name?: string;
  }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = getSupabaseServerClient();
  const customers = await getCustomers(1000);

  const companyId = params.company_id ? Number(params.company_id) : undefined;
  const companyName = params.company_name ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Set up investor profiles and portfolio assets for a customer.
        </p>
      </div>
      <CustomerOnboarding
        customers={customers}
        supabaseReady={!!supabase}
        initialCompanyId={companyId}
        initialCompanyName={companyName}
      />
    </div>
  );
}
