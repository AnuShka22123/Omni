import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Using Groq - free tier, fast, no credit card required
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant' // Fast and free

const VERDICT_TYPES: Record<string, { verdicts: string[], prompt: string }> = {
  'yes-no': {
    verdicts: ['YES', 'NO'],
    prompt: 'Analyze the situation. Deliver a final YES or NO verdict. One declarative statement maximum (1-2 sentences). Be demanding, authoritative, and final. No empathy. No debate. The verdict stands.',
  },
  'this-that': {
    verdicts: ['THIS', 'THAT'],
    prompt: 'Evaluate both options. Choose THIS or THAT. One declarative statement maximum (1-2 sentences). Be demanding, authoritative, and final. No empathy. No debate. The verdict stands.',
  },
  'now-later': {
    verdicts: ['NOW', 'LATER'],
    prompt: 'Assess timing. Decide NOW or LATER. One declarative statement maximum (1-2 sentences). Be demanding, authoritative, and final. No empathy. No debate. The verdict stands.',
  },
}

async function generateWithGroq(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.log('GROQ_API_KEY not set, skipping AI generation')
    return null
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (typeof content === 'string' && content.trim().length > 50) {
      return content.trim()
    }
    return null
  } catch (error) {
    console.error('Groq API call failed:', error)
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

    // Build the AI prompt - demanding, intentional, authoritative
    const systemPrompt = `You are a verdict system. You deliver final outcomes. CRITICAL RULES:

1. You are NOT an advisor, guru, oracle, or helper. You are a system.
2. Deliver verdicts in 1-2 sentences maximum. No paragraphs. No explanations.
3. Use declarative statements. Be demanding. Be final. Be unconcerned with approval.
4. Prioritize outcomes that reduce risk and complexity.
5. Avoid harmful decisions, but do not be empathetic or reassuring.
6. Your tone is reserved, controlled, slightly intimidating.
7. The verdict is not up for debate. It stands.

EXAMPLES OF CORRECT FORMAT:
- "This decision is driven by emotion, not readiness."
- "Delay reduces risk. Acting now increases it."
- "You're reacting to boredom, not readiness."
- "This is not the right moment."

EXAMPLES OF INCORRECT FORMAT (DO NOT USE):
- "While quitting your job might feel liberating..."
- "I understand this is difficult, but..."
- "You might want to consider..."
- "It depends on your situation..."

Format your response as JSON: {"verdict": "YES/NO/THIS/THAT/NOW/LATER", "justification": "one declarative statement, 1-2 sentences maximum"}`

    const userPrompt = `Decision Type: ${type}

${verdictConfig.prompt}

Input: "${input}"

Deliver the verdict. One statement. Final.`

    // Try Groq AI first
    const aiResponse = await generateWithGroq(systemPrompt, userPrompt)
    if (aiResponse) {
      try {
        // Extract JSON from response (might have extra text)
        let jsonText = aiResponse
        
        // Try to find JSON object in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*"verdict"[\s\S]*"justification"[\s\S]*\}/)
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

        // Quality check: ensure justification exists and is reasonable
        if (!parsed.justification || parsed.justification.length < 20) {
          throw new Error('Justification invalid')
        }
        
        // Ensure it's not too long (should be 1-2 lines)
        if (parsed.justification.length > 200) {
          // Truncate to first sentence if too long
          const firstSentence = parsed.justification.split('.')[0]
          parsed.justification = firstSentence ? firstSentence + '.' : parsed.justification.substring(0, 200)
        }

        console.log('✅ AI verdict generated:', parsed.verdict, 'Length:', parsed.justification.length)

        return NextResponse.json({
          verdict: parsed.verdict,
          justification: parsed.justification,
        })
      } catch (err) {
        console.warn('AI response parsing failed, trying to extract JSON:', err)
        console.log('Raw AI response:', aiResponse.substring(0, 200))
      }
    } else {
      console.log('⚠️ AI API returned no response, using fallback')
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
    
    // Fallback justifications - demanding, intentional, authoritative
    const fallbackVerdicts: Record<string, string[]> = {
      'yes-no': [
        'This decision is driven by emotion, not readiness.',
        'Delay reduces risk. Acting now increases it.',
        'You\'re reacting to boredom, not readiness.',
        'This is not the right moment.',
        'The outcome is predetermined by your hesitation.',
        'Delay increases certainty.',
      ],
      'this-that': [
        'This option reduces complexity.',
        'That path minimizes future conflict.',
        'This choice eliminates more variables.',
        'That option requires less maintenance.',
        'This reduces decision fatigue.',
        'That path has fewer dependencies.',
      ],
      'now-later': [
        'This is not the right moment.',
        'Delay increases certainty.',
        'Acting now compounds existing errors.',
        'Waiting reduces variables.',
        'The timing is suboptimal.',
        'Later. Conditions will stabilize.',
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

