import { ref, watch, onMounted } from 'vue'

export function useCounter(targetValue, duration = 800) {
  const current = ref(0)
  let animFrame = null

  function animate(from, to) {
    if (animFrame) cancelAnimationFrame(animFrame)
    const start = performance.now()
    const diff = to - from

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      current.value = Math.round(from + diff * eased)
      if (progress < 1) animFrame = requestAnimationFrame(step)
    }

    animFrame = requestAnimationFrame(step)
  }

  watch(targetValue, (newVal, oldVal) => {
    animate(oldVal || 0, newVal || 0)
  })

  onMounted(() => {
    animate(0, targetValue.value || 0)
  })

  return current
}
