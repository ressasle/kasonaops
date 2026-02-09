import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversationId: string;
  account_id?: string;
  messageHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', content: 'Authentifizierung erforderlich.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', content: 'Ungültiges Token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL is not configured');
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    const { message, conversationId, account_id, messageHistory } = await req.json() as ChatRequest;

    console.log('Received chat request:', { 
      message: message?.substring(0, 50), 
      conversationId,
      account_id,
      userId,
      historyLength: messageHistory?.length 
    });

    // Call n8n webhook with account_id for multi-tenancy
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
        account_id,
        user_id: userId,
        messageHistory: messageHistory?.slice(-10),
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('n8n response received:', { 
      hasContent: !!n8nData.content,
      type: n8nData.type,
      hasPortfolioData: !!n8nData.portfolioData
    });

    // Return structured response
    return new Response(JSON.stringify({
      content: n8nData.content || n8nData.message || n8nData.output || 'Keine Antwort erhalten.',
      type: n8nData.type || 'text',
      metadata: {
        ticker: n8nData.ticker,
        thoughtProcess: n8nData.thoughtProcess,
        chartData: n8nData.chartData,
        tableData: n8nData.tableData,
        portfolioData: n8nData.portfolioData,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      content: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
      type: 'text',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
