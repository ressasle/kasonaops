import { CustomerManager } from "@/components/admin/crm/customer-manager";
import { getCustomers } from "@/lib/data/customers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewLeadPage() {
  const supabase = getSupabaseServerClient();
  const customers = await getCustomers(1000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Customer</h1>
        <p className="text-sm text-muted-foreground">
          Add a new company to your CRM. Duplicates are checked automatically.
        </p>
      </div>
      <CustomerManager
        customers={customers}
        supabaseReady={!!supabase}
        mode="form"
      />
    </div>
  );
}
