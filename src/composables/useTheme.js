import { ref, watchEffect } from 'vue'

const theme = ref('dark')

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(t)
}

// Initialize once
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('aevum-theme')
  theme.value = saved || getSystemTheme()
  applyTheme(theme.value)

  watchEffect(() => {
    localStorage.setItem('aevum-theme', theme.value)
    applyTheme(theme.value)
  })
}

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function set(t) {
    theme.value = t
  }

  return { theme, toggle, set }
}
