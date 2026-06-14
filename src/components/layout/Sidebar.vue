<template>
  <div>
    <!-- Mobile overlay -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isMobile && appStore.sidebarOpen"
          class="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
          @click="appStore.toggleSidebar"
        />
      </transition>
    </Teleport>

    <!-- Desktop sidebar — floating pill -->
    <aside
      :class="[
        'fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col transition-all duration-[600ms]',
        'ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-[60px]' : 'w-[200px]',
        'hidden lg:flex'
      ]"
      style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); border-radius: 20px; box-shadow: 0 16px 48px rgba(0,0,0,0.25), inset 0 1px 0 var(--glass-highlight);"
    >
      <div class="flex items-center gap-3 px-4 py-4 border-b" :style="{ borderColor: 'var(--border)' }">
        <div class="w-8 h-8 rounded-[10px] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
            <path d="M50 10 L18 85 L35 85 L50 42 L65 85 L82 85 Z" fill="var(--text)"/>
          </svg>
        </div>
        <transition name="fade">
          <span v-if="!collapsed" class="text-[14px] font-semibold tracking-[-0.02em] text-[var(--text)]">Aevum</span>
        </transition>
      </div>

      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 relative',
            isActive(item.path)
              ? 'bg-[var(--card-hover)] text-[var(--text)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-dim)] hover:bg-[var(--card-bg)]'
          ]"
        >
          <div v-html="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-colors duration-500', isActive(item.path) ? 'text-[var(--text)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text-dim)]']"/>
          <transition name="fade">
            <span v-if="!collapsed" class="text-[12px] font-medium">{{ item.label }}</span>
          </transition>
        </router-link>
      </nav>

      <div class="px-2 pb-3">
        <button @click="appStore.toggleSidebarCollapse" class="w-full p-2 rounded-xl text-[var(--text-faint)] hover:text-[var(--text-dim)] hover:bg-[var(--card-bg)] transition-all duration-500 flex items-center justify-center">
          <svg :class="['w-3.5 h-3.5 transition-transform duration-500', collapsed ? 'rotate-180' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>
    </aside>

    <!-- Mobile bottom nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-3" style="padding-bottom: max(12px, env(safe-area-inset-bottom));">
      <div class="flex items-center justify-around py-2 px-1 rounded-2xl" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 -4px 24px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['p-2.5 rounded-xl transition-all duration-500', isActive(item.path) ? 'bg-[var(--card-hover)] text-[var(--text)]' : 'text-[var(--text-dim)]']"
          :title="item.label"
        >
          <div v-html="item.icon" class="w-[18px] h-[18px]"/>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const appStore = useAppStore()
const { t } = useI18n()
const collapsed = computed(() => appStore.sidebarCollapsed)
const isMobile = ref(false)

function checkMobile() { isMobile.value = window.innerWidth < 1024 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

const navItems = computed(() => [
  { path: '/', label: t('nav.home'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { path: '/notes', label: t('nav.notes'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
  { path: '/tasks', label: t('nav.tasks'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
  { path: '/calendar', label: t('nav.calendar'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  { path: '/settings', label: t('nav.settings'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' }
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
