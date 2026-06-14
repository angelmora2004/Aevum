import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.NEON_DATABASE_URL)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://aevum.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const body = req.body || {}
    const table = req.query.table || body.table
    const userId = req.query.user_id || body.user_id

    if (!table || !['notes', 'tasks', 'events', 'pomodoro_sessions'].includes(table)) {
      return res.status(400).json({ error: 'Invalid table' })
    }

    if (!userId) return res.status(200).json([])

    switch (req.method) {
      case 'GET': {
        let result
        switch (table) {
          case 'notes':
            result = await sql`SELECT * FROM notes WHERE user_id = ${userId} ORDER BY pinned DESC, sort_order ASC, updated_at DESC`
            break
          case 'tasks':
            result = await sql`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY sort_order ASC, completed ASC, due_date ASC NULLS LAST, priority DESC`
            break
          case 'events':
            result = await sql`SELECT * FROM events WHERE user_id = ${userId} ORDER BY start_date ASC`
            break
          case 'pomodoro_sessions':
            result = await sql`SELECT * FROM pomodoro_sessions WHERE user_id = ${userId} ORDER BY started_at DESC LIMIT 50`
            break
        }
        return res.status(200).json(result)
      }

      case 'POST': {
        let result
        switch (table) {
          case 'notes':
            result = await sql`
              INSERT INTO notes (title, content, color, tags, pinned, template_id, sort_order, user_id)
              VALUES (${body.title || 'Sin título'}, ${body.content || ''}, ${body.color || 'default'}, ${JSON.stringify(body.tags || [])}, ${body.pinned || false}, ${body.template_id || null}, ${body.sort_order || 0}, ${userId || null})
              RETURNING *`
            break
          case 'tasks':
            result = await sql`
              INSERT INTO tasks (title, description, priority, due_date, category, color, parent_id, is_recurring, recurring_type, recurring_interval, time_estimated, sort_order, user_id)
              VALUES (${body.title || 'Nueva tarea'}, ${body.description || ''}, ${body.priority || 'medium'}, ${body.due_date || null}::timestamptz, ${body.category || 'general'}, ${body.color || 'default'}, ${body.parent_id || null}, ${body.is_recurring || false}, ${body.recurring_type || null}, ${body.recurring_interval || 1}, ${body.time_estimated || 0}, ${body.sort_order || 0}, ${userId || null})
              RETURNING *`
            break
          case 'events':
            result = await sql`
              INSERT INTO events (title, description, start_date, end_date, color, all_day, user_id)
              VALUES (${body.title}, ${body.description || ''}, ${body.start_date}::timestamptz, ${body.end_date}::timestamptz, ${body.color || 'default'}, ${body.all_day || false}, ${userId || null})
              RETURNING *`
            break
          case 'pomodoro_sessions':
            result = await sql`
              INSERT INTO pomodoro_sessions (task_id, duration, completed, user_id)
              VALUES (${body.task_id || null}, ${body.duration}, ${body.completed || false}, ${userId || null})
              RETURNING *`
            break
        }
        return res.status(201).json(result[0])
      }

      case 'PUT': {
        const { id, ...updates } = body
        if (!id) return res.status(400).json({ error: 'ID required' })
        // Clean empty strings to null for timestamp/uuid fields
        if (updates.due_date === '' || updates.due_date === undefined) updates.due_date = null
        if (updates.parent_id === '' || updates.parent_id === undefined) updates.parent_id = null
        if (updates.start_date === '' || updates.start_date === undefined) updates.start_date = null
        if (updates.end_date === '' || updates.end_date === undefined) updates.end_date = null
        let result
        switch (table) {
          case 'notes':
            result = await sql`
              UPDATE notes SET
                title = COALESCE(${updates.title}, title),
                content = COALESCE(${updates.content}, content),
                color = COALESCE(${updates.color}, color),
                tags = ${updates.tags !== undefined ? JSON.stringify(updates.tags) : null}::jsonb,
                pinned = COALESCE(${updates.pinned}, pinned),
                template_id = COALESCE(${updates.template_id}, template_id),
                sort_order = COALESCE(${updates.sort_order}, sort_order),
                updated_at = NOW()
              WHERE id = ${id} AND user_id = ${userId} RETURNING *`
            break
          case 'tasks':
            result = await sql`
              UPDATE tasks SET
                title = COALESCE(${updates.title}, title),
                description = COALESCE(${updates.description}, description),
                completed = COALESCE(${updates.completed}, completed),
                priority = COALESCE(${updates.priority}, priority),
                due_date = ${updates.due_date !== undefined ? updates.due_date : null}::timestamptz,
                category = COALESCE(${updates.category}, category),
                color = COALESCE(${updates.color}, color),
                parent_id = ${updates.parent_id !== undefined ? updates.parent_id : null}::uuid,
                is_recurring = COALESCE(${updates.is_recurring}, is_recurring),
                recurring_type = ${updates.recurring_type !== undefined ? updates.recurring_type : null},
                recurring_interval = COALESCE(${updates.recurring_interval}, recurring_interval),
                time_spent = COALESCE(${updates.time_spent}, time_spent),
                time_estimated = COALESCE(${updates.time_estimated}, time_estimated),
                sort_order = COALESCE(${updates.sort_order}, sort_order),
                updated_at = NOW()
              WHERE id = ${id} AND user_id = ${userId} RETURNING *`
            break
          case 'events':
            result = await sql`
              UPDATE events SET
                title = COALESCE(${updates.title}, title),
                description = COALESCE(${updates.description}, description),
                start_date = ${updates.start_date}::timestamptz,
                end_date = ${updates.end_date}::timestamptz,
                color = COALESCE(${updates.color}, color),
                all_day = COALESCE(${updates.all_day}, all_day)
              WHERE id = ${id} AND user_id = ${userId} RETURNING *`
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
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal error, try again later' })
  }
}
