export type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
};

export type CustomerBasicInfo = {
  company_id: number;
  company_name: string;
  contact_person_name: string | null;
  contact_person_position: string | null;
  category: string | null;
  email: string | null;
  website: string | null;
  phone: string | null;
  industry: "Investing" | "Industrial Services" | "Consulting" | "E-Commerce" | null;
  action_status:
    | "Renewed"
    | "To Expand"
    | "Backlog"
    | "New"
    | "To Check"
    | "Reminder Set"
    | "To Reach Out"
    | "Mail Sent"
    | null;
  reminder_date: string | null;
  source: "Inbound" | "Outbound" | null;
  type: "Customer" | "Warm Lead" | null;
  n_portfolios: number | null;
  status:
    | "Churned"
    | "Closed Lost"
    | "Expanded"
    | "Closed Won"
    | "Paid User"
    | "Free User"
    | "Offer Sent"
    | "Offer Generated"
    | "Meeting Booked"
    | "Lead Manget Sent"
    | "Lead Enriched"
    | "Lead Captured"
    | "Lead Identified"
    | null;
  product_type: string | null;
  hq_location: string | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
  contract_size: number | null;
  start_date: string | null;
  end_date: string | null;
  charge_type: "Reatiner" | "Per Hour" | "Package" | "Fixed Fee" | null;
  billing_type: "Quarterly" | "Monthly" | "Project-based" | "Per Output" | null;
  billing_address: string | null;
  billing_email: string | null;
  is_current: boolean | null;
  entered_at: string | null;
  exited_at: string | null;
  days_in_stage: number | null;
  expected_deal_value: number | null;
  probability: number | null;
  fit_tier: string | null;
  previous_stage: string | null;
  changed_by: string | null;
  change_reason: string | null;
  notes: string | null;
};

export type InvestorProfile = {
  id: string;
  company_id: number | null;
  customer_name: string | null;
  portfolio_id: string;
  portfolio_name: string | null;
  creator_id: string | null;
  owner_id: string | null;
  product_status: "to create" | "created" | "to review" | "to send" | "sent out" | null;
  subscribed_quartals: boolean | null;
  subscribed_stock_chatbot: boolean | null;
  subscribed_portfolio_briefing: boolean | null;
  subscribed_investment_analysis: boolean | null;
  subscribed_deep_research: boolean | null;
  subscribed_body_language_analysis: boolean | null;
  last_document_link: string | null;
  recipient_email: string | null;
  telegram_id: string | null;
  output_format: "Podcast" | "Newsletter" | "Other" | null;
  output_frequency: "weekly" | "bi-weekly" | "monthly" | "daily" | "quarterly" | null;
  days_to_check: number | null;
  data_granularity: number | null;
  action_frequency: number | null;
  risk_appetite: number | null;
  decision_logic: number | null;
  buy_box_trigger_1: string | null;
  buy_box_trigger_2: string | null;
  buy_box_trigger_3: string | null;
  investment_philosophy: string | null;
  noise_filter: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PortfolioAsset = {
  id: string;
  portfolio_id: string | null;
  company_id: number | null;
  ticker: string | null;
  stock_name: string | null;
  bourse: string | null;
  exchange: string | null;
  exchange_code: string | null;
  country: string | null;
  country_name: string | null;
  category: string | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
  officers: Record<string, unknown> | Array<Record<string, unknown>> | null;
  owner_comment: string | null;
  currency: string | null;
  ticker_finnhub: string | null;
  ticker_eod: string | null;
  isin: string | null;
  asset_class: "Crypto" | "Stocks" | "ETF" | "Other" | null;
  website_url: string | null;
  logo_url: string | null;
  fiscal_year_end: string | null;
  other_listings: Record<string, unknown> | Array<Record<string, unknown>> | null;
  watchtower: boolean | null;
};

export type CustomerBasicInfoInsert = Partial<CustomerBasicInfo> & {
  company_name: string;
};

export type CustomerBasicInfoUpdate = Partial<CustomerBasicInfo>;

export type InvestorProfileInsert = Partial<InvestorProfile> & {
  portfolio_id: string;
};

export type InvestorProfileUpdate = Partial<InvestorProfile>;

export type PortfolioAssetInsert = Partial<PortfolioAsset> & {
  portfolio_id: string;
};
