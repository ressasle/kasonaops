import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { InvestorProfileUpdate } from "@/lib/data/types";

type Params = {
  portfolio_id: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const portfolioId = resolvedParams.portfolio_id;
  if (!portfolioId) {
    return NextResponse.json({ error: "Invalid portfolio_id" }, { status: 400 });
  }

  const payload = (await request.json()) as InvestorProfileUpdate;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_investor_profiles")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("portfolio_id", portfolioId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const portfolioId = resolvedParams.portfolio_id;
  if (!portfolioId) {
    return NextResponse.json({ error: "Invalid portfolio_id" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("kasona_investor_profiles").delete().eq("portfolio_id", portfolioId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
