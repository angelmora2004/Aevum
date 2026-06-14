<template>
  <div class="min-h-[250vh] relative">
    <!-- HERO — BIENVENIDA + ACCIONES RÁPIDAS -->
    <section class="min-h-screen flex flex-col justify-center px-5 lg:px-10 py-20 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-[15%] right-[5%] w-[500px] h-[500px] rounded-full hover:bg-[var(--hover-bg)] blur-[120px]" style="animation: drift 30s ease-in-out infinite"/>
        <div class="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[var(--glow-soft)] blur-[100px]" style="animation: drift 25s ease-in-out infinite reverse"/>
      </div>

      <div class="max-w-[1400px] mx-auto w-full relative z-10">
        <div data-reveal class="mb-6">
          <div class="inline-flex items-center gap-3">
            <div class="w-8 h-[1px] bg-[var(--card-border)]"/>
            <span class="text-[10px] font-medium text-[var(--text-dim)] uppercase tracking-[0.25em]">{{ t('dashboard.subtitle') }}</span>
          </div>
        </div>

        <div data-reveal>
          <h1 class="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-balance max-w-[700px]">
            <span class="text-[var(--text)]">{{ greeting }}.</span><br>
            <span class="text-[var(--text-dim)]">{{ t('dashboard.featuresTitle') }}.</span>
          </h1>
        </div>

        <p class="text-[15px] text-[var(--text-dim)] mt-6 max-w-[420px] leading-relaxed" data-reveal>
          {{ t('dashboard.featureNotesDesc') }} · {{ t('dashboard.featureTasksDesc') }} · {{ t('dashboard.featurePomodoroDesc') }}
        </p>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-12 max-w-[800px]" data-reveal>
          <button v-for="(action, i) in quickActions" :key="action.label" @click="action.handler" class="card-3d p-5 text-left group cursor-pointer" :style="{ transitionDelay: (0.1 + i * 0.05) + 's' }">
            <div class="w-10 h-10 rounded-xl bg-[var(--card-hover)] flex items-center justify-center mb-4 group-hover:bg-[var(--card-hover)] transition-all duration-500">
              <div v-html="action.icon" class="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors duration-500"/>
            </div>
            <p class="text-[13px] font-medium text-[var(--text)] mb-1">{{ action.label }}</p>
            <p class="text-[11px] text-[var(--text-dim)] leading-relaxed">{{ action.desc }}</p>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-6 mt-12" data-reveal>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[var(--btn-bg)]"/>
            <span class="text-[13px] text-[var(--text-dim)]">{{ animatedToday }} {{ t('dashboard.todayTasks').toLowerCase() }}</span>
          </div>
          <div class="w-px h-4 bg-[var(--card-hover)]"/>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[var(--text-dim)]"/>
            <span class="text-[13px] text-[var(--text-dim)]">{{ animatedNotes }} {{ t('nav.notes').toLowerCase() }}</span>
          </div>
          <div class="w-px h-4 bg-[var(--card-hover)]"/>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[var(--text-faint)]"/>
            <span class="text-[13px] text-[var(--text-dim)]">{{ animatedPending }} {{ t('dashboard.pending').toLowerCase() }}</span>
          </div>
        </div>

        <div class="mt-16 flex items-center gap-3" data-reveal>
          <div class="w-[1px] h-10 bg-gradient-to-b from-white/20 to-transparent relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1/2 bg-[var(--text-dim)]" style="animation: slide-up-stagger 1.5s ease-in-out infinite"/>
          </div>
          <span class="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Scroll</span>
        </div>
      </div>
    </section>

    <!-- SMART SUGGESTIONS -->
    <section v-if="suggestions.suggestions.value.length > 0" class="px-5 lg:px-10 py-8 relative">
      <div class="max-w-[1400px] mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="s in suggestions.suggestions.value" :key="s.id" class="card-3d p-4 flex items-start gap-3" data-reveal>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', s.type === 'warning' ? 'bg-[#ff4444]/10 text-[#ff6666]' : s.type === 'success' ? 'bg-[var(--card-hover)] text-[var(--text)]' : 'bg-[var(--card-hover)] text-[var(--text-dim)]']">
              <svg v-if="s.icon === 'alert'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-else-if="s.icon === 'clock'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <svg v-else-if="s.icon === 'folder'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <svg v-else-if="s.icon === 'chart'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              <svg v-else-if="s.icon === 'check'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-semibold text-[var(--text)] leading-tight">{{ s.title }}</p>
              <p class="text-[11px] text-[var(--text-dim)] leading-relaxed mt-1">{{ s.message }}</p>
              <router-link v-if="s.action" :to="s.action.route" class="text-[10px] text-[var(--text)]/80 hover:text-[var(--text)] mt-2 inline-flex items-center gap-1 uppercase tracking-wider">
                {{ s.action.label }} →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- QUICK OVERVIEW — LO QUE PUEDES HACER -->
    <section class="px-5 lg:px-10 py-20 lg:py-32 relative">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex items-center justify-between mb-12" data-reveal>
          <div>
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">Features</span>
            <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-[-0.03em] leading-[0.95] text-[var(--text)] mt-2">{{ t('dashboard.featuresTitle') }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(feature, i) in features" :key="feature.title" class="card-3d p-6 group cursor-pointer" :data-reveal-scale="''" :style="{ transitionDelay: (i * 0.06) + 's' }" @click="feature.handler">
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--card-hover)] flex items-center justify-center group-hover:bg-[var(--card-hover)] transition-all duration-500">
                <div v-html="feature.icon" class="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors duration-500"/>
              </div>
              <svg class="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-dim)] transition-all duration-500 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <h3 class="text-[14px] font-semibold text-[var(--text)] mb-1">{{ feature.title }}</h3>
            <p class="text-[12px] text-[var(--text-dim)] leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TASKS PREVIEW -->
    <section class="px-5 lg:px-10 py-20 lg:py-32 relative">
      <div class="max-w-[1400px] mx-auto">
        <div class="grid grid-cols-12 gap-8 lg:gap-16 items-start">
          <div class="col-span-12 lg:col-span-4" data-reveal-left>
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">{{ t('nav.tasks') }}</span>
            <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-[-0.03em] leading-[0.95] text-[var(--text)] mt-2">{{ t('dashboard.todayTasks') }}</h2>
            <p class="text-[13px] text-[var(--text-dim)] mt-3 leading-relaxed max-w-[280px]">{{ tasksStore.todayTasks.length }} {{ isEs ? 'tareas programadas para hoy.' : 'tasks scheduled for today.' }}</p>
            <div class="mt-6"><router-link to="/tasks" class="btn btn-outline group text-[12px]">{{ t('dashboard.viewAll') }} <svg class="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></router-link></div>
          </div>
          <div class="col-span-12 lg:col-span-8">
            <div v-if="tasksStore.todayTasks.length === 0" class="card-3d p-12 text-center" data-reveal-scale>
              <div class="w-12 h-12 rounded-2xl bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <p class="text-[14px] text-[var(--text-dim)] font-medium">{{ t('dashboard.noTasksToday') }}</p>
              <p class="text-[12px] text-[var(--text-muted)] mt-1">{{ t('dashboard.noTasksTodayDesc') }}</p>
              <button @click="goToTasks" class="btn btn-white mt-4 text-[12px]">{{ t('tasks.new') }}</button>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(task, i) in tasksStore.todayTasks.slice(0, 4)" :key="task.id" class="card-3d p-5 flex items-center gap-5 group" :data-reveal-right="''" :style="{ transitionDelay: (i * 0.08) + 's' }">
                <button @click="tasksStore.toggleTask(task.id)" :class="['relative w-6 h-6 rounded-lg border-[1.5px] flex items-center justify-center transition-all duration-500 flex-shrink-0', task.completed ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-faint)] group-hover:border-[var(--text-dim)]']">
                  <svg v-if="task.completed" class="w-3 h-3 text-[var(--btn-text)] task-checked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline class="checkmark-path" points="20 6 9 17 4 12"/></svg>
                </button>
                <p :class="['text-[14px] font-medium truncate flex-1 transition-colors', task.completed ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text)]']">{{ task.title }}</p>
                <span class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[var(--card-hover)] text-[var(--text-dim)]">{{ task.priority }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NOTES PREVIEW -->
    <section class="px-5 lg:px-10 py-20 lg:py-32 relative">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex items-end justify-between mb-12" data-reveal>
          <div>
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">Ideas</span>
            <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-[-0.03em] leading-[0.95] text-[var(--text)] mt-2">{{ t('dashboard.recentNotes') }}</h2>
          </div>
          <router-link to="/notes" class="btn btn-ghost-nav group text-[12px] hidden sm:inline-flex">{{ t('dashboard.viewAll') }} <svg class="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></router-link>
        </div>

        <div v-if="notesStore.sortedNotes.length === 0" class="card-3d p-12 text-center" data-reveal-scale>
          <div class="w-12 h-12 rounded-2xl bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <p class="text-[14px] text-[var(--text-dim)] font-medium">{{ t('dashboard.noRecentNotes') }}</p>
          <p class="text-[12px] text-[var(--text-muted)] mt-1">{{ t('notes.emptyDesc') }}</p>
          <button @click="goToNotes" class="btn btn-white mt-4 text-[12px]">{{ t('notes.new') }}</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(note, i) in notesStore.sortedNotes.slice(0, 3)" :key="note.id" class="card-3d p-6 cursor-pointer group" :data-reveal-scale="''" :style="{ transitionDelay: (i * 0.06) + 's' }" @click="goToNotes">
            <div class="flex items-center gap-2 mb-3">
              <div v-if="note.pinned" class="w-1.5 h-1.5 rounded-full bg-[var(--btn-bg)]"/>
              <p class="text-[14px] font-semibold text-[var(--text)] truncate">{{ note.title }}</p>
            </div>
            <p class="text-[12px] text-[var(--text-dim)] line-clamp-3 leading-relaxed">{{ note.content || (isEs ? 'Sin contenido' : 'No content') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BOTTOM CTA -->
    <section class="px-5 lg:px-10 py-20 lg:py-32 relative">
      <div class="max-w-[1400px] mx-auto text-center" data-reveal>
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em] text-[var(--text)]">{{ isEs ? '¿Listo para empezar?' : 'Ready to start?' }}</h2>
        <p class="text-[14px] text-[var(--text-dim)] mt-3 max-w-[300px] mx-auto">{{ isEs ? 'Crea tu primera tarea o nota para comenzar a organizarte.' : 'Create your first task or note to start organizing yourself.' }}</p>
        <div class="flex items-center justify-center gap-3 mt-8">
          <button @click="goToNotes" class="btn btn-white">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            {{ t('notes.new') }}
          </button>
          <button @click="goToTasks" class="btn btn-outline">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            {{ t('tasks.new') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useNotesStore } from '../stores/notes'
import { useTasksStore } from '../stores/tasks'
import { useAppStore } from '../stores/app'
import { useScrollReveal, useCardTilt } from '../composables/useAnimations'
import { useI18n } from '../composables/useI18n'
import { useSmartSuggestions } from '../composables/useSmartSuggestions'
import { useCounter } from '../composables/useCounter'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const notesStore = useNotesStore()
const tasksStore = useTasksStore()
const appStore = useAppStore()
const router = useRouter()
const { t, isEs } = useI18n()

const animatedToday = useCounter(computed(() => tasksStore.todayTasks.length))
const animatedNotes = useCounter(computed(() => notesStore.notes.length))
const animatedPending = useCounter(computed(() => tasksStore.pendingTasks.length))
const suggestions = useSmartSuggestions()
useScrollReveal()
useCardTilt()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return isEs.value ? 'Descansa' : 'Rest'
  if (h < 12) return t('dashboard.greetingMorning')
  if (h < 18) return t('dashboard.greetingAfternoon')
  return t('dashboard.greetingEvening')
})

