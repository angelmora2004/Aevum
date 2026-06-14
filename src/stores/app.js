import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const chatOpen = ref(false)
  const currentTheme = ref('dark')
  const notifications = ref([])

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleChat() {
    chatOpen.value = !chatOpen.value
  }

  function addNotification(notification) {
    const id = Date.now()
    notifications.value.push({ ...notification, id })
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 4000)
  }

  return { sidebarOpen, sidebarCollapsed, chatOpen, currentTheme, notifications, toggleSidebar, toggleSidebarCollapse, toggleChat, addNotification }
})
