-- Supabase Schema for CRM & Operations

-- 0. Team Members
CREATE TABLE kasona_team_members (
    -- Identity
    member_id       TEXT PRIMARY KEY,           -- e.g. 'julian', 'jakob'
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    phone           TEXT,
    avatar_url      TEXT,

    -- HR / Employment
    date_of_birth   DATE,
    hire_date       DATE,
    termination_date DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    contract_type   TEXT CHECK (contract_type IN (
      'full_time', 'part_time', 'freelancer', 'working_student', 'intern'
    )),
    salary_gross    NUMERIC(10,2),
    salary_currency TEXT DEFAULT 'EUR',
    tax_id          TEXT,
    social_security_id TEXT,

    -- Address
    street          TEXT,
    city            TEXT,
    postal_code     TEXT,
    country         TEXT DEFAULT 'DE',

    -- Bank / Payroll
    iban            TEXT,
    bank_name       TEXT,

    -- App Role & Permissions
    role            TEXT NOT NULL CHECK (role IN (
      'admin', 'manager', 'analyst', 'assistant', 'viewer'
    )),
    department      TEXT CHECK (department IN (
      'management', 'sales', 'operations', 'finance', 'tech'
    )),
    job_title       TEXT,

    -- Auth Link (future)
    auth_user_id    UUID UNIQUE,

    -- Meta
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

-- Seed Data
INSERT INTO kasona_team_members (member_id, first_name, last_name, display_name, email, role, department, job_title, is_active) VALUES
  ('julian',  'Julian',  'Elsasser', 'Julian Elsasser',  'julian@elvision-analytics.com', 'admin',    'management',  'CEO',              TRUE),
  ('jakob',   'Jakob',   '',         'Jakob',             'jakob@elvision-analytics.com',  'manager',  'sales',       'Sales Lead',       TRUE),
  ('clara',   'Clara',   '',         'Clara',             'clara@elvision-analytics.com',  'assistant','operations',  'Assistant',        TRUE),
  ('niclas',  'Niclas',  '',         'Niclas',            'niclas@elvision-analytics.com', 'analyst',  'finance',     'Finance Analyst',  TRUE),
  ('kelvin',  'Kelvin',  '',         'Kelvin',            'kelvin@elvision-analytics.com', 'analyst',  'tech',        'Tech Lead',        TRUE),
  ('cedric',  'Cedric',  '',         'Cedric',            'cedric@elvision-analytics.com', 'analyst',  'tech',        'Developer',        TRUE),
  ('kasona',  'Kasona',  'AI',       'Kasona AI',         'kasona@elvision-analytics.com', 'viewer',   'tech',        'AI Software',      TRUE);

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
    type TEXT CHECK (type IN ('customer', 'partner', 'supplier', 'other')),
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
    charge_type TEXT CHECK (charge_type IN ('Retainer', 'Per Hour', 'Package', 'Fixed Fee')),
    billing_type TEXT CHECK (billing_type IN ('Quarterly', 'Monthly', 'Project-based', 'Per Output')),
    billing_address TEXT,
    billing_email TEXT,
    payment_terms INT, -- days, e.g. 14, 30, 60

    -- Ownership
    owner_id TEXT REFERENCES kasona_team_members(member_id),
    creator_id TEXT REFERENCES kasona_team_members(member_id),

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
    creator_id TEXT REFERENCES kasona_team_members(member_id),
    owner_id TEXT REFERENCES kasona_team_members(member_id),
    
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
