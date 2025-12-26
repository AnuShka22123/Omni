import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Initialize OpenAI only if API key is available
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

const VERDICT_TYPES: Record<string, { verdicts: string[], prompt: string }> = {
  'yes-no': {
    verdicts: ['YES', 'NO'],
    prompt: 'Analyze their specific situation deeply. Give a clear YES or NO verdict, then provide personalized, detailed advice (3-5 sentences) that: references specific details they mentioned, explains why this answer serves their unique circumstances, offers wisdom tailored to their situation, and helps them understand the path forward. Be mystical yet practical, decisive yet empathetic.',
  },
  'this-that': {
    verdicts: ['THIS', 'THAT'],
    prompt: 'Carefully consider both options they presented. Choose either THIS or THAT, then provide personalized, detailed advice (3-5 sentences) that: analyzes the specific details they shared about each option, explains why your chosen option aligns better with their unique situation and goals, references what they mentioned to show you understand their context, and offers wisdom that feels tailored specifically to them. Be mystical yet practical, decisive yet empathetic.',
  },
  'now-later': {
    verdicts: ['NOW', 'LATER'],
    prompt: 'Consider their specific situation and circumstances. Decide whether NOW or LATER is better, then provide personalized, detailed advice (3-5 sentences) that: references the specific details they shared about their situation, explains why the timing you chose aligns with their unique circumstances, considers what they mentioned about their current state and readiness, and offers wisdom that feels tailored specifically to them. Be mystical yet practical, decisive yet empathetic.',
  },
}

export async function POST(request: NextRequest) {
  let type = 'yes-no'
  let input = ''
  
  try {
    const body = await request.json()
    type = body.type || 'yes-no'
    input = body.input || ''

    if (!input || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const verdictConfig = VERDICT_TYPES[type] || VERDICT_TYPES['yes-no']

    // Check if OpenAI API key is available
    const openai = getOpenAIClient()
    
    if (!openai) {
      console.log('OpenAI API key not found, using fallback')
    }
    
    if (openai) {
      console.log('Using AI to generate personalized verdict for:', input.substring(0, 50))
      // Use AI to generate verdict
      const systemPrompt = `You are a wise, mystical decision advisor. CRITICAL INSTRUCTIONS:

1. You MUST read the user's input carefully and extract specific details they mentioned
2. Your justification MUST be 4-6 sentences minimum (aim for 5-7 sentences)
3. You MUST reference specific words, details, or circumstances from their input
4. DO NOT give generic advice like "This aligns better" or "The path forward is clear"
5. DO NOT use vague statements without context
6. Your response should feel like personalized counsel, not a template

GOOD EXAMPLE (for "Should I quit my job? I'm stressed and my boss is toxic"):
"Given that you mentioned your boss is toxic and you're experiencing stress, this environment is draining your energy in ways that won't resolve themselves. The toxicity you're facing suggests this isn't just a temporary challenge - it's a pattern that affects your wellbeing. Leaving now allows you to protect your mental health and find a space where you can thrive. The stress you're carrying isn't worth staying for. Trust that better opportunities await when you're not weighed down by this situation."

BAD EXAMPLE (too generic):
"The path forward is clear. Trust it."

Format your response as JSON: {"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "your detailed personalized justification (minimum 4-6 sentences, ideally 5-7)"}`

      const userPrompt = `Read the user's situation carefully. Extract specific details, words, and circumstances they mentioned.

${verdictConfig.prompt}

User's situation: "${input}"

IMPORTANT: Your justification MUST reference specific details from their situation above. Write 4-6 sentences that show you understand their unique circumstances. Be detailed and personalized, not generic.

Respond with only valid JSON in this exact format:
{"verdict": "VERDICT", "justification": "your detailed personalized justification"}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const result = JSON.parse(content)
        
        console.log('AI generated verdict:', result.verdict, 'Justification length:', result.justification?.length)
        
        // Validate verdict is one of the allowed options
        if (!verdictConfig.verdicts.includes(result.verdict)) {
          // Fallback: use hash-based selection if AI returns invalid verdict
          const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          result.verdict = verdictConfig.verdicts[hash % verdictConfig.verdicts.length]
        }

        // Ensure justification is detailed enough
        if (!result.justification || result.justification.length < 100) {
          console.warn('AI justification too short, regenerating...')
          throw new Error('Justification too short, need more detail')
        }

        return NextResponse.json({
          verdict: result.verdict,
          justification: result.justification || 'The decision is made. Move forward.',
        })
      }
    }
    
    // Fall through to fallback if no API key or AI fails
    throw new Error('AI not available, using fallback')
  } catch (error: any) {
    console.error('Verdict generation error:', error)
    
    // Fallback to deterministic verdict if AI fails
    const verdictConfig = VERDICT_TYPES[type] || VERDICT_TYPES['yes-no']
    const hash = (input || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const fallbackVerdicts = {
      'yes-no': ['The path forward is clear. Trust it.', 'Not now. The timing isn\'t right.'],
      'this-that': ['This aligns better with where you\'re heading.', 'That option serves you more in the long run.'],
      'now-later': ['Act now. Waiting won\'t improve this.', 'Later. The timing needs to be right.'],
    }
    
    return NextResponse.json({
      verdict: verdictConfig.verdicts[hash % verdictConfig.verdicts.length],
      justification: fallbackVerdicts[type as keyof typeof fallbackVerdicts]?.[hash % 2] || 'The decision is made. Move forward.',
    })
  }
}

