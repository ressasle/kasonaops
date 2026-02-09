CREATE TABLE kasona_customer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INT REFERENCES kasona_customer_basic_info(company_id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT CHECK (link_type IN ('folder', 'document', 'website', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT REFERENCES kasona_team_members(member_id)
);
