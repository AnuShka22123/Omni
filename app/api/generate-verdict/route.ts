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
    
    if (openai) {
      // Use AI to generate verdict
      const systemPrompt = `You are a wise, mystical decision advisor who provides deeply personalized guidance. Your role is to:
- Analyze the user's specific situation in detail
- Reference specific details they mentioned to show you understand their unique circumstances
- Provide personalized advice that feels tailored to them, not generic
- Be decisive and confident while remaining empathetic
- Use a mystical yet practical tone that empowers them
- Give detailed justifications (3-5 sentences) that elaborate on their situation
- Make them feel heard and understood

Your justifications should feel like personalized counsel, not generic advice. Reference what they said, acknowledge their specific circumstances, and provide wisdom that applies directly to their situation.

Format your response as JSON: {"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "your detailed personalized justification (3-5 sentences)"}`

      const userPrompt = `${verdictConfig.prompt}

User's situation: "${input}"

Respond with only valid JSON in this exact format:
{"verdict": "VERDICT", "justification": "justification text"}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const result = JSON.parse(content)
        
        // Validate verdict is one of the allowed options
        if (!verdictConfig.verdicts.includes(result.verdict)) {
          // Fallback: use hash-based selection if AI returns invalid verdict
          const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          result.verdict = verdictConfig.verdicts[hash % verdictConfig.verdicts.length]
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

