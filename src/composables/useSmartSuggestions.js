import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useI18n } from '@/composables/useI18n'

export function useSmartSuggestions() {
  const tasksStore = useTasksStore()
  const { isEs } = useI18n()

  const suggestions = computed(() => {
    const result = []
    const tasks = tasksStore.tasks
    const completed = tasks.filter(t => t.completed)
    const pending = tasks.filter(t => !t.completed)
    const overdue = tasksStore.overdueTasks

    if (overdue.length > 0) {
      result.push({
        id: 'overdue',
        type: 'warning',
        icon: 'alert',
        title: isEs.value ? `${overdue.length} tarea${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}` : `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
        message: isEs.value ? 'Revisa y reorganiza las tareas atrasadas' : 'Review and reorganize overdue tasks',
        action: { label: isEs.value ? 'Ver tareas' : 'View tasks', route: '/tasks' }
      })
    }

    if (completed.length >= 3) {
      const hourCounts = {}
      for (const t of completed) {
        if (t.updated_at) {
          const h = new Date(t.updated_at).getHours()
          hourCounts[h] = (hourCounts[h] || 0) + 1
        }
      }
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
      if (peakHour) {
        const h = parseInt(peakHour[0])
        const period = h < 12 ? (isEs.value ? 'mañana' : 'morning') : h < 18 ? (isEs.value ? 'tarde' : 'afternoon') : (isEs.value ? 'noche' : 'evening')
        result.push({
          id: 'peak-hour',
          type: 'insight',
          icon: 'clock',
          title: isEs.value ? `Tu hora pico: ${h}:00` : `Your peak hour: ${h}:00`,
          message: isEs.value
            ? `Completas más tareas por la ${period}. Programa trabajo importante a esa hora.`
            : `You complete more tasks in the ${period}. Schedule important work at that time.`
        })
      }
    }

    const categories = {}
    for (const t of tasks) {
      const c = t.category || 'general'
      categories[c] = (categories[c] || 0) + 1
    }
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
    if (topCategory && topCategory[1] >= 3) {
      result.push({
        id: 'top-category',
        type: 'tip',
        icon: 'folder',
        title: isEs.value ? `Categoría más usada: ${topCategory[0]}` : `Top category: ${topCategory[0]}`,
        message: isEs.value
          ? `Tienes ${topCategory[1]} tareas en "${topCategory[0]}". Considera dividirlas en proyectos.`
          : `You have ${topCategory[1]} tasks in "${topCategory[0]}". Consider splitting into projects.`
      })
    }

    const tasksWithTime = completed.filter(t => t.time_spent > 0)
    if (tasksWithTime.length >= 3) {
      const avg = tasksWithTime.reduce((sum, t) => sum + t.time_spent, 0) / tasksWithTime.length
      const mins = Math.round(avg / 60)
      if (mins > 0) {
        result.push({
          id: 'avg-time',
          type: 'insight',
          icon: 'chart',
          title: isEs.value ? `Tiempo promedio: ${mins} min` : `Average time: ${mins} min`,
          message: isEs.value
            ? `Tus tareas toman ~${mins} min en completarse. Usa esto para estimar mejor.`
            : `Your tasks take ~${mins} min to complete. Use this to estimate better.`
        })
      }
    }

    if (pending.length === 0 && completed.length > 0) {
      result.push({
        id: 'all-done',
        type: 'success',
        icon: 'check',
        title: isEs.value ? '¡Todo listo!' : 'All clear!',
        message: isEs.value ? 'No tienes tareas pendientes. Momento perfecto para planificar.' : 'No pending tasks. Perfect time to plan ahead.'
      })
    }

    if (tasks.length > 10 && completed.length / tasks.length < 0.3) {
      result.push({
        id: 'high-load',
        type: 'warning',
        icon: 'trending',
        title: isEs.value ? 'Carga alta detectada' : 'High load detected',
        message: isEs.value
          ? 'Tienes muchas tareas abiertas. Considera priorizar o delegar.'
          : 'You have many open tasks. Consider prioritizing or delegating.'
      })
    }

    return result.slice(0, 3)
  })

  return { suggestions }
}
