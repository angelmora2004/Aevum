<template>
  <div v-if="!chatOpen" class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[40]">
    <!-- Collapsed -->
    <transition name="scale">
      <button v-if="!expanded" @click="expanded = true" class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95" style="background: var(--card-bg); color: var(--text); border: 1px solid var(--card-border); box-shadow: var(--shadow); backdrop-filter: blur(20px);">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </button>
    </transition>

    <!-- Expanded panel -->
    <transition name="scale">
      <div v-if="expanded" class="w-[calc(100vw-32px)] sm:w-[300px] rounded-[24px] overflow-hidden" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 24px 80px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--divider)]">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="pomodoro.isRunning.value ? 'bg-[var(--btn-bg)] animate-pulse' : 'bg-[var(--toggle-knob-off)]'"/>
            <span class="text-[12px] font-medium text-[var(--text)]">Pomodoro</span>
          </div>
          <button @click="expanded = false" class="p-1 rounded-lg hover:bg-[var(--card-hover)] text-[var(--text-dim)] hover:text-[var(--text-dim)] transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 py-8 text-center">
          <div class="flex items-center justify-center gap-2 mb-6">
            <span :class="['text-[10px] uppercase tracking-[0.15em] font-medium', pomodoro.mode.value === 'work' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]']">{{ t('pomodoro.focus') }}</span>
            <span class="text-[var(--text-faint)]">·</span>
            <span :class="['text-[10px] uppercase tracking-[0.15em] font-medium', pomodoro.mode.value === 'break' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]']">{{ t('pomodoro.shortBreak') }}</span>
            <span class="text-[var(--text-faint)]">·</span>
            <span :class="['text-[10px] uppercase tracking-[0.15em] font-medium', pomodoro.mode.value === 'longBreak' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]']">{{ t('pomodoro.longBreak') }}</span>
          </div>
          <div class="relative inline-flex items-center justify-center mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140" class="transform -rotate-90">
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--card-hover)" stroke-width="4"/>
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--text)" stroke-width="4" stroke-linecap="round" :stroke-dasharray="389.56" :stroke-dashoffset="389.56 * (1 - pomodoro.progress.value / 100)" class="transition-[stroke-dashoffset] duration-1000 ease-linear"/>
            </svg>
            <span class="absolute text-[36px] font-bold tracking-[-0.04em] leading-none text-[var(--text)] font-mono">{{ pomodoro.displayTime.value }}</span>
          </div>
          <div class="mt-2 flex items-center justify-center gap-1.5">
            <div v-for="i in 4" :key="i" :class="['w-1.5 h-1.5 rounded-full transition-all duration-500', i <= pomodoro.sessions.value % 4 ? 'bg-[var(--btn-bg)]' : 'bg-[var(--text-faint)]']"/>
          </div>
          <p class="text-[10px] text-[var(--text-muted)] mt-2">{{ pomodoro.sessions.value }} {{ isEs ? 'sesiones completadas' : 'sessions completed' }}</p>
        </div>

        <div class="px-5 pb-5 flex items-center justify-center gap-3">
          <button @click="pomodoro.reset()" class="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card-hover)] hover:bg-[var(--card-hover)] text-[var(--text-dim)] hover:text-[var(--text)] transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button @click="pomodoro.isRunning.value ? pomodoro.pause() : pomodoro.start()" class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95" :style="{ background: pomodoro.isRunning.value ? 'var(--card-hover)' : 'var(--card-bg)', color: 'var(--text)', border: '1px solid var(--card-border)' }">
            <svg v-if="!pomodoro.isRunning.value" class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
          <button @click="pomodoro.skip()" class="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card-hover)] hover:bg-[var(--card-hover)] text-[var(--text-dim)] hover:text-[var(--text)] transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
          </button>
        </div>

        <div class="px-5 pb-5">
          <div class="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>{{ isEs ? 'Tiempo enfocado' : 'Focus time' }}: {{ formatWorkTime }}</span>
            <span>{{ t('calendar.today') }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePomodoro } from '../../composables/usePomodoro'
import { useAppStore } from '../../stores/app'
import { useI18n } from '../../composables/useI18n'
import { useSound } from '../../composables/useSound'

const pomodoro = usePomodoro()
const appStore = useAppStore()
const { t, isEs } = useI18n()
const sound = useSound()
const expanded = ref(false)
const chatOpen = computed(() => appStore.chatOpen)

const formatWorkTime = computed(() => {
  const m = Math.floor(pomodoro.totalWorkTime.value / 60)
  return `${m} min`
})

let prevTimeLeft = pomodoro.timeLeft.value
watch(pomodoro.timeLeft, (v) => {
  if (v === 0 && prevTimeLeft > 0) {
    sound.pomodoroEnd()
    appStore.addNotification({ type: 'success', title: t('pomodoro.completed') })
  }
  prevTimeLeft = v
})
</script>

<style scoped>
.scale-enter-active, .scale-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9); }
</style>
