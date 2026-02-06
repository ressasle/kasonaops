import { PageHeader } from "@/components/admin/page-header";
import { CustomerOnboarding } from "@/components/admin/onboarding/customer-onboarding";
import { getCustomers } from "@/lib/data/customers";

export default async function NewCustomerPage() {
  const customers = await getCustomers();
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return (
    <div className="space-y-10">
      <PageHeader />
      <CustomerOnboarding customers={customers} supabaseReady={supabaseReady} />
    </div>
  );
}
