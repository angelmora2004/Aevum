import { getSystemPrompt, getErrorMessage } from './prompts.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, context, language } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' })
  }

  const systemPrompt = getSystemPrompt(language, context)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API Error:', error)
      return res.status(response.status).json({ error: 'Error from Groq API' })
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content || getErrorMessage(language)

    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat API Error:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
