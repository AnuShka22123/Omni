import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

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

async function generateWithHuggingFace(prompt: string) {
  const token = process.env.HF_API_TOKEN
  if (!token) {
    console.log('HF_API_TOKEN not set, skipping HF generation')
    return null
  }

  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature: 0.8,
        max_new_tokens: 300,
        return_full_text: false,
      },
    }),
  })

  if (!response.ok) {
    console.error('Hugging Face error', response.status, await response.text())
    return null
  }

  const data = await response.json()
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data?.output
  return typeof text === 'string' ? text : null
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

    // Build the HF prompt
    const systemPrompt = `You are a wise, mystical decision advisor. CRITICAL INSTRUCTIONS:

1. Read the user's input carefully and extract specific details they mentioned
2. Justification MUST be 4-6 sentences (aim 5-7) and reference their details
3. Avoid generic advice like "This aligns better" or "The path forward is clear"
4. Provide personalized counsel, mystical yet practical

Format strictly as JSON: {"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "detailed justification"}`

    const userPrompt = `Decision type: ${type}

${verdictConfig.prompt}

User's situation: "${input}"

Respond ONLY with valid JSON as described above. Include specific details from the situation.`

    // Try Hugging Face first
    const hfText = await generateWithHuggingFace(`${systemPrompt}\n\n${userPrompt}`)
    if (hfText) {
      try {
        const parsed = JSON.parse(hfText)
        if (!parsed.verdict || !parsed.justification) {
          throw new Error('Missing fields')
        }

        // Validate verdict is one of the allowed options
        if (!verdictConfig.verdicts.includes(parsed.verdict)) {
          const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          parsed.verdict = verdictConfig.verdicts[hash % verdictConfig.verdicts.length]
        }

        return NextResponse.json({
          verdict: parsed.verdict,
          justification: parsed.justification,
        })
      } catch (err) {
        console.warn('HF response not JSON, falling back', err)
      }
    }

    // Fall through to fallback if HF not available or failed
    throw new Error('AI not available, using fallback')
  } catch (error: any) {
    console.error('AI generation unavailable, using fallback:', error?.message || error)
    
    // Fallback to deterministic verdict if AI fails
    const verdictConfig = VERDICT_TYPES[type] || VERDICT_TYPES['yes-no']
    const hash = (input || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Enhanced fallback justifications that are slightly more contextual
    const fallbackVerdicts: Record<string, string[]> = {
      'yes-no': [
        'The path forward is clear. Trust it.',
        'Not now. The timing isn\'t right.',
        'Your hesitation is the answer. Say no.',
        'The signs point to yes. Act on it.',
        'This isn\'t the right move. Decline.',
        'Yes. Stop overthinking and proceed.',
      ],
      'this-that': [
        'This aligns better with where you\'re heading.',
        'That option serves you more in the long run.',
        'This is the clearer choice. Choose it.',
        'That path offers more growth. Take it.',
        'This feels right. Trust that feeling.',
        'That option is the wiser move.',
      ],
      'now-later': [
        'Act now. Waiting won\'t improve this.',
        'Later. The timing needs to be right.',
        'Now is the moment. Don\'t delay.',
        'Wait. Better conditions are coming.',
        'Strike now. The opportunity is here.',
        'Later. You\'re not ready yet.',
      ],
    }
    
    const justifications = fallbackVerdicts[type] || fallbackVerdicts['yes-no']
    const justificationIndex = hash % justifications.length
    
    return NextResponse.json({
      verdict: verdictConfig.verdicts[hash % verdictConfig.verdicts.length],
      justification: justifications[justificationIndex] || 'The decision is made. Move forward.',
    })
  }
}

