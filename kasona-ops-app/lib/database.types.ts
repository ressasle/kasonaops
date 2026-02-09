
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            kasona_team_members: {
                Row: {
                    member_id: string
                    first_name: string
                    last_name: string
                    display_name: string
                    email: string
                    phone: string | null
                    avatar_url: string | null
                    date_of_birth: string | null
                    hire_date: string | null
                    termination_date: string | null
                    is_active: boolean
                    contract_type: 'full_time' | 'part_time' | 'freelancer' | 'working_student' | 'intern' | null
                    salary_gross: number | null
                    salary_currency: string | null
                    tax_id: string | null
                    social_security_id: string | null
                    street: string | null
                    city: string | null
                    postal_code: string | null
                    country: string | null
                    iban: string | null
                    bank_name: string | null
                    role: 'admin' | 'manager' | 'analyst' | 'assistant' | 'viewer'
                    department: 'management' | 'sales' | 'operations' | 'finance' | 'tech' | null
                    job_title: string | null
                    auth_user_id: string | null
                    created_at: string | null
                    updated_at: string | null
                    notes: string | null
                }
                Insert: {
                    member_id: string
                    first_name: string
                    last_name: string
                    display_name: string
                    email: string
                    phone?: string | null
                    avatar_url?: string | null
                    date_of_birth?: string | null
                    hire_date?: string | null
                    termination_date?: string | null
                    is_active?: boolean
                    contract_type?: 'full_time' | 'part_time' | 'freelancer' | 'working_student' | 'intern' | null
                    salary_gross?: number | null
                    salary_currency?: string | null
                    tax_id?: string | null
                    social_security_id?: string | null
                    street?: string | null
                    city?: string | null
                    postal_code?: string | null
                    country?: string | null
                    iban?: string | null
                    bank_name?: string | null
                    role: 'admin' | 'manager' | 'analyst' | 'assistant' | 'viewer'
                    department?: 'management' | 'sales' | 'operations' | 'finance' | 'tech' | null
                    job_title?: string | null
                    auth_user_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    notes?: string | null
                }
                Update: {
                    member_id?: string
                    first_name?: string
                    last_name?: string
                    display_name?: string
                    email?: string
                    phone?: string | null
                    avatar_url?: string | null
                    date_of_birth?: string | null
                    hire_date?: string | null
                    termination_date?: string | null
                    is_active?: boolean
                    contract_type?: 'full_time' | 'part_time' | 'freelancer' | 'working_student' | 'intern' | null
                    salary_gross?: number | null
                    salary_currency?: string | null
                    tax_id?: string | null
                    social_security_id?: string | null
                    street?: string | null
                    city?: string | null
                    postal_code?: string | null
                    country?: string | null
                    iban?: string | null
                    bank_name?: string | null
                    role?: 'admin' | 'manager' | 'analyst' | 'assistant' | 'viewer'
                    department?: 'management' | 'sales' | 'operations' | 'finance' | 'tech' | null
                    job_title?: string | null
                    auth_user_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    notes?: string | null
                }
            }
            kasona_customer_basic_info: {
                Row: {
                    company_id: number
                    company_name: string
                    contact_person_name: string | null
                    contact_person_position: string | null
                    category: string | null
                    email: string | null
                    website: string | null
                    phone: string | null
                    industry: 'Investing' | 'Industrial Services' | 'Consulting' | 'E-Commerce' | null
                    action_status: 'Renewed' | 'To Expand' | 'Backlog' | 'New' | 'To Check' | 'Reminder Set' | 'To Reach Out' | 'Mail Sent' | null
                    reminder_date: string | null
                    source: 'Inbound' | 'Outbound' | null
                    type: 'customer' | 'partner' | 'supplier' | 'other' | null
                    n_portfolios: number | null
                    status: 'Churned' | 'Closed Lost' | 'Expanded' | 'Closed Won' | 'Paid User' | 'Free User' | 'Offer Sent' | 'Offer Generated' | 'Meeting Booked' | 'Lead Manget Sent' | 'Lead Enriched' | 'Lead Captured' | 'Lead Identified' | null
                    product_type: string | null
                    hq_location: string | null
                    country: string | null
                    created_at: string | null
                    updated_at: string | null
                    contract_size: number | null
                    start_date: string | null
                    end_date: string | null
                    charge_type: 'Reatiner' | 'Per Hour' | 'Package' | 'Fixed Fee' | null
                    billing_type: 'Quarterly' | 'Monthly' | 'Project-based' | 'Per Output' | null
                    billing_address: string | null
                    billing_email: string | null
                    is_current: boolean | null
                    entered_at: string | null
                    exited_at: string | null
                    days_in_stage: number | null
                    expected_deal_value: number | null
                    probability: number | null
                    fit_tier: string | null
                    previous_stage: string | null
                    changed_by: string | null
                    change_reason: string | null
                    notes: string | null
                    payment_terms: number | null
                    owner_id: string | null
                }
                Insert: {
                    company_id?: number
                    company_name: string
                    contact_person_name?: string | null
                    contact_person_position?: string | null
                    category?: string | null
                    email?: string | null
                    website?: string | null
                    phone?: string | null
                    industry?: 'Investing' | 'Industrial Services' | 'Consulting' | 'E-Commerce' | null
                    action_status?: 'Renewed' | 'To Expand' | 'Backlog' | 'New' | 'To Check' | 'Reminder Set' | 'To Reach Out' | 'Mail Sent' | null
                    reminder_date?: string | null
                    source?: 'Inbound' | 'Outbound' | null
                    type?: 'customer' | 'partner' | 'supplier' | 'other' | null
                    n_portfolios?: number | null
                    status?: 'Churned' | 'Closed Lost' | 'Expanded' | 'Closed Won' | 'Paid User' | 'Free User' | 'Offer Sent' | 'Offer Generated' | 'Meeting Booked' | 'Lead Manget Sent' | 'Lead Enriched' | 'Lead Captured' | 'Lead Identified' | null
                    product_type?: string | null
                    hq_location?: string | null
                    country?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    contract_size?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    charge_type?: 'Reatiner' | 'Per Hour' | 'Package' | 'Fixed Fee' | null
                    billing_type?: 'Quarterly' | 'Monthly' | 'Project-based' | 'Per Output' | null
                    billing_address?: string | null
                    billing_email?: string | null
                    is_current?: boolean | null
                    entered_at?: string | null
                    exited_at?: string | null
                    days_in_stage?: number | null
                    expected_deal_value?: number | null
                    probability?: number | null
                    fit_tier?: string | null
                    previous_stage?: string | null
                    changed_by?: string | null
                    change_reason?: string | null
                    notes?: string | null
                    payment_terms?: number | null
                    owner_id?: string | null
                }
                Update: {
                    company_id?: number
                    company_name?: string
                    contact_person_name?: string | null
                    contact_person_position?: string | null
                    category?: string | null
                    email?: string | null
                    website?: string | null
                    phone?: string | null
                    industry?: 'Investing' | 'Industrial Services' | 'Consulting' | 'E-Commerce' | null
                    action_status?: 'Renewed' | 'To Expand' | 'Backlog' | 'New' | 'To Check' | 'Reminder Set' | 'To Reach Out' | 'Mail Sent' | null
                    reminder_date?: string | null
                    source?: 'Inbound' | 'Outbound' | null
                    type?: 'customer' | 'partner' | 'supplier' | 'other' | null
                    n_portfolios?: number | null
                    status?: 'Churned' | 'Closed Lost' | 'Expanded' | 'Closed Won' | 'Paid User' | 'Free User' | 'Offer Sent' | 'Offer Generated' | 'Meeting Booked' | 'Lead Manget Sent' | 'Lead Enriched' | 'Lead Captured' | 'Lead Identified' | null
                    product_type?: string | null
                    hq_location?: string | null
                    country?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    contract_size?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    charge_type?: 'Reatiner' | 'Per Hour' | 'Package' | 'Fixed Fee' | null
                    billing_type?: 'Quarterly' | 'Monthly' | 'Project-based' | 'Per Output' | null
                    billing_address?: string | null
                    billing_email?: string | null
                    is_current?: boolean | null
                    entered_at?: string | null
                    exited_at?: string | null
                    days_in_stage?: number | null
                    expected_deal_value?: number | null
                    probability?: number | null
                    fit_tier?: string | null
                    previous_stage?: string | null
                    changed_by?: string | null
                    change_reason?: string | null
                    notes?: string | null
                    payment_terms?: number | null
                    owner_id?: string | null
                }
            }
            kasona_investor_profiles: {
                Row: {
                    id: string
                    company_id: number | null
                    customer_name: string | null
                    portfolio_id: string
                    portfolio_name: string | null
                    creator_id: string | null
                    owner_id: string | null
                    product_status: 'to create' | 'created' | 'to review' | 'to send' | 'sent out' | null
                    subscribed_quartals: boolean | null
                    subscribed_stock_chatbot: boolean | null
                    subscribed_portfolio_briefing: boolean | null
                    subscribed_investment_analysis: boolean | null
                    subscribed_deep_research: boolean | null
                    subscribed_body_language_analysis: boolean | null
                    last_document_link: string | null
                    recipient_email: string | null
                    telegram_id: string | null
                    output_format: 'Podcast' | 'Newsletter' | 'Other' | null
                    output_frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'daily' | 'quarterly' | null
                    days_to_check: number | null
                    data_granularity: number | null
                    action_frequency: number | null
                    risk_appetite: number | null
                    decision_logic: number | null
                    buy_box_trigger_1: string | null
                    buy_box_trigger_2: string | null
                    buy_box_trigger_3: string | null
                    investment_philosophy: string | null
                    noise_filter: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    company_id?: number | null
                    customer_name?: string | null
                    portfolio_id: string
                    portfolio_name?: string | null
                    creator_id?: string | null
                    owner_id?: string | null
                    product_status?: 'to create' | 'created' | 'to review' | 'to send' | 'sent out' | null
                    subscribed_quartals?: boolean | null
                    subscribed_stock_chatbot?: boolean | null
                    subscribed_portfolio_briefing?: boolean | null
                    subscribed_investment_analysis?: boolean | null
                    subscribed_deep_research?: boolean | null
                    subscribed_body_language_analysis?: boolean | null
                    last_document_link?: string | null
                    recipient_email?: string | null
                    telegram_id?: string | null
                    output_format?: 'Podcast' | 'Newsletter' | 'Other' | null
                    output_frequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'daily' | 'quarterly' | null
                    days_to_check?: number | null
                    data_granularity?: number | null
                    action_frequency?: number | null
                    risk_appetite?: number | null
                    decision_logic?: number | null
                    buy_box_trigger_1?: string | null
                    buy_box_trigger_2?: string | null
                    buy_box_trigger_3?: string | null
                    investment_philosophy?: string | null
                    noise_filter?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    company_id?: number | null
                    customer_name?: string | null
                    portfolio_id?: string
                    portfolio_name?: string | null
                    creator_id?: string | null
                    owner_id?: string | null
                    product_status?: 'to create' | 'created' | 'to review' | 'to send' | 'sent out' | null
                    subscribed_quartals?: boolean | null
                    subscribed_stock_chatbot?: boolean | null
                    subscribed_portfolio_briefing?: boolean | null
                    subscribed_investment_analysis?: boolean | null
                    subscribed_deep_research?: boolean | null
                    subscribed_body_language_analysis?: boolean | null
                    last_document_link?: string | null
                    recipient_email?: string | null
                    telegram_id?: string | null
                    output_format?: 'Podcast' | 'Newsletter' | 'Other' | null
                    output_frequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'daily' | 'quarterly' | null
                    days_to_check?: number | null
                    data_granularity?: number | null
                    action_frequency?: number | null
                    risk_appetite?: number | null
                    decision_logic?: number | null
                    buy_box_trigger_1?: string | null
                    buy_box_trigger_2?: string | null
                    buy_box_trigger_3?: string | null
                    investment_philosophy?: string | null
                    noise_filter?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            kasona_portfolio_assets: {
                Row: {
                    id: string
                    portfolio_id: string | null
                    company_id: number | null
                    ticker: string | null
                    stock_name: string | null
                    bourse: string | null
                    exchange: string | null
                    exchange_code: string | null
                    country: string | null
                    country_name: string | null
                    category: string | null
                    sector: string | null
                    industry: string | null
                    description: string | null
                    officers: Json | null
                    owner_comment: string | null
                    currency: string | null
                    ticker_finnhub: string | null
                    ticker_eod: string | null
                    isin: string | null
                    asset_class: 'Crypto' | 'Stocks' | 'ETF' | 'Other' | null
                    website_url: string | null
                    logo_url: string | null
                    fiscal_year_end: string | null
                    other_listings: Json | null
                    watchtower: boolean | null
                }
                Insert: {
                    id?: string
                    portfolio_id?: string | null
                    company_id?: number | null
                    ticker?: string | null
                    stock_name?: string | null
                    bourse?: string | null
                    exchange?: string | null
                    exchange_code?: string | null
                    country?: string | null
                    country_name?: string | null
                    category?: string | null
                    sector?: string | null
                    industry?: string | null
                    description?: string | null
                    officers?: Json | null
                    owner_comment?: string | null
                    currency?: string | null
                    ticker_finnhub?: string | null
                    ticker_eod?: string | null
                    isin?: string | null
                    asset_class?: 'Crypto' | 'Stocks' | 'ETF' | 'Other' | null
                    website_url?: string | null
                    logo_url?: string | null
                    fiscal_year_end?: string | null
                    other_listings?: Json | null
                    watchtower?: boolean | null
                }
                Update: {
                    id?: string
                    portfolio_id?: string | null
                    company_id?: number | null
                    ticker?: string | null
                    stock_name?: string | null
                    bourse?: string | null
                    exchange?: string | null
                    exchange_code?: string | null
                    country?: string | null
                    country_name?: string | null
                    category?: string | null
                    sector?: string | null
                    industry?: string | null
                    description?: string | null
                    officers?: Json | null
                    owner_comment?: string | null
                    currency?: string | null
                    ticker_finnhub?: string | null
                    ticker_eod?: string | null
                    isin?: string | null
                    asset_class?: 'Crypto' | 'Stocks' | 'ETF' | 'Other' | null
                    website_url?: string | null
                    logo_url?: string | null
                    fiscal_year_end?: string | null
                    other_listings?: Json | null
                    watchtower?: boolean | null
                }
            }
            kasona_deals: {
                Row: {
                    id: string
                    company_id: number | null
                    deal_name: string | null
                    deal_stage: string | null
                    deal_status: string | null
                    won_at: string | null
                    start_date: string | null
                    end_date: string | null
                    comment: string | null
                    billing_address: string | null
                    currency: string | null
                    amount_gross: number | null
                    amount_net: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    company_id?: number | null
                    deal_name?: string | null
                    deal_stage?: string | null
                    deal_status?: string | null
                    won_at?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    comment?: string | null
                    billing_address?: string | null
                    currency?: string | null
                    amount_gross?: number | null
                    amount_net?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    company_id?: number | null
                    deal_name?: string | null
                    deal_stage?: string | null
                    deal_status?: string | null
                    won_at?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    comment?: string | null
                    billing_address?: string | null
                    currency?: string | null
                    amount_gross?: number | null
                    amount_net?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            kasona_transactions: {
                Row: {
                    id: string
                    company_id: number | null
                    deal_id: string | null
                    transaction_date: string | null
                    payment_method: string | null
                    card_issue_country: string | null
                    refunded: boolean | null
                    processing_fees: number | null
                    net_revenue: number | null
                    gross_revenue: number | null
                    currency: string | null
                    external_reference: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    company_id?: number | null
                    deal_id?: string | null
                    transaction_date?: string | null
                    payment_method?: string | null
                    card_issue_country?: string | null
                    refunded?: boolean | null
                    processing_fees?: number | null
                    net_revenue?: number | null
                    gross_revenue?: number | null
                    currency?: string | null
                    external_reference?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    company_id?: number | null
                    deal_id?: string | null
                    transaction_date?: string | null
                    payment_method?: string | null
                    card_issue_country?: string | null
                    refunded?: boolean | null
                    processing_fees?: number | null
                    net_revenue?: number | null
                    gross_revenue?: number | null
                    currency?: string | null
                    external_reference?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
