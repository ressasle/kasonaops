import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_PORTFOLIO_WEBHOOK = "https://n8n.srv1030093.hstgr.cloud/webhook/8b88b8a7-6f19-4274-a96a-5e863767d93e";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, filename, mimetype } = await req.json();

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing portfolio file: ${filename}, type: ${mimetype}`);

    // Forward to n8n workflow
    const response = await fetch(N8N_PORTFOLIO_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file,
        filename: filename || 'portfolio.pdf',
        mimetype: mimetype || 'application/pdf',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n workflow error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process portfolio file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('n8n workflow result:', JSON.stringify(result));

    // Helper: Convert German number format to standard float
    const parseGermanNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value !== 'string') return 0;
      
      // German format: 1.234,56 → English: 1234.56
      // Remove thousand separators (.) and replace decimal comma with dot
      const normalized = value
        .replace(/\s/g, '')        // Remove whitespace
        .replace(/€/g, '')         // Remove € symbol
        .replace(/\./g, '')        // Remove thousand separator (.)
        .replace(/,/g, '.');       // Replace decimal comma with dot
      
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Common ticker mappings for known companies
    const tickerMappings: Record<string, string> = {
      'shopify': 'SHOP',
      'microsoft': 'MSFT',
      'apple': 'AAPL',
      'amazon': 'AMZN',
      'alphabet': 'GOOGL',
      'google': 'GOOGL',
      'meta': 'META',
      'facebook': 'META',
      'nvidia': 'NVDA',
      'tesla': 'TSLA',
      'disney': 'DIS',
      'coca-cola': 'KO',
      'johnson': 'JNJ',
      'ibm': 'IBM',
      'intel': 'INTC',
      'netflix': 'NFLX',
      'paypal': 'PYPL',
      'salesforce': 'CRM',
      'adobe': 'ADBE',
      'zoom': 'ZM',
      'palantir': 'PLTR',
      'airbnb': 'ABNB',
      'berkshire': 'BRK.B',
      'visa': 'V',
      'mastercard': 'MA',
      'jpmorgan': 'JPM',
      'bank of america': 'BAC',
      // Additional mappings from user's portfolio
      'lvmh': 'MC',
      'moët': 'MC',
      'alibaba': 'BABA',
      'dbs group': 'D05.SI',
      'advanced micro': 'AMD',
      'amd': 'AMD',
      'coinbase': 'COIN',
      'crowdstrike': 'CRWD',
      'intuitive surgical': 'ISRG',
      'medpace': 'MEDP',
      'roche': 'ROG.SW',
      'servicenow': 'NOW',
      'snowflake': 'SNOW',
      'solaredge': 'SEDG',
      'tencent': 'TCEHY',
      'trade desk': 'TTD',
      'zoetis': 'ZTS',
      'ziprecruiter': 'ZIP',
      'clinica baviera': 'CBAV.MC',
    };

    // Helper: Derive ticker from company name
    const deriveTicker = (name: string, existingTicker?: string): string => {
      // If already a valid ticker (short uppercase string), keep it
      if (existingTicker && existingTicker.length <= 5 && /^[A-Z.]+$/.test(existingTicker)) {
        return existingTicker;
      }
      
      // Skip ISINs (12 characters starting with country code)
      if (existingTicker && /^[A-Z]{2}[A-Z0-9]{10}$/.test(existingTicker)) {
        // Try to derive from name instead
      }
      
      const nameLower = name.toLowerCase();
      
      // Check known mappings
      for (const [key, ticker] of Object.entries(tickerMappings)) {
        if (nameLower.includes(key)) {
          return ticker;
        }
      }
      
      // Fallback: Create ticker from first word (max 5 chars, uppercase)
      const firstWord = name.split(/[\s,.-]+/)[0].replace(/[^a-zA-Z]/g, '');
      return firstWord.substring(0, 5).toUpperCase() || 'N/A';
    };

    // Transform n8n response to frontend format with post-processing
    const holdings = result.holdings?.map((h: any) => {
      const name = h.name || '';
      const ticker = deriveTicker(name, h.ticker);
      const shares = parseGermanNumber(h.shares);
      const avgCost = parseGermanNumber(h.avgCost);
      
      console.log(`Processed holding: ${name} → ticker: ${ticker}, shares: ${shares}, avgCost: ${avgCost}`);
      
      return {
        ticker,
        name,
        shares,
        avgCost,
      };
    }) || [];

    return new Response(
      JSON.stringify({ holdings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-portfolio function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
