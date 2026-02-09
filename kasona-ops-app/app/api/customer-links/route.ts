import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type CreateCustomerLinkPayload = {
  company_id?: number;
  title?: string;
  url?: string;
  link_type?: "folder" | "document" | "website" | "other";
  created_by?: string;
};

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const companyId = Number(request.nextUrl.searchParams.get("company_id"));
  if (!Number.isFinite(companyId)) {
    return NextResponse.json({ error: "company_id query parameter is required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_customer_links")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const payload = (await request.json()) as CreateCustomerLinkPayload;
  if (!payload.company_id || !payload.title?.trim() || !payload.url?.trim()) {
    return NextResponse.json({ error: "company_id, title, and url are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_customer_links")
    .insert({
      company_id: payload.company_id,
      title: payload.title.trim(),
      url: payload.url.trim(),
      link_type: payload.link_type ?? "website",
      created_by: payload.created_by ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
