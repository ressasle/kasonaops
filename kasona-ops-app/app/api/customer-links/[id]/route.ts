import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  id: string;
};

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("kasona_customer_links").delete().eq("id", resolvedParams.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
