<template>
  <div class="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
    <transition-group name="slide-up">
      <div v-for="notif in notifications" :key="notif.id" class="pointer-events-auto px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[380px] rounded-2xl" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-highlight);">
        <div class="w-7 h-7 rounded-lg bg-[var(--card-hover)] flex items-center justify-center flex-shrink-0">
          <svg v-if="notif.type === 'success'" class="w-3.5 h-3.5 text-[var(--text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else class="w-3.5 h-3.5 text-[var(--text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="notif.title" class="text-[12px] font-medium text-[var(--text)]">{{ notif.title }}</p>
          <p class="text-[11px] text-[var(--text-dim)] truncate">{{ notif.message }}</p>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { computed } from 'vue'
const appStore = useAppStore()
const notifications = computed(() => appStore.notifications)
</script>
