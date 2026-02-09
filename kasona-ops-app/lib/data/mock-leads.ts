import fs from "fs/promises";
import path from "path";

import type { CustomerBasicInfo } from "@/lib/data/types";

type CsvRow = Record<string, string>;

let cachedLeads: CustomerBasicInfo[] | null = null;

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "," || char === "\n")) {
      row.push(current);
      current = "";
      if (char === "\n") {
        rows.push(row);
        row = [];
      }
      continue;
    }

    if (!inQuotes && char === "\r") {
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((rowItem) => rowItem.some((cell) => cell.trim().length > 0));
};

const mapRow = (row: CsvRow, index: number): CustomerBasicInfo => {
  const companyIdValue = row.company_id?.trim();
  const companyId = companyIdValue ? Number(companyIdValue) : 2610000 + index + 1;

  return {
    company_id: Number.isFinite(companyId) ? companyId : 2610000 + index + 1,
    company_name: row.company_name?.trim() || "Unknown",
    contact_person_name: null,
    contact_person_position: null,
    category: null,
    email: row["e-mail"]?.trim() || null,
    website: row.website?.trim() || null,
    phone: row.phone?.trim() || null,
    industry: (row.industry?.trim() as CustomerBasicInfo["industry"]) ?? null,
    action_status: "New",
    reminder_date: null,
    source: (row.Source?.trim() as CustomerBasicInfo["source"]) ?? null,
    type: "customer",
    n_portfolios: 0,
    status: "Lead Identified",
    product_type: row.Product?.trim() || null,
    hq_location: row.hq_location?.trim() || null,
    country: row.geo_scope?.trim() || null,
    created_at: row.created_at?.trim() || null,
    updated_at: row.updated_at?.trim() || null,
    contract_size: null,
    start_date: null,
    end_date: null,
    charge_type: (row.Charge?.trim() as CustomerBasicInfo["charge_type"]) ?? null,
    billing_type: (row.Billing?.trim() as CustomerBasicInfo["billing_type"]) ?? null,
    billing_address: null,
    billing_email: null,
    is_current: true,
    entered_at: row.fan_since_date?.trim() || null,
    exited_at: null,
    days_in_stage: null,
    expected_deal_value: null,
    probability: null,
    fit_tier: null,
    previous_stage: null,
    changed_by: null,
    change_reason: null,
    notes: row.comment?.trim() || null,
    payment_terms: null,
    owner_id: null,
    creator_id: null
  };
};

const csvPath = () =>
  path.resolve(
    process.cwd(),
    "..",
    "leads_list",
    "2.1.1.1_Waiting-List-Jan2026 - Sheet1.csv"
  );

export async function getMockLeads(): Promise<CustomerBasicInfo[]> {
  if (cachedLeads) return cachedLeads;

  try {
    const file = await fs.readFile(csvPath(), "utf-8");
    const rows = parseCsv(file);
    if (rows.length <= 1) {
      cachedLeads = [];
      return cachedLeads;
    }

    const headers = rows[0].map((header) => header.trim());
    const dataRows = rows.slice(1).map((row) => {
      const entry: CsvRow = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] ?? "";
      });
      return entry;
    });

    cachedLeads = dataRows.map(mapRow);
    return cachedLeads;
  } catch (error) {
    cachedLeads = [];
    return cachedLeads;
  }
}
