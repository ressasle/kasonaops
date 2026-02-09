import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL") || "https://n8n.srv1030093.hstgr.cloud/webhook/analyze-video";

interface N8nVideoAnalysisResponse {
  trust_index: {
    total_score: number;
    tier: string;
    rationale: string;
    components: {
      verbal_specificity: number;
      vocal_stability: number;
      visual_congruence: number;
    };
  };
  executive_summary: string;
  communication_score: {
    clarity: number;
    confidence: number;
    authenticity: number;
  };
  key_findings: Array<{
    timestamp: string;
    claim: string;
    linguistic_signal: string;
    visual_cue: string;
    investor_action: string;
  }>;
  follow_up_questions: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl, accountId } = await req.json();

    // Validate YouTube URL
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'YouTube URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing YouTube video: ${youtubeUrl}`);
    console.log(`Account ID: ${accountId || 'not provided'}`);

    // Call n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Input: youtubeUrl,
        url: youtubeUrl,
        account_id: accountId,
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Video analysis service error',
          details: `Status ${n8nResponse.status}`
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse n8n response - it returns the raw JSON text from Gemini
    const rawResponse = await n8nResponse.text();
    console.log('Raw n8n response length:', rawResponse.length);
    console.log('Raw n8n response:', rawResponse.substring(0, 500));

    // Check for empty response
    if (!rawResponse || rawResponse.trim() === '') {
      console.error('n8n returned empty response');
      return new Response(
        JSON.stringify({ 
          error: 'Video analysis service returned empty response. The n8n workflow may still be processing or encountered an issue.',
          suggestion: 'Please try again in a few moments. If the issue persists, the video may be too long or unavailable.'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let analysisData: N8nVideoAnalysisResponse;
    
    try {
      // The n8n response might be wrapped in markdown code blocks or be plain JSON
      let jsonString = rawResponse.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
      
      // Try to find JSON object in the response if it starts with other content
      if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
        const jsonStartIdx = jsonString.indexOf('{');
        if (jsonStartIdx !== -1) {
          jsonString = jsonString.substring(jsonStartIdx);
        }
      }
      
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError);
      console.error('Response content:', rawResponse.substring(0, 1000));
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse analysis response',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          raw: rawResponse.substring(0, 500)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform n8n response to our frontend format
    const transformedAnalysis = {
      id: crypto.randomUUID(),
      youtubeUrl,
      accountId,
      analyzedAt: new Date().toISOString(),
      
      // Trust Index (new from n8n)
      trustIndex: {
        totalScore: analysisData.trust_index?.total_score || 0,
        tier: analysisData.trust_index?.tier || 'Unknown',
        rationale: analysisData.trust_index?.rationale || '',
        components: {
          verbalSpecificity: analysisData.trust_index?.components?.verbal_specificity || 0,
          vocalStability: analysisData.trust_index?.components?.vocal_stability || 0,
          visualCongruence: analysisData.trust_index?.components?.visual_congruence || 0,
        }
      },
      
      // Executive summary
      executiveSummary: analysisData.executive_summary || '',
      
      // Communication scores
      communicationScore: {
        clarity: analysisData.communication_score?.clarity || 0,
        confidence: analysisData.communication_score?.confidence || 0,
        authenticity: analysisData.communication_score?.authenticity || 0,
      },
      
      // Key findings transformed to red flags format
      keyFindings: (analysisData.key_findings || []).map((finding, idx) => ({
        id: `kf-${idx}`,
        timestamp: finding.timestamp,
        claim: finding.claim,
        linguisticSignal: finding.linguistic_signal,
        visualCue: finding.visual_cue,
        investorAction: finding.investor_action,
      })),
      
      // Follow-up questions
      followUpQuestions: (analysisData.follow_up_questions || []).map((q, idx) => ({
        id: `fq-${idx}`,
        question: q,
        context: 'Generated from AI analysis',
        priority: idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low',
      })),
      
      // Legacy compatibility - map to existing structure
      overallSentiment: {
        confidence: analysisData.communication_score?.confidence ? analysisData.communication_score.confidence * 10 : 70,
        hedging: 100 - (analysisData.trust_index?.components?.verbal_specificity || 50),
        transparency: analysisData.communication_score?.authenticity ? analysisData.communication_score.authenticity * 10 : 60,
      },
      
      // Raw response for debugging
      rawResponse: analysisData,
    };

    console.log('Analysis complete:', transformedAnalysis.id);

    return new Response(
      JSON.stringify(transformedAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('analyze-executive-video error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
