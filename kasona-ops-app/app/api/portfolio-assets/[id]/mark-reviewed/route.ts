import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assetId } = await context.params;
        const body = await request.json();
        const reviewedBy = body.reviewed_by || "user";

        const { data, error } = await supabase
            .from("kasona_portfolio_assets")
            .update({
                enrichment_reviewed: true,
                enrichment_reviewed_at: new Date().toISOString(),
                enrichment_reviewed_by: reviewedBy
            })
            .eq("id", assetId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data, success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
