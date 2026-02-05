import { notFound } from "next/navigation";
import { CompanyProfile } from "@/components/admin/crm/company-profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

interface PageProps {
  params: {
    company_id: string;
  };
}

export default async function CustomerProfilePage({ params }: PageProps) {
  const supabase = getSupabaseServerClient();
  const companyIdValue = Number(params.company_id);

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

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <CompanyProfile
          customer={customer as unknown as CustomerBasicInfo}
          profiles={(profiles || []) as unknown as InvestorProfile[]}
          assets={(assets || []) as unknown as PortfolioAsset[]}
        />
      </div>
    </div>
  );
}
