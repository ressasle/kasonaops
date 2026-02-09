import { NextResponse } from "next/server";

import { mapCustomerEnrichmentFromFirecrawl } from "@/lib/data/customer-enrichment";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerBasicInfo } from "@/lib/data/types";

type Params = {
  company_id: string;
};

type FirecrawlResponse = {
  success?: boolean;
  data?: {
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
  error?: string;
};

const FIRECRAWL_URL = "https://api.firecrawl.dev/v1/scrape";

export async function POST(_request: Request, { params }: { params: Promise<Params> }) {
  const resolved = await params;
  const companyId = Number(resolved.company_id);
  if (!Number.isFinite(companyId)) {
    return NextResponse.json({ error: "Invalid company_id" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;

  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlApiKey?.trim()) {
    return NextResponse.json({ error: "FIRECRAWL_API_KEY is not set" }, { status: 500 });
  }

  const { data: customer, error: customerError } = await supabaseAny
    .from("kasona_customer_basic_info")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const typedCustomer = customer as CustomerBasicInfo;

  if (typedCustomer.type === "partner" || typedCustomer.type === "supplier") {
    return NextResponse.json(
      { error: `Enrichment is disabled for customer type '${typedCustomer.type}'` },
      { status: 400 }
    );
  }

  const website = String(typedCustomer.website ?? "").trim();
  if (!website) {
    return NextResponse.json({ error: "Website is required for enrichment" }, { status: 400 });
  }

  const websiteUrl = website.startsWith("http://") || website.startsWith("https://") ? website : `https://${website}`;

  const firecrawlResponse = await fetch(FIRECRAWL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlApiKey}`
    },
    body: JSON.stringify({
      url: websiteUrl,
      formats: ["markdown"],
      onlyMainContent: true
    })
  });

  const firecrawlPayload = (await firecrawlResponse.json().catch(() => ({}))) as FirecrawlResponse;
  if (!firecrawlResponse.ok || firecrawlPayload.success === false) {
    return NextResponse.json(
      { error: firecrawlPayload.error ?? "Firecrawl scrape failed" },
      { status: 502 }
    );
  }

  const mapped = mapCustomerEnrichmentFromFirecrawl(typedCustomer, firecrawlPayload);

  const updatePayload = {
    ...mapped.updates,
    updated_at: new Date().toISOString(),
    status:
      mapped.updatedFields.filter((field) => field !== "notes").length > 0 &&
      ["Lead Identified", "Lead Captured", null].includes(typedCustomer.status)
        ? "Lead Enriched"
        : typedCustomer.status
  };

  const { data: updated, error: updateError } = await supabaseAny
    .from("kasona_customer_basic_info")
    .update(updatePayload)
    .eq("company_id", companyId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: updated,
    enrichment: {
      source: "firecrawl",
      website: websiteUrl,
      updated_fields: mapped.updatedFields,
      evidence: mapped.evidence
    }
  });
}
