-- Supabase Schema for CRM & Operations

-- 0. Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT, -- 'CEO', 'Sales', 'Assistant', 'Finance', 'Tech', 'AI Software'
    email TEXT
);

-- Initial Data
INSERT INTO team_members (name, role) VALUES
('Julian', 'CEO'),
('Jakob', 'Sales'),
('Clara', 'Assistant'),
('Niclas', 'Finance'),
('Kelvin', 'Tech'),
('Cedric', 'Tech'),
('Kasona', 'AI Software');

-- 1. Customer Basic Info
CREATE TABLE kasona_customer_basic_info (
    company_id SERIAL PRIMARY KEY, -- Starts at 2610001 automatically if sequence set
    company_name TEXT NOT NULL,
    contact_person_name TEXT,
    contact_person_position TEXT,
    category TEXT, -- 'high-profile', etc.
    email TEXT,
    website TEXT,
    phone TEXT,
    industry TEXT CHECK (industry IN ('Investing', 'Industrial Services', 'Consulting', 'E-Commerce')),
    action_status TEXT CHECK (action_status IN ('Renewed', 'To Expand', 'Backlog', 'New', 'To Check', 'Reminder Set', 'To Reach Out', 'Mail Sent')),
    reminder_date TIMESTAMPTZ,
    
    -- Sales Info
    source TEXT CHECK (source IN ('Inbound', 'Outbound')),
    type TEXT CHECK (type IN ('Customer', 'Warm Lead')),
    n_portfolios INT DEFAULT 0,
    status TEXT CHECK (status IN ('Churned', 'Closed Lost', 'Expanded', 'Closed Won', 'Paid User', 'Free User', 'Offer Sent', 'Offer Generated', 'Meeting Booked', 'Lead Manget Sent', 'Lead Enriched', 'Lead Captured', 'Lead Identified')),
    product_type TEXT, -- 'Wealth Intelligence', 'Transformations Paket', etc.
    
    -- Analytics Info
    hq_location TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Finance Info
    contract_size NUMERIC,
    start_date DATE,
    end_date DATE,
    charge_type TEXT CHECK (charge_type IN ('Reatiner', 'Per Hour', 'Package', 'Fixed Fee')),
    billing_type TEXT CHECK (billing_type IN ('Quarterly', 'Monthly', 'Project-based', 'Per Output')),
    billing_address TEXT,
    billing_email TEXT,

    -- Documentation Info
    is_current BOOLEAN DEFAULT TRUE,
    entered_at TIMESTAMPTZ,
    exited_at TIMESTAMPTZ,
    days_in_stage INT,
    expected_deal_value NUMERIC,
    probability INT,
    fit_tier TEXT,
    previous_stage TEXT,
    changed_by TEXT,
    change_reason TEXT,
    notes TEXT
);

-- 2. Investor Profile / Operations View
CREATE TABLE kasona_investor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id INT REFERENCES kasona_customer_basic_info(company_id),
    customer_name TEXT, -- Can be a computed field or denormalized
    portfolio_id TEXT UNIQUE NOT NULL, -- e.g., '261001-A'
    portfolio_name TEXT,
    creator_id UUID REFERENCES team_members(id),
    owner_id UUID REFERENCES team_members(id), -- Default Jakob
    
    -- Product Info
    product_status TEXT CHECK (product_status IN ('to create', 'created', 'to review', 'to send', 'sent out')),
    subscribed_quartals BOOLEAN DEFAULT FALSE, -- 2.1.1.1
    subscribed_stock_chatbot BOOLEAN DEFAULT FALSE, -- 2.1.1.2
    subscribed_portfolio_briefing BOOLEAN DEFAULT FALSE, -- 2.1.1.3
    subscribed_investment_analysis BOOLEAN DEFAULT FALSE, -- 2.1.1.4
    subscribed_deep_research BOOLEAN DEFAULT FALSE, -- 2.1.1.5
    subscribed_body_language_analysis BOOLEAN DEFAULT FALSE, -- 2.1.1.6
    last_document_link TEXT,
    
    -- Production Specific Info
    recipient_email TEXT,
    telegram_id TEXT,
    output_format TEXT CHECK (output_format IN ('Podcast', 'Newsletter', 'Other')),
    output_frequency TEXT CHECK (output_frequency IN ('weekly', 'bi-weekly', 'monthly', 'daily', 'quarterly')),
    days_to_check INT, -- 1 for daily, 7 for weekly, etc.
    
    -- AI / Strategy Configuration
    data_granularity INT CHECK (data_granularity BETWEEN 1 AND 5),
    action_frequency INT CHECK (action_frequency BETWEEN 1 AND 5),
    risk_appetite INT,
    decision_logic INT CHECK (decision_logic BETWEEN 1 AND 5),
    buy_box_trigger_1 TEXT,
    buy_box_trigger_2 TEXT,
    buy_box_trigger_3 TEXT,
    investment_philosophy TEXT,
    noise_filter TEXT, -- what not to hear
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Portfolio Assets
CREATE TABLE kasona_portfolio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id TEXT REFERENCES kasona_investor_profiles(portfolio_id),
    company_id INT REFERENCES kasona_customer_basic_info(company_id),
    ticker TEXT,
    stock_name TEXT,
    bourse TEXT, -- Deprecated; use exchange
    exchange TEXT,
    exchange_code TEXT,
    country TEXT,
    country_name TEXT,
    category TEXT,
    sector TEXT,
    industry TEXT,
    description TEXT,
    officers JSONB,
    owner_comment TEXT,
    currency TEXT,
    ticker_finnhub TEXT,
    ticker_eod TEXT,
    isin TEXT,
    asset_class TEXT CHECK (asset_class IN ('Crypto', 'Stocks', 'ETF', 'Other')), -- Dropdown
    watchtower BOOLEAN DEFAULT FALSE,
    -- EOD Enrichment Data
    website_url TEXT,
    logo_url TEXT,
    fiscal_year_end TEXT,
    other_listings JSONB
);

-- 4. Deals (Commercial milestones tied to a company)
CREATE TABLE kasona_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id INT REFERENCES kasona_customer_basic_info(company_id),
    deal_name TEXT,
    deal_stage TEXT,
    deal_status TEXT,
    won_at TIMESTAMPTZ,
    start_date DATE,
    end_date DATE,
    comment TEXT,
    billing_address TEXT,
    currency TEXT,
    amount_gross NUMERIC,
    amount_net NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions (Payment events linked to a deal or company)
CREATE TABLE kasona_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id INT REFERENCES kasona_customer_basic_info(company_id),
    deal_id UUID REFERENCES kasona_deals(id),
    transaction_date TIMESTAMPTZ,
    payment_method TEXT,
    card_issue_country TEXT,
    refunded BOOLEAN DEFAULT FALSE,
    processing_fees NUMERIC,
    net_revenue NUMERIC,
    gross_revenue NUMERIC,
    currency TEXT,
    external_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
