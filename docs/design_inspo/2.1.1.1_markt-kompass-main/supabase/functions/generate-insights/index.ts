import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewData, type, question, context } = await req.json();
    
    console.log('Generating AI insights for review data...');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let systemMessage = 'Du bist ein Finanzberater, der die Quartalsreview-Methode von Dr. Markus Elsässer anwendet. Fokus auf langfristiges Denken, Reflexion statt Reizüberflutung.';

    if (type === 'questions') {
      prompt = `Basierend auf folgenden Quartalsdaten eines Investors, generiere 3-5 gezielte Fragen, die ihm helfen, seine Daten besser zu bewerten:

Daten: ${JSON.stringify(reviewData, null, 2)}

Formatiere die Ausgabe OHNE Markdown als einfache Liste:
• Frage 1
• Frage 2
• Frage 3

Keine Sonderzeichen wie **, _, # verwenden. Nur einfache Aufzählungszeichen.`;
    } else if (type === 'chat') {
      prompt = `Ein Investor hat folgende Frage zu seinen Quartalsdaten:

Frage: ${question}

Kontext (bisherige Analyse): ${context}

Quartalsdaten: ${JSON.stringify(reviewData, null, 2)}

Antworte präzise und hilfreich auf die Frage. Formatiere die Antwort OHNE Markdown, nutze einfache Absätze und Aufzählungen mit • statt **.`;
    } else {
      prompt = `Du bist ein Finanzberater nach Dr. Markus Elsässer's Methode. Basierend auf folgenden Quartalsdaten, generiere 3-5 konkrete Schlussfolgerungen für die langfristige Anlagestrategie:

Daten: ${JSON.stringify(reviewData, null, 2)}

Formatiere die Ausgabe OHNE Markdown als einfache nummerierte Liste:
1) Schlussfolgerung eins mit Erklärung
2) Schlussfolgerung zwei mit Erklärung
3) Schlussfolgerung drei mit Erklärung

Antworte auf Deutsch, prägnant und fokussiert auf langfristige Perspektive statt kurzfristige Marktbewegungen. Verwende KEINE Sonderzeichen wie **, _, # für Formatierung.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('AI insights generated successfully');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
