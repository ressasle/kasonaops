import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMockLeads } from "@/lib/data/mock-leads";
import type { CustomerBasicInfo, InvestorProfile, PortfolioAsset } from "@/lib/data/types";

export type Customer = CustomerBasicInfo;

export async function getCustomers(limit: number = 15): Promise<Customer[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const mocks = await getMockLeads();
    return mocks.slice(0, limit);
  }

  const { data, error } = await supabase
    .from("kasona_customer_basic_info")
    .select(
      "company_id, company_name, contact_person_name, contact_person_position, email, website, phone, industry, status, action_status, expected_deal_value, probability, product_type, source, type, contract_size, billing_type, charge_type, billing_address, billing_email, start_date, end_date, is_current, entered_at, exited_at, days_in_stage, fit_tier, previous_stage, changed_by, change_reason, notes, updated_at, created_at"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    const mocks = await getMockLeads();
    return mocks.slice(0, limit);
  }
  if (data.length === 0) {
    const mocks = await getMockLeads();
    return mocks.slice(0, limit);
  }
  return data as unknown as Customer[];
}

export async function getInvestorProfiles(): Promise<InvestorProfile[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("kasona_investor_profiles")
    .select(
      "id, company_id, customer_name, portfolio_id, portfolio_name, product_status, output_format, output_frequency, data_granularity, action_frequency, decision_logic, risk_appetite, last_document_link, recipient_email, telegram_id, investment_philosophy, noise_filter, updated_at, created_at"
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getPortfolioAssets(): Promise<PortfolioAsset[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("kasona_portfolio_assets")
    .select(
      "id, portfolio_id, company_id, ticker, stock_name, isin, asset_class, currency, sector, bourse, exchange, exchange_code, country, country_name, industry, description"
    )
    .order("portfolio_id", { ascending: true });

  if (error || !data) return [];
  return data;
}
