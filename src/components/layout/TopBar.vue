<template>
  <header class="h-[60px] lg:h-[72px] flex items-center justify-center relative z-30 px-4 lg:px-10">
    <button @click="openSearch" class="relative group w-full max-w-[480px] mx-auto text-left flex items-center" style="height: 42px; padding-left: 44px; padding-right: 56px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors duration-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span class="text-[13px] text-[var(--text-muted)]">{{ isEs ? 'Buscar notas, tareas...' : 'Search notes, tasks...' }}</span>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 px-2 rounded-md bg-[var(--card-hover)] border border-[var(--card-border)] pointer-events-none hidden sm:flex">
        <span class="text-[11px] text-[var(--text-dim)] font-mono leading-none">⌘K</span>
      </div>
    </button>
    <button @click="appStore.toggleChat" :class="['absolute right-4 lg:right-10 btn-icon !w-9 !h-9 lg:!w-10 lg:!h-10 transition-all duration-500', appStore.chatOpen && '!bg-[var(--card-hover)] !text-[var(--text)] !border-[var(--border-strong)]']">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  </header>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'

const appStore = useAppStore()
const { isEs } = useI18n()
const sound = useSound()

function openSearch() {
  sound.click()
  window.dispatchEvent(new CustomEvent('aevum:open-search'))
}
</script>
