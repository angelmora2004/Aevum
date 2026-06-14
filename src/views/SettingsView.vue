<template>
  <div class="min-h-full px-5 lg:px-10 py-12 lg:py-20 max-w-2xl">
    <div class="mb-16" data-reveal>
      <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">{{ t('settings.section') }}</span>
      <h1 class="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[var(--text)] mt-4">{{ t('settings.title') }}</h1>
      <p class="text-[14px] text-[var(--text-dim)] mt-3">{{ t('settings.subtitle') }}</p>
    </div>

    <div class="space-y-4">
      <!-- Theme -->
      <div class="card-3d p-6" data-reveal>
        <h3 class="text-[13px] font-semibold text-[var(--text)] mb-5">{{ t('settings.appearance') }}</h3>
        <div class="flex items-center gap-3">
          <button @click="theme.set('dark')" :class="['flex-1 p-4 rounded-2xl border transition-all duration-500 text-center', theme.theme.value === 'dark' ? 'border-[var(--selection-border)] bg-[var(--selection-bg)]' : 'border-[var(--hover-border)] bg-transparent hover:bg-[var(--hover-bg)]']">
            <div class="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style="background: var(--card-bg); border: 1px solid var(--card-border);">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text);"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span class="text-[12px] font-medium text-[var(--text)]">{{ t('settings.theme.dark') }}</span>
          </button>
          <button @click="theme.set('light')" :class="['flex-1 p-4 rounded-2xl border transition-all duration-500 text-center', theme.theme.value === 'light' ? 'border-[var(--selection-border)] bg-[var(--selection-bg)]' : 'border-[var(--hover-border)] bg-transparent hover:bg-[var(--hover-bg)]']">
            <div class="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style="background: var(--card-bg); border: 1px solid var(--card-border);">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text);"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <span class="text-[12px] font-medium text-[var(--text)]">{{ t('settings.theme.light') }}</span>
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="card-3d p-6" data-reveal>
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-[13px] font-semibold text-[var(--text)]">{{ t('settings.language') }}</h3>
            <p class="text-[11px] text-[var(--text-muted)] mt-0.5">{{ t('settings.languageDesc') }}</p>
          </div>
          <div class="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--chip-bg)] border border-[var(--card-border)]">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--text)]"/>
            <span class="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">{{ lang.toUpperCase() }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button v-for="l in availableLangs" :key="l.code" @click="setLanguage(l.code)" :class="['flex-1 p-4 rounded-2xl border transition-all duration-500 flex items-center gap-3', lang === l.code ? 'border-[var(--selection-border)] bg-[var(--selection-bg)]' : 'border-[var(--hover-border)] bg-transparent hover:bg-[var(--hover-bg)]']">
            <div :class="['w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[11px] font-semibold transition-colors', lang === l.code ? 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)]' : 'bg-[var(--card-hover)] text-[var(--text-dim)]']">
              {{ l.short }}
            </div>
            <div class="text-left">
              <p class="text-[13px] font-medium text-[var(--text)]">{{ l.label }}</p>
              <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ l.short }}</p>
            </div>
            <svg v-if="lang === l.code" class="w-4 h-4 text-[var(--text)] ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>

      <!-- General -->
      <div class="card-3d p-6" data-reveal>
        <h3 class="text-[13px] font-semibold text-[var(--text)] mb-5">{{ t('settings.general') }}</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2">
            <div>
              <p class="text-[13px] font-medium text-[var(--text)]">{{ t('settings.notifications') }}</p>
              <p class="text-[11px] text-[var(--text-muted)] mt-0.5">
                <span v-if="notifications.permission === 'granted' && notifications.enabled.value">{{ t('settings.notificationsDesc') }}</span>
                <span v-else-if="notifications.permission === 'denied'">{{ isEs ? 'Bloqueadas en tu navegador' : 'Blocked in your browser' }}</span>
                <span v-else-if="notifications.enabled.value">{{ isEs ? 'Activas (permiso pendiente)' : 'Enabled (permission pending)' }}</span>
                <span v-else>{{ isEs ? 'Click para permitir' : 'Click to allow' }}</span>
              </p>
            </div>
            <button @click="toggleNotifications" :class="['w-10 h-[22px] rounded-full relative transition-all duration-500', notifications.enabled.value ? 'bg-[var(--btn-bg)]' : 'bg-[var(--toggle-off)]']">
              <div :class="['w-4 h-4 rounded-full absolute top-[3px] transition-all duration-500', notifications.enabled.value ? 'left-[22px] bg-[var(--btn-text)]' : 'left-[3px] bg-[var(--toggle-knob-off)]']"/>
            </button>
          </div>
          <div class="flex items-center justify-between py-2">
            <div><p class="text-[13px] font-medium text-[var(--text)]">{{ t('settings.sounds') }}</p><p class="text-[11px] text-[var(--text-muted)] mt-0.5">{{ t('settings.soundsDesc') }}</p></div>
            <button @click="sounds = !sounds" :class="['w-10 h-[22px] rounded-full relative transition-all duration-500', sounds ? 'bg-[var(--btn-bg)]' : 'bg-[var(--toggle-off)]']">
              <div :class="['w-4 h-4 rounded-full absolute top-[3px] transition-all duration-500', sounds ? 'left-[22px] bg-[var(--btn-text)]' : 'left-[3px] bg-[var(--toggle-knob-off)]']"/>
            </button>
          </div>
        </div>
      </div>

      <!-- Data -->
      <div class="card-3d p-6" data-reveal>
        <h3 class="text-[13px] font-semibold text-[var(--text)] mb-5">{{ t('settings.data') }}</h3>
        <p class="text-[12px] text-[var(--text-muted)] leading-relaxed mb-4">{{ t('settings.dataDesc') }}</p>
        <div class="flex flex-wrap gap-2">
          <button @click="handleExport" class="btn btn-white">{{ t('settings.export') }}</button>
          <button @click="confirmClear = true" class="btn btn-ghost-nav">{{ t('settings.clear') }}</button>
        </div>
      </div>

      <!-- Clear confirmation modal -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="confirmClear" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="confirmClear = false">
            <div class="fixed inset-0 backdrop-blur-[40px]" style="background: var(--backdrop);" @click="confirmClear = false"/>
            <div class="relative rounded-[24px] w-full max-w-sm p-6" style="background: var(--glass-bg); border: 1px solid var(--glass-border); box-shadow: 0 32px 100px rgba(0,0,0,0.4), inset 0 1px 0 var(--glass-highlight);">
              <h3 class="text-[15px] font-semibold text-[var(--text)] mb-2">{{ t('settings.confirmDeleteTitle') }}</h3>
              <p class="text-[12px] text-[var(--text-dim)] leading-relaxed mb-6">{{ t('settings.confirmDeleteDesc') }}</p>
              <div class="flex justify-end gap-2">
                <button @click="confirmClear = false" class="btn btn-ghost-nav">{{ t('common.cancel') }}</button>
                <button @click="handleClear" class="btn btn-white" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); color: #ef4444;">{{ t('settings.confirmDeleteAction') }}</button>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>

      <!-- Info -->
      <div class="card-3d p-6" data-reveal>
        <h3 class="text-[13px] font-semibold text-[var(--text)] mb-5">{{ t('settings.info') }}</h3>
        <div class="space-y-2">
          <div v-for="info in aboutInfo" :key="info[0]" class="flex items-center justify-between py-1">
            <span class="text-[12px] text-[var(--text-muted)]">{{ info[0] }}</span>
            <span class="text-[12px] font-mono text-[var(--text-dim)]">{{ info[1] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
import { useScrollReveal } from '../composables/useAnimations'
import { useI18n } from '../composables/useI18n'
import { useAppStore } from '../stores/app'
import { useSound } from '../composables/useSound'
import { useNotifications } from '../composables/useNotifications'
import { exportAllData, clearAllData } from '../utils/dataManagement'
import { ref, computed, watch } from 'vue'
import { useDeviceId } from '../composables/useDeviceId'

const theme = useTheme()
const { t, lang, isEs, setLanguage, availableLangs } = useI18n()
const appStore = useAppStore()
const sound = useSound()
const notifications = useNotifications()
const { deviceId } = useDeviceId()
useScrollReveal()

const sounds = ref(sound.enabled.value)
const confirmClear = ref(false)

const aboutInfo = computed(() => [
  [t('settings.version'), '1.0.0'],
  [t('settings.framework'), 'Vue 3 + Vite'],
  [t('settings.database'), 'NeonDB'],
  [t('settings.typography'), 'Geist'],
  ['Device ID', deviceId.slice(0, 12) + '...']
])

function handleExport() {
  exportAllData()
  sound.click()
  appStore.addNotification({ type: 'success', title: t('settings.dataExported') })
}

async function handleClear() {
  confirmClear.value = false
  await clearAllData()
  sound.click()
  appStore.addNotification({ type: 'success', title: t('settings.dataCleared') })
}

async function toggleNotifications() {
  if (notifications.permission.value !== 'granted') {
    const result = await notifications.requestPermission()
    if (result === 'granted') {
      appStore.addNotification({ type: 'success', title: isEs.value ? 'Notificaciones activadas' : 'Notifications enabled' })
      notifications.start()
    } else if (result === 'denied') {
      appStore.addNotification({ type: 'error', title: isEs.value ? 'Permiso denegado' : 'Permission denied' })
    }
  } else {
    notifications.setEnabled(!notifications.enabled.value)
  }
}

watch(sounds, (v) => sound.setEnabled(v))
</script>
