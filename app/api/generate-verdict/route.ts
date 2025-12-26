import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const VERDICT_TYPES: Record<string, { verdicts: string[], prompt: string }> = {
  'yes-no': {
    verdicts: ['YES', 'NO'],
    prompt: 'Give a clear YES or NO answer, then provide a brief, mystical, and confident justification (1-2 sentences). Be decisive and wise.',
  },
  'this-that': {
    verdicts: ['THIS', 'THAT'],
    prompt: 'Choose either THIS or THAT, then provide a brief, mystical, and confident justification (1-2 sentences) explaining why this choice serves them better. Be decisive and wise.',
  },
  'now-later': {
    verdicts: ['NOW', 'LATER'],
    prompt: 'Decide whether NOW or LATER is better, then provide a brief, mystical, and confident justification (1-2 sentences). Be decisive and wise.',
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

    const systemPrompt = `You are a wise, mystical decision advisor. Your role is to provide clear, confident verdicts that help people move forward. 
Your responses should be:
- Decisive and confident
- Mystical but not vague
- Brief (1-2 sentences for justification)
- Empowering and actionable
- Match the tone: "The path forward is clear. Trust it." or "Not now. The timing isn't right."

Format your response as JSON: {"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "your brief mystical justification"}`

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
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

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

