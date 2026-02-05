import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { company_id, assets } = body;

    if (!company_id || !Array.isArray(assets)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Map assets to schema columns
    const dbAssets = assets.map((asset: any) => ({
        company_id,
        stock_name: asset.stock_name || asset.name,
        ticker: asset.ticker,
        isin: asset.isin,
        currency: asset.currency,
        asset_class: (['Crypto', 'Stocks', 'ETF', 'Other'].includes(asset.asset_class) ? asset.asset_class : 'Other') as 'Crypto' | 'Stocks' | 'ETF' | 'Other',
        sector: asset.sector,
        owner_comment: asset.owner_comment,
    }));

    const { data, error } = await supabase
        .from("kasona_portfolio_assets")
        .insert(dbAssets)
        .select();

    if (error) {
        console.error("Error saving portfolio assets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
