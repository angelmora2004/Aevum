<template>
  <div class="flex h-full">
    <Sidebar />
    <div :class="['flex-1 flex flex-col min-h-0 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[220px]']">
      <TopBar />
      <main class="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
    <ChatBot />
    <NotificationToast />
    <PomodoroTimer />
    <CommandPalette />
    <UndoToast ref="undoToast" @undo="handleUndo"/>
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useNotesStore } from '@/stores/notes'
import { useTasksStore } from '@/stores/tasks'
import { useNotifications } from '@/composables/useNotifications'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import ChatBot from '../chat/ChatBot.vue'
import NotificationToast from '../ui/NotificationToast.vue'
import PomodoroTimer from '../pomodoro/PomodoroTimer.vue'
import UndoToast from '../ui/UndoToast.vue'
import CommandPalette from '../ui/CommandPalette.vue'

const appStore = useAppStore()
const notesStore = useNotesStore()
const tasksStore = useTasksStore()
const notifications = useNotifications()

const collapsed = computed(() => appStore.sidebarCollapsed)
const undoToast = ref(null)
const undoStack = ref([])

provide('undoStack', undoStack)
provide('showUndo', (message, undoFn) => {
  undoStack.value.push({ message, undoFn })
  if (undoToast.value) undoToast.value.show()
})

onMounted(() => {
  notesStore.fetchNotes()
  tasksStore.fetchTasks()
  notifications.start()
})

async function handleUndo() {
  if (undoStack.value.length === 0) return
  const last = undoStack.value.pop()
  if (last.undoFn) await last.undoFn()
}
</script>

<style>
.page-enter-active { transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.page-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.page-enter-from { opacity: 0; transform: translateY(20px) scale(0.98); }
.page-leave-to { opacity: 0; transform: translateY(-10px) scale(0.99); }
</style>
