import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'
const HF_URL = `https://router.huggingface.co/models/${HF_MODEL}`

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

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.7,
          max_new_tokens: 400,
          return_full_text: false,
          top_p: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face error', response.status, errorText)
      
      // If model is loading, wait and retry once
      if (response.status === 503) {
        console.log('Model loading, waiting 10s and retrying...')
        await new Promise(resolve => setTimeout(resolve, 10000))
        return generateWithHuggingFace(prompt)
      }
      return null
    }

    const data = await response.json()
    const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data?.output
    
    if (typeof text === 'string' && text.trim().length > 50) {
      return text.trim()
    }
    return null
  } catch (error) {
    console.error('HF API call failed:', error)
    return null
  }
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

    // Build the HF prompt with Mistral chat format
    const systemPrompt = `You are a wise, mystical decision advisor. CRITICAL RULES:

1. ALWAYS prioritize positive, growth-oriented outcomes that serve the user's wellbeing
2. AVOID recommending harmful, dangerous, or clearly negative decisions
3. If a decision involves risk, choose the safer option that still allows progress
4. Reference specific details from their situation (4-6 sentences minimum)
5. Be thoughtful and consider consequences
6. Provide personalized counsel, not generic advice

IMPORTANT: Think carefully about which choice truly serves them best. Consider long-term impact, their wellbeing, and growth potential.`

    const userPrompt = `<s>[INST] ${systemPrompt}

Decision Type: ${type}
${verdictConfig.prompt}

User's Situation: "${input}"

Analyze this situation carefully. Consider:
- What serves their long-term wellbeing?
- Which option promotes growth and positive outcomes?
- What are the risks and benefits?
- What aligns with their values and goals?

Respond ONLY with valid JSON in this exact format:
{"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "Your detailed 4-6 sentence justification that references their specific situation and explains why this choice serves them best"}

Think step by step, then provide your response. [/INST]`

    // Try Hugging Face first
    const hfText = await generateWithHuggingFace(userPrompt)
    if (hfText) {
      try {
        // Extract JSON from response (might have extra text)
        let jsonText = hfText
        
        // Try to find JSON object in the response
        const jsonMatch = hfText.match(/\{[\s\S]*"verdict"[\s\S]*"justification"[\s\S]*\}/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        }
        
        const parsed = JSON.parse(jsonText)
        
        if (!parsed.verdict || !parsed.justification) {
          throw new Error('Missing fields')
        }

        // Validate verdict is one of the allowed options
        if (!verdictConfig.verdicts.includes(parsed.verdict)) {
          console.warn('Invalid verdict from AI:', parsed.verdict)
          const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          parsed.verdict = verdictConfig.verdicts[hash % verdictConfig.verdicts.length]
        }

        // Quality check: ensure justification is detailed enough
        if (parsed.justification.length < 100) {
          throw new Error('Justification too short')
        }

        console.log('✅ AI verdict generated:', parsed.verdict, 'Length:', parsed.justification.length)

        return NextResponse.json({
          verdict: parsed.verdict,
          justification: parsed.justification,
        })
      } catch (err) {
        console.warn('HF response parsing failed, trying to extract JSON:', err)
        console.log('Raw HF response:', hfText.substring(0, 200))
      }
    } else {
      console.log('⚠️ HF API returned no response, using fallback')
    }

    // Fall through to fallback if HF not available or failed
    throw new Error('AI not available, using fallback')
  } catch (error: any) {
    console.error('AI generation unavailable, using fallback:', error?.message || error)
    
    // Fallback to deterministic verdict if AI fails
    // Use smarter fallback that analyzes keywords for better decisions
    const verdictConfig = VERDICT_TYPES[type] || VERDICT_TYPES['yes-no']
    const hash = (input || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Analyze input for keywords to make smarter fallback decisions
    const inputLower = input.toLowerCase()
    const negativeKeywords = ['toxic', 'harmful', 'dangerous', 'bad', 'wrong', 'hurt', 'pain', 'stress', 'anxiety', 'fear', 'worry', 'problem', 'issue', 'difficult', 'hard', 'struggle']
    const positiveKeywords = ['good', 'better', 'best', 'growth', 'opportunity', 'chance', 'improve', 'help', 'support', 'positive', 'happy', 'joy', 'success']
    
    const hasNegative = negativeKeywords.some(kw => inputLower.includes(kw))
    const hasPositive = positiveKeywords.some(kw => inputLower.includes(kw))
    
    // Enhanced fallback justifications - prioritize positive outcomes
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
    let justificationIndex = hash % justifications.length
    
    // For yes-no: if negative keywords present, lean towards NO (safer)
    if (type === 'yes-no' && hasNegative && !hasPositive) {
      // Bias towards NO for negative situations
      const noVerdicts = ['NO', 'Not now. The timing isn\'t right.', 'This isn\'t the right move. Decline.', 'Your hesitation is the answer. Say no.']
      if (hash % 3 === 0) {
        return NextResponse.json({
          verdict: 'NO',
          justification: noVerdicts[hash % noVerdicts.length],
        })
      }
    }
    
    return NextResponse.json({
      verdict: verdictConfig.verdicts[hash % verdictConfig.verdicts.length],
      justification: justifications[justificationIndex] || 'The decision is made. Move forward.',
    })
  }
}

