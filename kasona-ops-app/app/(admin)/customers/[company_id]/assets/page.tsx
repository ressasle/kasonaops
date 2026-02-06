import { notFound } from "next/navigation";

import { PortfolioAssetsPage } from "@/components/admin/crm/portfolio-assets-page";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

interface PageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CustomerAssetsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = getSupabaseServerClient();
  const companyIdValue = Number(resolvedParams.company_id);

  if (!supabase || Number.isNaN(companyIdValue)) {
    return notFound();
  }

  const { data: customer } = await supabase
    .from("kasona_customer_basic_info")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .single();

  if (!customer) {
    return notFound();
  }

  const { data: profiles } = await supabase
    .from("kasona_investor_profiles")
    .select("*")
    .eq("company_id", companyIdValue as any);

  const { data: assets } = await supabase
    .from("kasona_portfolio_assets")
    .select("*")
    .eq("company_id", companyIdValue as any)
    .order("id", { ascending: false });

  return (
    <div className="space-y-8">
      <PortfolioAssetsPage
        customer={customer as unknown as CustomerBasicInfo}
        profiles={(profiles ?? []) as unknown as InvestorProfile[]}
        assets={(assets ?? []) as unknown as PortfolioAsset[]}
      />
    </div>
  );
}
