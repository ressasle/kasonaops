import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerBasicInfoUpdate } from "@/lib/data/types";

type Params = {
  company_id: string;
};

export async function PATCH(request: Request, { params }: { params: Params }) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const companyId = Number(params.company_id);
  if (!Number.isFinite(companyId)) {
    return NextResponse.json({ error: "Invalid company_id" }, { status: 400 });
  }

  const payload = (await request.json()) as CustomerBasicInfoUpdate;

  const { data, error } = await supabase
    .from("kasona_customer_basic_info")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("company_id", companyId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const companyId = Number(params.company_id);
  if (!Number.isFinite(companyId)) {
    return NextResponse.json({ error: "Invalid company_id" }, { status: 400 });
  }

  const { error } = await supabase.from("kasona_customer_basic_info").delete().eq("company_id", companyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
