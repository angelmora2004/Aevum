import { getSystemPrompt, getErrorMessage } from './prompts.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, language } = req.body
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text required' })
  }

  const isEn = language === 'en'
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrow = new Date(now.getTime() + 86400000)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const systemPrompt = isEn
    ? `You are Aevum's task parser. Extract structured task data from natural language input.

Today's date: ${todayStr}
Tomorrow: ${tomorrowStr}

Rules:
- Always respond with valid JSON only, no markdown, no explanation
- Extract the task title (clean, action-oriented, no time/date words)
- Detect priority: high/medium/low (default medium)
- Detect category: work/personal/health/learning/admin/shopping/general
- Parse relative dates ("tomorrow", "next monday", "in 2 days") into ISO date "YYYY-MM-DD"
- Parse times ("at 3pm", "at 15:00") into 24h "HH:MM" format
- Return due_date as full ISO datetime string if time is specified, else "YYYY-MM-DD" if only date, else null
- Detect recurring: "every day"/"daily", "every week"/"weekly", "every month"/"monthly"
- Language: match the user's input language

Return JSON shape:
{"title":"","description":"","priority":"low|medium|high","category":"","due_date":null,"is_recurring":false,"recurring_type":null}`
    : `Eres el parser de tareas de Aevum. Extrae datos estructurados de tareas desde lenguaje natural.

Fecha de hoy: ${todayStr}
Mañana: ${tomorrowStr}

Reglas:
- Responde SOLO con JSON válido, sin markdown, sin explicación
- Extrae el título de la tarea (limpio, orientado a acción, sin palabras de tiempo/fecha)
- Detecta prioridad: high/medium/low (por defecto medium)
- Detecta categoría: work/personal/health/learning/admin/shopping/general
- Parsea fechas relativas ("mañana", "el lunes", "en 2 días") a ISO "YYYY-MM-DD"
- Parsea horas ("a las 3pm", "a las 15:00") a formato 24h "HH:MM"
- Devuelve due_date como datetime ISO completo si hay hora, "YYYY-MM-DD" si solo fecha, o null
- Detecta recurrentes: "cada día"/"diario", "cada semana"/"semanal", "cada mes"/"mensual"
- Idioma: usa el idioma del input del usuario

Forma del JSON:
{"title":"","description":"","priority":"low|medium|high","category":"","due_date":null,"is_recurring":false,"recurring_type":null}`

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
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 256,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq parse error:', err)
      return res.status(response.status).json({ error: 'Parse error' })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || '{}'
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from model' })
    }

    if (!parsed.title) {
      parsed.title = text.trim().slice(0, 80)
    }

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('Parse API error:', error)
    return res.status(500).json({ error: 'Error interno' })
  }
}
