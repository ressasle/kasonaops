import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  id: string;
};

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const assetId = params.id;
  if (!assetId) {
    return NextResponse.json({ error: "Invalid asset id" }, { status: 400 });
  }

  const { error } = await supabase.from("kasona_portfolio_assets").delete().eq("id", assetId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
