import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user's favorites
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)

    if (favError) throw favError

    // Fetch full details for each favorite
    const trials = []
    const researchers = []
    const publications = []

    for (const fav of favorites || []) {
      if (fav.item_type === 'trial') {
        const { data } = await supabase.from('clinical_trials').select('*').eq('id', fav.item_id).single()
        if (data) trials.push(data)
      } else if (fav.item_type === 'researcher') {
        const { data } = await supabase.from('researcher_profiles').select('*').eq('id', fav.item_id).single()
        if (data) researchers.push(data)
      } else if (fav.item_type === 'publication') {
        const { data } = await supabase.from('publications').select('*').eq('id', fav.item_id).single()
        if (data) publications.push(data)
      }
    }

    // Generate AI summary
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const systemPrompt = `You are a medical research assistant. Create a comprehensive, easy-to-understand summary of the user's saved favorites for discussion with their doctor. Focus on:
- Key findings and relevance
- Important considerations
- Questions to ask their doctor
Format the response in clear sections with bullet points.`

    const userPrompt = `Create a summary of these saved items:

Clinical Trials (${trials.length}):
${trials.map(t => `- ${t.title}: ${t.description} (Phase: ${t.phase}, Status: ${t.status})`).join('\n')}

Researchers (${researchers.length}):
${researchers.map(r => `- ${r.name}, ${r.specialty} at ${r.institution}`).join('\n')}

Publications (${publications.length}):
${publications.map(p => `- ${p.title} by ${p.authors} (${p.journal}, ${p.year})`).join('\n')}`

    console.log('Calling Lovable AI for summary generation...')
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const summary = aiResult.choices[0].message.content

    console.log('Summary generated successfully')
    return new Response(
      JSON.stringify({ 
        summary,
        counts: {
          trials: trials.length,
          researchers: researchers.length,
          publications: publications.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Summarize favorites error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
