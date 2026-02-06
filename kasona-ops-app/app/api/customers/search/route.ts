import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

const normalizeWebsite = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nameQuery = searchParams.get("name")?.trim() ?? "";
  const emailQuery = searchParams.get("email")?.trim() ?? "";
  const websiteQueryRaw = searchParams.get("website")?.trim() ?? "";
  const websiteQuery = websiteQueryRaw ? normalizeWebsite(websiteQueryRaw) : "";

  if (nameQuery.length < 2 && emailQuery.length < 3 && websiteQuery.length < 3) {
    return NextResponse.json({ data: [] });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ data: [] });
  }

  const filters: string[] = [];
  if (nameQuery.length >= 2) {
    filters.push(`company_name.ilike.%${nameQuery}%`);
  }
  if (emailQuery.length >= 3) {
    filters.push(`email.ilike.%${emailQuery}%`);
  }
  if (websiteQuery.length >= 3) {
    filters.push(`website.ilike.%${websiteQuery}%`);
  }

  let query = supabase
    .from("kasona_customer_basic_info")
    .select(
      "company_id, company_name, contact_person_name, email, website, phone, industry, status, action_status, source, type, expected_deal_value, probability, product_type, contract_size, charge_type, billing_type, billing_address, billing_email, start_date, end_date, is_current, entered_at, exited_at, days_in_stage, fit_tier, previous_stage, changed_by, change_reason, notes, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(6);

  if (filters.length > 0) {
    query = query.or(filters.join(","));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
