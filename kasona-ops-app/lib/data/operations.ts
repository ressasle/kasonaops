import { getSupabaseServerClient } from "@/lib/supabase/server";

export type FulfillmentItem = {
  portfolio_id: string;
  portfolio_name: string | null;
  company_id: number | null;
  company_name: string | null;
  customer_name: string | null;
  product_status: string | null;
  output_format: string | null;
  output_frequency: string | null;
  owner_id: string | null;
  creator_id: string | null;
  updated_at: string | null;
};

export async function getFulfillmentQueue(limit: number = 200): Promise<FulfillmentItem[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data: profiles, error } = await supabase
    .from("kasona_investor_profiles")
    .select(
      "portfolio_id, portfolio_name, company_id, customer_name, product_status, output_format, output_frequency, owner_id, creator_id, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !profiles) return [];

  type ProfileRow = {
    portfolio_id: string;
    portfolio_name: string | null;
    company_id: number | null;
    customer_name: string | null;
    product_status: string | null;
    output_format: string | null;
    output_frequency: string | null;
    owner_id: string | null;
    creator_id: string | null;
    updated_at: string | null;
  };

  const typedProfiles = profiles as unknown as ProfileRow[];

  const companyIds = typedProfiles
    .map((profile) => profile.company_id)
    .filter((id): id is number => typeof id === "number");

  type CustomerRow = { company_id: number; company_name: string };
  let companyMap = new Map<number, string>();
  if (companyIds.length > 0) {
    const { data: customers } = await supabase
      .from("kasona_customer_basic_info")
      .select("company_id, company_name")
      .in("company_id", companyIds);
    if (customers) {
      const typedCustomers = customers as unknown as CustomerRow[];
      companyMap = new Map(typedCustomers.map((customer) => [customer.company_id, customer.company_name]));
    }
  }

  return typedProfiles.map((profile) => ({
    portfolio_id: profile.portfolio_id,
    portfolio_name: profile.portfolio_name,
    company_id: profile.company_id,
    company_name: profile.company_id ? companyMap.get(profile.company_id) ?? null : null,
    customer_name: profile.customer_name,
    product_status: profile.product_status,
    output_format: profile.output_format,
    output_frequency: profile.output_frequency,
    owner_id: profile.owner_id,
    creator_id: profile.creator_id,
    updated_at: profile.updated_at
  }));
}