const quickActions = computed(() => [
  { label: t('notes.new'), desc: isEs.value ? 'Captura una idea rápida' : 'Capture a quick idea', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', handler: () => router.push('/notes') },
  { label: t('tasks.new'), desc: isEs.value ? 'Organiza tu día' : 'Organize your day', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', handler: () => router.push('/tasks') },
  { label: t('nav.calendar'), desc: isEs.value ? 'Visualiza tu agenda' : 'View your agenda', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', handler: () => router.push('/calendar') },
  { label: t('chat.title'), desc: isEs.value ? 'Pide ayuda al asistente' : 'Ask the assistant for help', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', handler: () => appStore.toggleChat() }
])

const features = computed(() => [
  { title: t('dashboard.featureNotes'), desc: t('dashboard.featureNotesDesc'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', handler: () => router.push('/notes') },
  { title: t('dashboard.featureTasks'), desc: t('dashboard.featureTasksDesc'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', handler: () => router.push('/tasks') },
  { title: t('dashboard.featurePomodoro'), desc: t('dashboard.featurePomodoroDesc'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', handler: () => {} },
  { title: 'Time Tracking', desc: isEs.value ? 'Mide cuánto tiempo inviertes en cada tarea para optimizar tu día.' : 'Track time spent on each task to optimize your day.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', handler: () => router.push('/tasks') },
  { title: t('tasks.recurring'), desc: isEs.value ? 'Configura tareas que se repitan diario, semanal o mensualmente.' : 'Set up tasks that repeat daily, weekly or monthly.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>', handler: () => router.push('/tasks') },
  { title: t('dashboard.featureChat'), desc: t('dashboard.featureChatDesc'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>', handler: () => appStore.toggleChat() }
])

function goToNotes() { router.push('/notes') }
function goToTasks() { router.push('/tasks') }
</script>
