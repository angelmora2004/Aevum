import { ref, onUnmounted } from 'vue'

export function useTimeTracker() {
  const activeTimers = ref({})
  let intervals = {}

  function start(taskId) {
    if (activeTimers.value[taskId]) return
    activeTimers.value[taskId] = { running: true, seconds: 0, startedAt: Date.now() }
    intervals[taskId] = setInterval(() => {
      if (activeTimers.value[taskId]?.running) {
        activeTimers.value[taskId].seconds++
      }
    }, 1000)
  }

  function stop(taskId) {
    if (!activeTimers.value[taskId]) return null
    activeTimers.value[taskId].running = false
    clearInterval(intervals[taskId])
    const elapsed = activeTimers.value[taskId].seconds
    delete activeTimers.value[taskId]
    delete intervals[taskId]
    return elapsed
  }

  function toggle(taskId) {
    if (activeTimers.value[taskId]?.running) {
      return stop(taskId)
    } else {
      start(taskId)
      return null
    }
  }

  function isRunning(taskId) {
    return activeTimers.value[taskId]?.running || false
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  onUnmounted(() => {
    Object.values(intervals).forEach(clearInterval)
  })

  return { activeTimers, start, stop, toggle, isRunning, formatTime }
}
