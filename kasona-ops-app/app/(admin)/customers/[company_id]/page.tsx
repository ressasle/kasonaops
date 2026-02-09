import { notFound } from "next/navigation";
import { CustomerProfileHub } from "@/components/admin/crm/customer-profile-hub";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerBasicInfo, CustomerContact, CustomerLink, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

interface PageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CustomerProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = getSupabaseServerClient();
  const companyIdValue = Number(resolvedParams.company_id);

  if (!supabase || isNaN(companyIdValue)) {
    return notFound();
  }

  // 1. Fetch Company Info
  const { data: customer, error: customerError } = await supabase
    .from("kasona_customer_basic_info")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .single();

  if (customerError || !customer) {
    console.error("Error fetching customer:", customerError);
    return notFound();
  }

  // 2. Fetch Investor Profiles
  const { data: profiles } = await supabase
    .from("kasona_investor_profiles")
    .select("*")
    .eq("company_id", companyIdValue as any);

  // 3. Fetch Portfolio Assets
  const { data: assets } = await supabase
    .from("kasona_portfolio_assets")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .order("id", { ascending: false });

  // 4. Fetch Contact Persons
  const { data: contacts } = await supabase
    .from("kasona_customer_contacts")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .order("created_at", { ascending: false });

  // 5. Fetch Customer Links
  const { data: links } = await supabase
    .from("kasona_customer_links")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <CustomerProfileHub
        customer={customer as unknown as CustomerBasicInfo}
        profiles={(profiles || []) as unknown as InvestorProfile[]}
        assets={(assets || []) as unknown as PortfolioAsset[]}
        contacts={(contacts || []) as unknown as CustomerContact[]}
        links={(links || []) as unknown as CustomerLink[]}
      />
    </div>
  );
}
