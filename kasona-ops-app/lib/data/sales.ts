import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SalesLead = {
  company_id: number;
  company_name: string;
  contact_person_name: string | null;
  email: string | null;
  status: string | null;
  action_status: string | null;
  expected_deal_value: number | null;
  contract_size: number | null;
  probability: number | null;
  updated_at: string | null;
};

export async function getSalesLeads(limit: number = 200): Promise<SalesLead[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("kasona_customer_basic_info")
    .select(
      "company_id, company_name, contact_person_name, email, status, action_status, expected_deal_value, contract_size, probability, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as SalesLead[];
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
