import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { neon } from '@neondatabase/serverless'
import { getSystemPrompt, getErrorMessage } from './api/prompts.js'

const app = express()
const PORT = 3001

// --- Security middleware ---
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '10kb' })) // Limit body size

// Rate limits
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 15,                 // 15 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' }
})

const dbLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,                 // 30 DB operations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' }
})

const sql = neon(process.env.NEON_DATABASE_URL)

// --- CSRF validation ---
// For same-origin SPA: validate Origin/Referer headers on state-changing methods
function validateCSRF(req) {
  const method = req.method
  if (method === 'GET' || method === 'OPTIONS') return true // safe methods
  const origin = req.headers.origin || req.headers.referer
  if (!origin) return false // no origin = suspicious
  const allowed = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  return origin.startsWith(allowed)
}

// --- DB field validation ---
const FIELD_LIMITS = {
  title: 200,
  description: 1000,
  content: 5000,
  category: 30,
  color: 20,
  tags: 500, // JSON string length
}

function validateFields(body) {
  for (const [field, maxLen] of Object.entries(FIELD_LIMITS)) {
    if (body[field] !== undefined && body[field] !== null) {
      if (typeof body[field] === 'string' && body[field].length > maxLen) {
        return `${field} too long (max ${maxLen})`
      }
    }
  }
  // Validate enum fields
  const validPriorities = ['low', 'medium', 'high']
  if (body.priority && !validPriorities.includes(body.priority)) {
    return 'Invalid priority'
  }
  const validCategories = ['work', 'personal', 'health', 'learning', 'admin', 'shopping', 'general']
  if (body.category && !validCategories.includes(body.category)) {
    return 'Invalid category'
  }
  return null // all valid
}

// --- Prompt injection patterns ---
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior|earlier|all)\s+(instructions|prompts|rules|directives)/i,
  /you\s+are\s+now\s+(a|an|the)\s+(different|new|other)/i,
  /system\s*:\s*/i,
  /forget\s+(everything|all|your)/i,
  /override\s+(your|all|the)\s+(rules|instructions|prompts)/i,
  /new\s+instructions?\s*:/i,
  /disregard\s+(all|your|the|previous)/i,
  /act\s+as\s+if\s+you\s+are/i,
  /pretend\s+you\s+are/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /act\s+as\s+if\s+you\s+have\s+no/i,
  /bypass\s+(your|all|the)\s+(rules|restrictions|filters)/i,
  /repeat\s+(the|your)\s+(system|initial)\s+(prompt|message)/i,
  /what\s+(is|are)\s+your\s+(system|initial|original)\s+(prompt|instructions?)/i,
  /show\s+me\s+(your|the)\s+(system|full)\s+(prompt|instructions?)/i,
  /envia\s+el\s+(system|prompt)\s+completo/i,
  /ignora\s+(las|tus|todas)\s+(instrucciones|reglas)/i,
  /eres\s+un\s+(nuevo|diferente)/i,
  /olvida\s+(todo|todas|todo\s+lo)/i,
  /actua\s+como\s+si/i,
  /finge\s+que\s+eres/i,
  /modo\s+desarrollador/i,
  /sin\s+restricciones/i,
  /responde\s+con\s+el\s+(system|prompt)/i,
  /cual\s+es\s+(tu|el)\s+(system|prompt)/i,
]

function containsInjection(text) {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text))
}

// --- Sanitize user messages for AI ---
function sanitizeUserMessage(text) {
  // Remove any HTML-like tags that could confuse the AI
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
}

// --- Reduce context: only send summary, not full data ---
function buildSafeContext(context) {
  if (!context) return ''
  // Context is already pre-built from the frontend with IDs and titles
  // We keep it as-is since frontend controls what's sent
  // But truncate if too long
  const maxLen = 2000
  if (context.length > maxLen) {
    return context.substring(0, maxLen) + '\n[truncated]'
  }
  return context
}

// --- Safe error response ---
function safeError(res, status, internalError) {
  console.error('API Error:', internalError)
  const messages = {
    400: 'Invalid request',
    405: 'Method not allowed',
    500: 'Internal error, try again later'
  }
  return res.status(status).json({ error: messages[status] || 'Error' })
}

