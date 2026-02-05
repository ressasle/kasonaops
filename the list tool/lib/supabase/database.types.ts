export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Supabase types generated for project: nayggiozebvwqnpjzvvn
// Generated: 2026-02-04

export type Database = {
  public: {
    Tables: {
      kasona_portfolio_assets: {
        Row: {
          id: string
          portfolio_id: string | null
          company_id: number | null
          ticker: string | null
          ticker_eod: string | null
          isin: string | null
          stock_name: string | null
          exchange: string | null
          exchange_code: string | null
          country: string | null
          country_name: string | null
          category: string | null
          industry: string | null
          sector: string | null
          description: string | null
          officers: string | null
          website_url: string | null
          logo_url: string | null
          fiscal_year_end: string | null
          other_listings: Json | null
          watchtower: boolean | null
          enrichment_reviewed: boolean | null
          enrichment_reviewed_at: string | null
          enrichment_reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          company_id?: number | null
          ticker?: string | null
          ticker_eod?: string | null
          isin?: string | null
          stock_name?: string | null
          exchange?: string | null
          exchange_code?: string | null
          country?: string | null
          country_name?: string | null
          category?: string | null
          industry?: string | null
          sector?: string | null
          description?: string | null
          officers?: string | null
          website_url?: string | null
          logo_url?: string | null
          fiscal_year_end?: string | null
          other_listings?: Json | null
          watchtower?: boolean | null
          enrichment_reviewed?: boolean | null
          enrichment_reviewed_at?: string | null
          enrichment_reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          company_id?: number | null
          ticker?: string | null
          ticker_eod?: string | null
          isin?: string | null
          stock_name?: string | null
          exchange?: string | null
          exchange_code?: string | null
          country?: string | null
          country_name?: string | null
          category?: string | null
          industry?: string | null
          sector?: string | null
          description?: string | null
          officers?: string | null
          website_url?: string | null
          logo_url?: string | null
          fiscal_year_end?: string | null
          other_listings?: Json | null
          watchtower?: boolean | null
          enrichment_reviewed?: boolean | null
          enrichment_reviewed_at?: string | null
          enrichment_reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      asset_category:
        | "Aktien"
        | "ETF"
        | "Anleihen"
        | "Fonds"
        | "Immobilien"
        | "Rohstoffe"
        | "Krypto"
        | "Sonstiges"
    }
    CompositeTypes: {}
  }
}
