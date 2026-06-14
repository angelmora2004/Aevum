import { ref, computed, onUnmounted } from 'vue'

export function usePomodoro() {
  const WORK_TIME = 25 * 60
  const BREAK_TIME = 5 * 60
  const LONG_BREAK_TIME = 15 * 60

  const mode = ref('work') // work, break, longBreak
  const timeLeft = ref(WORK_TIME)
  const isRunning = ref(false)
  const sessions = ref(0)
  const totalWorkTime = ref(0)
  let interval = null

  const progress = computed(() => {
    const total = mode.value === 'work' ? WORK_TIME : mode.value === 'break' ? BREAK_TIME : LONG_BREAK_TIME
    return ((total - timeLeft.value) / total) * 100
  })

  const displayTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    interval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
        if (mode.value === 'work') totalWorkTime.value++
      } else {
        complete()
      }
    }, 1000)
  }

  function pause() {
    isRunning.value = false
    clearInterval(interval)
  }

  function reset() {
    pause()
    mode.value = 'work'
    timeLeft.value = WORK_TIME
  }

  function complete() {
    pause()
    if (mode.value === 'work') {
      sessions.value++
      if (sessions.value % 4 === 0) {
        mode.value = 'longBreak'
        timeLeft.value = LONG_BREAK_TIME
      } else {
        mode.value = 'break'
        timeLeft.value = BREAK_TIME
      }
    } else {
      mode.value = 'work'
      timeLeft.value = WORK_TIME
    }
  }

  function skip() {
    complete()
  }

  onUnmounted(() => {
    clearInterval(interval)
  })

  return {
    mode, timeLeft, isRunning, sessions, totalWorkTime,
    progress, displayTime,
    start, pause, reset, skip
  }
}