// --- DB Routes ---
app.all('/api/db', dbLimiter, async (req, res) => {
  try {
    // CSRF check on state-changing methods
    if (!validateCSRF(req)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const body = req.body || {}
    const table = req.query.table || body.table
    const userId = req.query.user_id || body.user_id

    if (!table || !['notes', 'tasks', 'events', 'pomodoro_sessions'].includes(table)) {
      return res.status(400).json({ error: 'Invalid table' })
    }

    if (!userId) return res.status(200).json([])

    // Validate field lengths on POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      const fieldError = validateFields(body)
      if (fieldError) return res.status(400).json({ error: fieldError })
    }

    switch (req.method) {
      case 'GET': {
        let result
        switch (table) {
          case 'notes': result = await sql`SELECT * FROM notes WHERE user_id = ${userId} ORDER BY pinned DESC, sort_order ASC, updated_at DESC`; break
          case 'tasks': result = await sql`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY sort_order ASC, completed ASC, due_date ASC NULLS LAST, priority DESC`; break
          case 'events': result = await sql`SELECT * FROM events WHERE user_id = ${userId} ORDER BY start_date ASC`; break
          case 'pomodoro_sessions': result = await sql`SELECT * FROM pomodoro_sessions WHERE user_id = ${userId} ORDER BY started_at DESC LIMIT 50`; break
        }
        return res.status(200).json(result)
      }

      case 'POST': {
        let result
        switch (table) {
          case 'notes':
            result = await sql`INSERT INTO notes (title, content, color, tags, pinned, template_id, sort_order, user_id) VALUES (${body.title || 'Sin título'}, ${body.content || ''}, ${body.color || 'default'}, ${JSON.stringify(body.tags || [])}, ${body.pinned || false}, ${body.template_id || null}, ${body.sort_order || 0}, ${userId}) RETURNING *`
            break
          case 'tasks':
            result = await sql`INSERT INTO tasks (title, description, priority, due_date, category, color, parent_id, is_recurring, recurring_type, recurring_interval, time_estimated, sort_order, user_id) VALUES (${body.title || 'Nueva tarea'}, ${body.description || ''}, ${body.priority || 'medium'}, ${body.due_date || null}::timestamptz, ${body.category || 'general'}, ${body.color || 'default'}, ${body.parent_id || null}, ${body.is_recurring || false}, ${body.recurring_type || null}, ${body.recurring_interval || 1}, ${body.time_estimated || 0}, ${body.sort_order || 0}, ${userId}) RETURNING *`
            break
          case 'events':
            result = await sql`INSERT INTO events (title, description, start_date, end_date, color, all_day, user_id) VALUES (${body.title}, ${body.description || ''}, ${body.start_date}::timestamptz, ${body.end_date}::timestamptz, ${body.color || 'default'}, ${body.all_day || false}, ${userId}) RETURNING *`
            break
          case 'pomodoro_sessions':
            result = await sql`INSERT INTO pomodoro_sessions (task_id, duration, completed, user_id) VALUES (${body.task_id || null}, ${body.duration}, ${body.completed || false}, ${userId}) RETURNING *`
            break
        }
        return res.status(201).json(result[0])
      }

      case 'PUT': {
        const { id, ...updates } = body
        if (!id) return res.status(400).json({ error: 'ID required' })
        if (updates.due_date === '' || updates.due_date === undefined) updates.due_date = null
        if (updates.parent_id === '' || updates.parent_id === undefined) updates.parent_id = null
        if (updates.start_date === '' || updates.start_date === undefined) updates.start_date = null
        if (updates.end_date === '' || updates.end_date === undefined) updates.end_date = null
        let result
        switch (table) {
          case 'notes':
            result = await sql`UPDATE notes SET title = COALESCE(${updates.title}, title), content = COALESCE(${updates.content}, content), color = COALESCE(${updates.color}, color), tags = ${updates.tags !== undefined ? JSON.stringify(updates.tags) : null}::jsonb, pinned = COALESCE(${updates.pinned}, pinned), template_id = COALESCE(${updates.template_id}, template_id), sort_order = COALESCE(${updates.sort_order}, sort_order), updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING *`
            break
          case 'tasks':
            result = await sql`UPDATE tasks SET title = COALESCE(${updates.title}, title), description = COALESCE(${updates.description}, description), completed = COALESCE(${updates.completed}, completed), priority = COALESCE(${updates.priority}, priority), due_date = ${updates.due_date !== undefined ? updates.due_date : null}::timestamptz, category = COALESCE(${updates.category}, category), color = COALESCE(${updates.color}, color), parent_id = ${updates.parent_id !== undefined ? updates.parent_id : null}::uuid, is_recurring = COALESCE(${updates.is_recurring}, is_recurring), recurring_type = ${updates.recurring_type !== undefined ? updates.recurring_type : null}, recurring_interval = COALESCE(${updates.recurring_interval}, recurring_interval), time_spent = COALESCE(${updates.time_spent}, time_spent), time_estimated = COALESCE(${updates.time_estimated}, time_estimated), sort_order = COALESCE(${updates.sort_order}, sort_order), updated_at = NOW() WHERE id = ${id} AND user_id = ${userId} RETURNING *`
            break
          case 'events':
            result = await sql`UPDATE events SET title = COALESCE(${updates.title}, title), description = COALESCE(${updates.description}, description), start_date = ${updates.start_date}::timestamptz, end_date = ${updates.end_date}::timestamptz, color = COALESCE(${updates.color}, color), all_day = COALESCE(${updates.all_day}, all_day) WHERE id = ${id} AND user_id = ${userId} RETURNING *`
            break
        }
        return res.status(200).json(result[0])
      }

      case 'DELETE': {
        const { id: deleteId } = req.query
        if (!deleteId) return res.status(400).json({ error: 'ID required' })
        switch (table) {
          case 'notes': await sql`DELETE FROM notes WHERE id = ${deleteId} AND user_id = ${userId}`; break
          case 'tasks': await sql`DELETE FROM tasks WHERE id = ${deleteId} AND user_id = ${userId}`; break
          case 'events': await sql`DELETE FROM events WHERE id = ${deleteId} AND user_id = ${userId}`; break
        }
        return res.status(200).json({ success: true })
      }

      default: return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    return safeError(res, 500, error)
  }
})

// --- Chat Route ---
app.post('/api/chat', chatLimiter, async (req, res) => {
  if (!validateCSRF(req)) return res.status(403).json({ error: 'Forbidden' })

  const { messages, context, language } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' })

  // Check for prompt injection in ALL user messages
  for (const msg of messages) {
    if (msg.role === 'user' && containsInjection(msg.content)) {
      return res.status(400).json({
        error: language === 'en'
          ? 'Message contains prohibited content'
          : 'El mensaje contiene contenido prohibido'
      })
    }
  }

  const systemPrompt = getSystemPrompt(language, buildSafeContext(context))

  // Sanitize all user messages before sending to AI
  const sanitizedMessages = messages.map(m =>
    m.role === 'user' ? { ...m, content: sanitizeUserMessage(m.content) } : m
  )

  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured')
      return res.status(500).json({ error: 'Service not configured' })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...sanitizedMessages],
        temperature: 0.7,
        max_tokens: 1024
      })
    })

    const data = await response.json()

    // Validate response format — reject if AI leaked system prompt
    const reply = data.choices?.[0]?.message?.content || ''
    if (containsInjection(reply)) {
      return res.status(200).json({
        error: language === 'en'
          ? 'Could not generate a response'
          : 'No pude generar una respuesta'
      })
    }

    return res.status(200).json({ reply: reply || getErrorMessage(language) })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.status(500).json({ error: 'Internal error' })
  }
})

