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

    // Fetch context about the patient
    const { data: profile } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch relevant clinical trials for the patient's condition
    const { data: trials } = await supabase
      .from('clinical_trials')
      .select('*')
      .ilike('condition', `%${profile?.condition || ''}%`)
      .eq('status', 'Recruiting')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch researchers specializing in the patient's condition
    const { data: researchers } = await supabase
      .from('researcher_profiles')
      .select('*')
      .ilike('specialty', `%${profile?.condition || ''}%`)
      .limit(10);

    // Fetch recent publications related to the patient's condition
    const { data: publications } = await supabase
      .from('publications')
      .select('*, researcher_profiles(name, institution)')
      .ilike('title', `%${profile?.condition || ''}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch forum questions related to the patient's condition
    const { data: questions } = await supabase
      .from('forum_questions')
      .select('*')
      .ilike('title', `%${profile?.condition || ''}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    const systemPrompt = `You are a compassionate AI health assistant for patients on a clinical trial discovery platform. Your name is HealthBot.

Your capabilities:
1. Help patients discover relevant clinical trials for their condition
2. Explain medical research and publications in simple, understandable terms
3. Provide information about researchers and institutions specializing in their condition
4. Answer questions about treatment options and clinical trials
5. Guide patients through the trial enrollment process
6. Connect patients with relevant forum discussions
7. Offer emotional support and encouragement

Current Patient Context:
- Name: ${profile?.name || 'Unknown'}
- Condition: ${profile?.condition || 'Not specified'}
- Location: ${profile?.location || 'Not specified'}

Available Data:
- ${trials?.length || 0} relevant clinical trials recruiting now
- ${researchers?.length || 0} researchers specializing in ${profile?.condition || 'this condition'}
- ${publications?.length || 0} recent research publications
- ${questions?.length || 0} related forum discussions

When patients ask about:
- Trials: Explain trial details in simple terms, eligibility criteria, and how to enroll
- Researchers: Share information about specialists who might help
- Publications: Summarize complex research findings in accessible language
- Treatment options: Provide balanced information while encouraging professional medical consultation
- Symptoms or concerns: Listen empathetically and guide to appropriate resources

Important Guidelines:
- Always be compassionate, clear, and supportive
- Use simple, non-medical language when possible
- Explain medical terms when you must use them
- Encourage patients to consult their healthcare providers for medical advice
- Provide hope and practical next steps
- Be honest about uncertainties in medical research`;

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
          trials: trials?.slice(0, 3),
          researchers: researchers?.slice(0, 3),
          publications: publications?.slice(0, 3),
          questions: questions?.slice(0, 3),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in patient-ai-bot:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
