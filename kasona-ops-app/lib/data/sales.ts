import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SalesFilters = {
  product?: string;
  status?: string;
  type?: string;
  ownerId?: string;
  search?: string;
};

export type SalesLead = {
  company_id: number;
  company_name: string;
  contact_person_name: string | null;
  email: string | null;
  product_type: string | null;
  type: string | null;
  owner_id: string | null;
  status: string | null;
  action_status: string | null;
  expected_deal_value: number | null;
  contract_size: number | null;
  probability: number | null;
  updated_at: string | null;
};

export async function getSalesLeads(limit: number = 200, filters: SalesFilters = {}): Promise<SalesLead[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("kasona_customer_basic_info")
    .select(
      "company_id, company_name, contact_person_name, email, product_type, type, owner_id, status, action_status, expected_deal_value, contract_size, probability, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (filters.product) query = query.eq("product_type", filters.product);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.search) {
    const term = filters.search.replace(/,/g, " ").trim();
    query = query.or(`company_name.ilike.%${term}%,contact_person_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, error } = await query.limit(limit);

  if (error || !data) return [];
  return data as SalesLead[];
}

export async function updateSalesLeadStatus(companyId: number, status: string): Promise<SalesLead | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_customer_basic_info")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("company_id", companyId)
    .select(
      "company_id, company_name, contact_person_name, email, product_type, type, owner_id, status, action_status, expected_deal_value, contract_size, probability, updated_at"
    )
    .single();

  if (error || !data) return null;
  return data as SalesLead;
}

export const PIPELINE_STAGES = [
  {
    id: "lead",
    label: "New Lead",
    color: "bg-cyan-500/20",
    statuses: ["Lead Identified", "Lead Captured"]
  },
  {
    id: "qualified",
    label: "Qualified",
    color: "bg-yellow-500/20",
    statuses: ["Lead Enriched", "Lead Manget Sent", "Free User"]
  },
  {
    id: "meeting",
    label: "Meeting Booked",
    color: "bg-orange-500/20",
    statuses: ["Meeting Booked"]
  },
  {
    id: "proposal",
    label: "Proposal Sent",
    color: "bg-primary/20",
    statuses: ["Offer Generated", "Offer Sent"]
  },
  {
    id: "free_user",
    label: "Free User",
    color: "bg-pink-500/20",
    statuses: ["Free User"]
  },
  {
    id: "won",
    label: "Won",
    color: "bg-green-500/20",
    statuses: ["Paid User", "Closed Won", "Expanded"]
  }
];

export const LOST_STATUSES = ["Closed Lost", "Churned"];
