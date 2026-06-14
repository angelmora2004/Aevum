import { ref } from 'vue'

export function useSwipe({ threshold = 80, onSwipeLeft, onSwipeRight } = {}) {
  const startX = ref(0)
  const startY = ref(0)
  const currentX = ref(0)
  const isSwiping = ref(false)
  const direction = ref(null)

  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    currentX.value = 0
    isSwiping.value = true
    direction.value = null
  }

  function onTouchMove(e) {
    if (!isSwiping.value) return
    const touch = e.touches[0]
    const dx = touch.clientX - startX.value
    const dy = touch.clientY - startY.value

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      isSwiping.value = false
      return
    }
    if (Math.abs(dx) > 10) {
      direction.value = dx > 0 ? 'right' : 'left'
    }
    currentX.value = dx
    e.preventDefault()
  }

  function onTouchEnd() {
    if (!isSwiping.value) return
    const dx = currentX.value
    isSwiping.value = false
    direction.value = null
    currentX.value = 0

    if (dx > threshold && onSwipeRight) onSwipeRight()
    else if (dx < -threshold && onSwipeLeft) onSwipeLeft()
  }

  function onTouchCancel() {
    isSwiping.value = false
    direction.value = null
    currentX.value = 0
  }

  return {
    isSwiping,
    direction,
    currentX,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel
  }
}
