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
    const { query, condition, userType, location, filters } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all data from relevant tables
    const [trialsResult, researchersResult, questionsResult, publicationsResult] = await Promise.all([
      supabase.from('clinical_trials').select('*'),
      supabase.from('researcher_profiles').select('*'),
      supabase.from('forum_questions').select('*'),
      supabase.from('publications').select('*'),
    ])

    if (trialsResult.error) throw trialsResult.error
    if (researchersResult.error) throw researchersResult.error
    if (questionsResult.error) throw questionsResult.error
    if (publicationsResult.error) throw publicationsResult.error

    const trials = trialsResult.data || []
    const researchers = researchersResult.data || []
    const questions = questionsResult.data || []
    const publications = publicationsResult.data || []

    // Use AI to score and rank results
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const systemPrompt = `You are a medical search relevance expert. Score the relevance of clinical trials, researchers, forum questions, and publications on a scale of 0-100 based on the user's query, condition, user type, and location.

${userType === 'patient' ? 'PATIENT FOCUS: Prioritize practical information, patient-friendly language, local options, and supportive resources. Focus on trials they can join, accessible information, and community support.' : 'RESEARCHER FOCUS: Prioritize research quality, collaboration opportunities, academic rigor, and scientific depth. Focus on cutting-edge research, peer connections, and professional advancement.'}

${location ? `LOCATION PRIORITY: Give higher scores (+20 points) to items matching or near location: ${location}. For trials and researchers, proximity is very important.` : ''}

Return ONLY valid JSON with this exact structure:
{
  "trials": [{"id": "uuid", "score": 95, "reason": "brief explanation"}],
  "researchers": [{"id": "uuid", "score": 90, "reason": "brief explanation"}],
  "questions": [{"id": "uuid", "score": 85, "reason": "brief explanation"}],
  "publications": [{"id": "uuid", "score": 80, "reason": "brief explanation"}]
}

Only include items with score >= 30. Sort each array by score descending.`

    const userPrompt = `User type: ${userType || 'unknown'}
Query: "${query}"
Condition: "${condition || 'unknown'}"
${location ? `Location: "${location}"` : ''}

Clinical Trials:
${trials.map(t => `ID: ${t.id}, Title: ${t.title}, Description: ${t.description}, Phase: ${t.phase}, Status: ${t.status}${t.location ? `, Location: ${t.location}` : ''}`).join('\n')}

Researchers:
${researchers.map(r => `ID: ${r.id}, Name: ${r.name}, Specialty: ${r.specialty}, Institution: ${r.institution}${r.location ? `, Location: ${r.location}` : ''}, Interests: ${r.interests}`).join('\n')}

Forum Questions:
${questions.map(q => `ID: ${q.id}, Title: ${q.title}, Content: ${q.content}, Category: ${q.category}`).join('\n')}

Publications:
${publications.map(p => `ID: ${p.id}, Title: ${p.title}, Journal: ${p.journal}, Year: ${p.year}, Authors: ${p.authors}`).join('\n')}`

    console.log('Calling Lovable AI for search scoring...')
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
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const aiContent = aiResult.choices[0].message.content

    // Parse AI response
    let scores: any
    try {
      scores = JSON.parse(aiContent)
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent)
      // Fallback: return unscored results
      scores = {
        trials: trials.slice(0, 10).map(t => ({ id: t.id, score: 50, reason: 'Relevance unknown' })),
        researchers: researchers.slice(0, 10).map(r => ({ id: r.id, score: 50, reason: 'Relevance unknown' })),
        questions: questions.slice(0, 10).map(q => ({ id: q.id, score: 50, reason: 'Relevance unknown' })),
        publications: publications.slice(0, 10).map(p => ({ id: p.id, score: 50, reason: 'Relevance unknown' })),
      }
    }

    // Enrich scored results with full data
    const enrichedTrials = scores.trials?.map((scored: any) => {
      const trial = trials.find(t => t.id === scored.id)
      return trial ? { ...trial, matchScore: scored.score, matchReason: scored.reason } : null
    }).filter(Boolean) || []

    const enrichedResearchers = scores.researchers?.map((scored: any) => {
      const researcher = researchers.find(r => r.id === scored.id)
      return researcher ? { ...researcher, matchScore: scored.score, matchReason: scored.reason } : null
    }).filter(Boolean) || []

    const enrichedQuestions = scores.questions?.map((scored: any) => {
      const question = questions.find(q => q.id === scored.id)
      return question ? { ...question, matchScore: scored.score, matchReason: scored.reason } : null
    }).filter(Boolean) || []

    const enrichedPublications = scores.publications?.map((scored: any) => {
      const publication = publications.find(p => p.id === scored.id)
      return publication ? { ...publication, matchScore: scored.score, matchReason: scored.reason } : null
    }).filter(Boolean) || []

    console.log('Search completed successfully')
    return new Response(
      JSON.stringify({
        trials: enrichedTrials,
        researchers: enrichedResearchers,
        questions: enrichedQuestions,
        publications: enrichedPublications,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Search error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
