import type { CustomerBasicInfo } from "@/lib/data/types";

type FirecrawlScrapePayload = {
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      [key: string]: unknown;
    };
  };
};

type EnrichmentUpdates = Partial<
  Pick<
    CustomerBasicInfo,
    | "company_name"
    | "email"
    | "phone"
    | "industry"
    | "product_type"
    | "hq_location"
    | "country"
    | "notes"
  >
>;

type EnrichmentResult = {
  updates: EnrichmentUpdates;
  updatedFields: Array<keyof EnrichmentUpdates>;
  evidence: string[];
};

export type FirecrawlEnrichmentHistoryEntry = {
  date: string;
  website: string | null;
  title: string | null;
  description: string | null;
  evidence: string[];
};

const INDUSTRY_KEYWORDS: Array<{ keywords: string[]; value: CustomerBasicInfo["industry"] }> = [
  { keywords: ["investor", "investment", "asset management", "wealth"], value: "Investing" },
  { keywords: ["industrial", "manufacturing", "engineering"], value: "Industrial Services" },
  { keywords: ["consulting", "advisory", "strategy"], value: "Consulting" },
  { keywords: ["e-commerce", "online shop", "marketplace", "d2c"], value: "E-Commerce" }
];

const PRODUCT_KEYWORDS: Array<{ keywords: string[]; value: string }> = [
  { keywords: ["wealth intelligence", "portfolio intelligence", "market intelligence"], value: "Wealth Intelligence" },
  { keywords: ["quartals", "quarterly briefing", "quarterly report"], value: "Quartals-kompass" },
  { keywords: ["transformation", "turnaround", "transformation package"], value: "Transformations Paket" }
];

const normalizeWebsite = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

const pickFirstEmail = (text: string) => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  return match?.[0]?.toLowerCase() ?? null;
};

const pickFirstPhone = (text: string) => {
  const match = text.match(/(\+\d{1,3}[\s().-]?)?(\d[\d\s().-]{7,}\d)/);
  return match?.[0]?.trim() ?? null;
};

const sanitizeTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const primary = trimmed.split(/[|\-]/)[0]?.trim() ?? "";
  if (primary.length < 2) return null;
  return primary;
};

const findKeywordMatch = <T extends string | null>(
  text: string,
  mapping: Array<{ keywords: string[]; value: T }>
) => {
  const lower = text.toLowerCase();
  for (const candidate of mapping) {
    if (candidate.keywords.some((keyword) => lower.includes(keyword))) {
      return candidate.value;
    }
  }
  return null;
};

const extractLocation = (text: string) => {
  const match = text.match(/\b(?:headquartered|based)\s+in\s+([A-Za-z .-]+(?:,\s*[A-Za-z .-]+)?)/i);
  if (!match?.[1]) return { hq_location: null, country: null };

  const raw = match[1].trim();
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      hq_location: parts.slice(0, -1).join(", "),
      country: parts[parts.length - 1]
    };
  }

  return { hq_location: raw, country: null };
};

const buildNoteBlock = (params: {
  website: string;
  title: string | null;
  description: string | null;
  evidence: string[];
  currentNotes: string | null;
}) => {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    `[Firecrawl enrichment ${date}]`,
    `Website: ${params.website}`,
    params.title ? `Title: ${params.title}` : null,
    params.description ? `Description: ${params.description}` : null,
    params.evidence.length > 0 ? `Evidence: ${params.evidence.join(" | ")}` : null
  ].filter(Boolean);

  const block = lines.join("\n");
  return params.currentNotes?.trim() ? `${params.currentNotes}\n\n${block}` : block;
};

export function mapCustomerEnrichmentFromFirecrawl(
  customer: CustomerBasicInfo,
  scrapePayload: FirecrawlScrapePayload
): EnrichmentResult {
  const markdown = scrapePayload.data?.markdown ?? "";
  const title = sanitizeTitle(scrapePayload.data?.metadata?.title ?? "");
  const description = (scrapePayload.data?.metadata?.description ?? "").trim() || null;
  const website = normalizeWebsite(customer.website ?? "");

  const updates: EnrichmentUpdates = {};
  const evidence: string[] = [];

  if (!customer.company_name?.trim() && title) {
    updates.company_name = title;
    evidence.push(`company_name from title (${title})`);
  }

  const email = pickFirstEmail(markdown);
  if (!customer.email && email) {
    updates.email = email;
    evidence.push(`email found (${email})`);
  }

  const phone = pickFirstPhone(markdown);
  if (!customer.phone && phone) {
    updates.phone = phone;
    evidence.push(`phone found (${phone})`);
  }

  const industry = findKeywordMatch(markdown, INDUSTRY_KEYWORDS);
  if (!customer.industry && industry) {
    updates.industry = industry;
    evidence.push(`industry keyword (${industry})`);
  }

  const productType = findKeywordMatch(markdown, PRODUCT_KEYWORDS);
  if (!customer.product_type && productType) {
    updates.product_type = productType;
    evidence.push(`product keyword (${productType})`);
  }

  const location = extractLocation(markdown);
  if (!customer.hq_location && location.hq_location) {
    updates.hq_location = location.hq_location;
    evidence.push(`hq location found (${location.hq_location})`);
  }
  if (!customer.country && location.country) {
    updates.country = location.country;
    evidence.push(`country found (${location.country})`);
  }

  updates.notes = buildNoteBlock({
    website,
    title,
    description,
    evidence,
    currentNotes: customer.notes
  });

  const updatedFields = Object.keys(updates) as Array<keyof EnrichmentUpdates>;
  return { updates, updatedFields, evidence };
}

export function parseFirecrawlEnrichmentHistory(
  notes: string | null,
  limit = 5
): FirecrawlEnrichmentHistoryEntry[] {
  if (!notes?.trim()) return [];

  const markerRegex = /\[Firecrawl enrichment (\d{4}-\d{2}-\d{2})\]/g;
  const markers = [...notes.matchAll(markerRegex)];
  if (markers.length === 0) return [];

  const entries: FirecrawlEnrichmentHistoryEntry[] = [];

  for (let index = 0; index < markers.length; index++) {
    const marker = markers[index];
    const start = marker.index ?? 0;
    const end = index < markers.length - 1 ? (markers[index + 1].index ?? notes.length) : notes.length;
    const block = notes.slice(start, end).trim();
    const date = marker[1] ?? "";

    const websiteMatch = block.match(/^Website:\s*(.+)$/m);
    const titleMatch = block.match(/^Title:\s*(.+)$/m);
    const descriptionMatch = block.match(/^Description:\s*(.+)$/m);
    const evidenceMatch = block.match(/^Evidence:\s*(.+)$/m);

    entries.push({
      date,
      website: websiteMatch?.[1]?.trim() ?? null,
      title: titleMatch?.[1]?.trim() ?? null,
      description: descriptionMatch?.[1]?.trim() ?? null,
      evidence: evidenceMatch?.[1]
        ? evidenceMatch[1].split("|").map((value) => value.trim()).filter(Boolean)
        : []
    });
  }

  return entries.reverse().slice(0, Math.max(1, limit));
}
