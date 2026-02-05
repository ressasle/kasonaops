import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PortfolioAssetInsert } from "@/lib/data/types";

type PortfolioAssetPayload = {
  assets?: PortfolioAssetInsert[];
  asset?: PortfolioAssetInsert;
};

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const payload = (await request.json()) as PortfolioAssetPayload;
  const assets = payload.assets ?? (payload.asset ? [payload.asset] : []);

  if (assets.length === 0) {
    return NextResponse.json({ error: "No assets provided" }, { status: 400 });
  }

  const invalid = assets.find((asset) => !asset.portfolio_id || asset.portfolio_id.trim().length === 0);
  if (invalid) {
    return NextResponse.json({ error: "portfolio_id is required for all assets" }, { status: 400 });
  }

  const { data, error } = await supabase.from("kasona_portfolio_assets").insert(assets).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data?.length ?? 0, data });
}
