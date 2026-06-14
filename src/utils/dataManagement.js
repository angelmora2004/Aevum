import { useNotesStore } from '@/stores/notes'
import { useTasksStore } from '@/stores/tasks'
import { useDeviceId } from '@/composables/useDeviceId'

export function exportAllData() {
  const notesStore = useNotesStore()
  const tasksStore = useTasksStore()

  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    app: 'Aevum',
    counts: {
      notes: notesStore.notes.length,
      tasks: tasksStore.tasks.length
    },
    notes: notesStore.notes.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      tags: n.tags || [],
      pinned: n.pinned,
      template_id: n.template_id,
      color: n.color,
      created_at: n.created_at,
      updated_at: n.updated_at
    })),
    tasks: tasksStore.tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      due_date: t.due_date,
      category: t.category,
      parent_id: t.parent_id,
      is_recurring: t.is_recurring,
      recurring_type: t.recurring_type,
      recurring_interval: t.recurring_interval,
      time_estimated: t.time_estimated,
      time_spent: t.time_spent,
      sort_order: t.sort_order,
      created_at: t.created_at,
      updated_at: t.updated_at
    }))
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `aevum-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function clearAllData() {
  const notesStore = useNotesStore()
  const tasksStore = useTasksStore()
  const { deviceId } = useDeviceId()

  const noteIds = [...notesStore.notes.map(n => n.id)]
  const taskIds = [...tasksStore.tasks.map(t => t.id)]

  await Promise.all([
    ...noteIds.map(id => fetch(`/api/db?table=notes&id=${id}&user_id=${deviceId}`, { method: 'DELETE' })),
    ...taskIds.map(id => fetch(`/api/db?table=tasks&id=${id}&user_id=${deviceId}`, { method: 'DELETE' }))
  ])

  notesStore.notes = []
  tasksStore.tasks = []
}