// --- Parse Task Route ---
app.post('/api/parse-task', chatLimiter, async (req, res) => {
  if (!validateCSRF(req)) return res.status(403).json({ error: 'Forbidden' })

  const { text, language } = req.body
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text required' })

  // Injection check on parse input too
  if (containsInjection(text)) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  const isEn = language === 'en'
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0]
  const systemPrompt = isEn
    ? `You are Aevum's task parser. Extract structured task data from natural language input.\nToday: ${todayStr}, Tomorrow: ${tomorrow}\nRules:\n- Return ONLY valid JSON, no markdown\n- title: clean action-oriented, no time/date words\n- priority: low/medium/high (default medium)\n- category: work/personal/health/learning/admin/shopping/general\n- due_date: full ISO datetime if time, "YYYY-MM-DD" if only date, else null\n- is_recurring, recurring_type: daily/weekly/monthly\nJSON: {"title":"","description":"","priority":"low|medium|high","category":"","due_date":null,"is_recurring":false,"recurring_type":null}`
    : `Eres el parser de tareas de Aevum. Extrae datos estructurados de tareas desde lenguaje natural.\nHoy: ${todayStr}, Mañana: ${tomorrow}\nReglas:\n- SOLO JSON válido, sin markdown\n- title: limpio, sin palabras de tiempo\n- priority: low/medium/high (default medium)\n- category: work/personal/health/learning/admin/shopping/general\n- due_date: ISO datetime si hay hora, "YYYY-MM-DD" si solo fecha, o null\n- is_recurring, recurring_type: daily/weekly/monthly\nJSON: {"title":"","description":"","priority":"low|medium|high","category":"","due_date":null,"is_recurring":false,"recurring_type":null}`

  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Service not configured' })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizeUserMessage(text) }
        ],
        temperature: 0.1,
        max_tokens: 256,
        response_format: { type: 'json_object' }
      })
    })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    try { return res.status(200).json(JSON.parse(content)) }
    catch { return res.status(500).json({ error: 'Invalid response format' }) }
  } catch (error) {
    console.error('Parse error:', error.message)
    return res.status(500).json({ error: 'Internal error' })
  }
})

app.listen(PORT, () => console.log(`Aevum API running on http://localhost:${PORT}`))
