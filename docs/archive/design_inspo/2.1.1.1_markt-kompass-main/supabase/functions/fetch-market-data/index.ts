import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching market data from Kasona database...');

    // Connect to external Kasona Supabase
    const kasonaUrl = Deno.env.get('KASONA_SUPABASE_URL');
    const kasonaKey = Deno.env.get('KASONA_SUPABASE_ANON_KEY');

    if (!kasonaUrl || !kasonaKey) {
      throw new Error('Missing Kasona Supabase credentials');
    }

    const kasona = createClient(kasonaUrl, kasonaKey);

    // Fetch all market data tables in parallel
    const [currenciesRes, exchangeRatesRes, indicesRes, rawMaterialsRes] = await Promise.all([
      kasona.from('currencies').select('*'),
      kasona.from('exchange_rates').select('*'),
      kasona.from('indices').select('*'),
      kasona.from('raw_materials').select('*'),
    ]);

    if (currenciesRes.error) throw currenciesRes.error;
    if (exchangeRatesRes.error) throw exchangeRatesRes.error;
    if (indicesRes.error) throw indicesRes.error;
    if (rawMaterialsRes.error) throw rawMaterialsRes.error;

    const marketData = {
      currencies: currenciesRes.data || [],
      exchangeRates: exchangeRatesRes.data || [],
      indices: indicesRes.data || [],
      rawMaterials: rawMaterialsRes.data || [],
      timestamp: new Date().toISOString(),
    };

    console.log('Kasona market data fetched successfully:', {
      currencies: marketData.currencies.length,
      exchangeRates: marketData.exchangeRates.length,
      indices: marketData.indices.length,
      rawMaterials: marketData.rawMaterials.length,
    });

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Kasona market data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        currencies: [],
        exchangeRates: [],
        indices: [],
        rawMaterials: [],
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
