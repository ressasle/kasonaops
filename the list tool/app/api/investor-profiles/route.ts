import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const payload = await request.json();

  if (!payload.company_id) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kasona_investor_profiles")
    .insert({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving investor profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
