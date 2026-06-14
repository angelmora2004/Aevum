import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useI18n } from '@/composables/useI18n'

const CHECK_INTERVAL = 60 * 1000
const NOTIFIED_KEY = 'aevum-notified'
const notifiedIds = new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'))
let intervalId = null

function saveNotified() {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notifiedIds].slice(-100)))
}

function isSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function useNotifications() {
  const tasksStore = useTasksStore()
  const { isEs } = useI18n()
  const permission = ref(isSupported() ? Notification.permission : 'unsupported')
  const enabled = ref(localStorage.getItem('aevum-notifications') !== 'false')

  async function requestPermission() {
    if (!isSupported()) return 'unsupported'
    if (permission.value === 'granted') return 'granted'
    const result = await Notification.requestPermission()
    permission.value = result
    if (result === 'granted') {
      enabled.value = true
      localStorage.setItem('aevum-notifications', 'true')
    }
    return result
  }

  function setEnabled(v) {
    enabled.value = v
    localStorage.setItem('aevum-notifications', String(v))
  }

  function show(title, options = {}) {
    if (!isSupported() || !enabled.value || permission.value !== 'granted') return null
    const n = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    })
    if (options.onClick) n.onclick = options.onClick
    setTimeout(() => n.close(), 10000)
    return n
  }

  function checkDueTasks() {
    if (!enabled.value || permission.value !== 'granted') return
    const now = new Date()
    const soon = new Date(now.getTime() + 15 * 60 * 1000)

    for (const task of tasksStore.pendingTasks) {
      if (!task.due_date) continue
      const due = new Date(task.due_date)
      if (notifiedIds.has(task.id)) continue
      if (due < now) {
        show(
          isEs.value ? 'Tarea vencida' : 'Overdue task',
          { body: task.title, tag: `task-${task.id}` }
        )
        notifiedIds.add(task.id)
      } else if (due <= soon) {
        show(
          isEs.value ? 'Proxima tarea' : 'Upcoming task',
          { body: `${task.title} — ${due.toLocaleTimeString(isEs.value ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`, tag: `task-${task.id}` }
        )
        notifiedIds.add(task.id)
      }
    }
    saveNotified()
  }

  function start() {
    if (intervalId) return
    checkDueTasks()
    intervalId = setInterval(checkDueTasks, CHECK_INTERVAL)
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return {
    permission,
    enabled,
    requestPermission,
    setEnabled,
    show,
    checkDueTasks,
    start,
    stop
  }
}
