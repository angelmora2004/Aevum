import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer = null

  function reveal(el) {
    el.classList.add('revealed')
  }

  onMounted(() => {
    const selectors = '[data-reveal], [data-reveal-scale], [data-reveal-left], [data-reveal-right]'
    const all = document.querySelectorAll(selectors)
    all.forEach(reveal)

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0 }
    )
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
}

export function useCardTilt() {
  const cleanups = []

  onMounted(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.card-3d').forEach((card) => {
        const onMouseMove = (e) => {
          const rect = card.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          card.style.setProperty('--mouse-x', x + '%')
          card.style.setProperty('--mouse-y', y + '%')
          const rotateX = ((y - 50) / 50) * -3
          const rotateY = ((x - 50) / 50) * 3
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
        }

        const onMouseLeave = () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
        }

        card.addEventListener('mousemove', onMouseMove)
        card.addEventListener('mouseleave', onMouseLeave)
        cleanups.push(() => {
          card.removeEventListener('mousemove', onMouseMove)
          card.removeEventListener('mouseleave', onMouseLeave)
        })
      })
    })
  })

  onUnmounted(() => {
    cleanups.forEach(fn => fn())
  })
}
