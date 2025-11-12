import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, userId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch context about the researcher
    const { data: profile } = await supabase
      .from('researcher_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch available researchers for collaboration
    const { data: researchers } = await supabase
      .from('researcher_profiles')
      .select('*')
      .neq('user_id', userId)
      .limit(10);

    // Fetch clinical trials
    const { data: trials } = await supabase
      .from('clinical_trials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent publications
    const { data: publications } = await supabase
      .from('publications')
      .select('*, researcher_profiles(name, institution)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch forum questions
    const { data: questions } = await supabase
      .from('forum_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch existing collaboration requests
    const { data: collaborations } = await supabase
      .from('collaboration_requests')
      .select('*, researcher_profiles!collaboration_requests_to_user_id_fkey(name, specialty, institution)')
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    const systemPrompt = `You are an AI assistant for researchers on a clinical trial collaboration platform. Your name is ResearchBot.

Your capabilities:
1. Help discover relevant researchers, institutions, and clinical trials
2. Assist with profile management and updates
3. Provide information about publications and trials
4. Facilitate connections between researchers
5. Help indicate collaboration availability
6. Show trending publications and trials
7. Engage in field-specific discussions

Current User Context:
- Name: ${profile?.name || 'Unknown'}
- Specialty: ${profile?.specialty || 'Not specified'}
- Institution: ${profile?.institution || 'Not specified'}
- Research Interests: ${profile?.interests || 'Not specified'}

Available Data:
- ${researchers?.length || 0} other researchers in the network
- ${trials?.length || 0} active clinical trials
- ${publications?.length || 0} recent publications
- ${questions?.length || 0} forum discussions
- ${collaborations?.length || 0} collaboration requests sent

When users ask about:
- Researchers: Provide info from the researchers list
- Trials: Share details from clinical trials
- Publications: Highlight recent publications
- Collaborations: Help them understand connection opportunities
- Profile: Offer to help update their information
- Discussions: Point them to relevant forum topics

Be conversational, helpful, and provide actionable insights. When recommending researchers or trials, explain why they might be relevant based on the user's specialty and interests.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const botMessage = aiData.choices[0].message.content;

    // Include relevant data for the frontend to display
    return new Response(
      JSON.stringify({
        message: botMessage,
        context: {
          researchers: researchers?.slice(0, 3),
          trials: trials?.slice(0, 3),
          publications: publications?.slice(0, 3),
          questions: questions?.slice(0, 3),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in researcher-ai-bot:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
