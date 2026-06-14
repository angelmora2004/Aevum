<template>
  <div class="min-h-full px-5 lg:px-10 py-12 lg:py-20">
    <div class="max-w-[1400px] mx-auto">
      <div class="mb-16" data-reveal>
        <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">Tiempo</span>
        <div class="flex items-end justify-between mt-4">
          <h1 class="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[var(--text)]">{{ t('calendar.title') }}</h1>
          <div class="flex items-center gap-1">
            <button @click="prevMonth" class="btn-icon"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button @click="goToToday" class="btn btn-ghost-nav">{{ t('calendar.today') }}</button>
            <button @click="nextMonth" class="btn-icon"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
        <p class="text-[14px] text-[var(--text-dim)] mt-3">{{ monthNames[currentMonth] }} {{ currentYear }}</p>
      </div>

      <div class="card-3d overflow-hidden" data-reveal-scale>
        <div class="grid grid-cols-7 border-b border-[var(--card-border)]">
          <div v-for="day in weekDays" :key="day" class="p-3 text-center"><span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.15em]">{{ day }}</span></div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="(cell, i) in calendarCells" :key="i" :class="['min-h-[70px] lg:min-h-[100px] p-2 border-b border-r border-[var(--divider)] transition-all duration-500', cell.isCurrentMonth ? 'hover:hover:bg-[var(--hover-bg)]' : 'opacity-20', cell.isToday && 'bg-[var(--card-bg)]']">
            <span :class="['text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1', cell.isToday ? 'bg-[var(--btn-bg)] text-[var(--btn-text)]' : cell.isCurrentMonth ? 'text-[var(--text-dim)]' : 'text-[var(--text-faint)]']">{{ cell.day }}</span>
            <div class="space-y-0.5">
              <div v-for="task in cell.tasks.slice(0, 2)" :key="task.id" class="text-[10px] px-1.5 py-0.5 rounded truncate bg-[var(--card-hover)] text-[var(--text-dim)]">{{ task.title }}</div>
              <div v-if="cell.tasks.length > 2" class="text-[10px] text-[var(--text-faint)] px-1.5">+{{ cell.tasks.length - 2 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-4 mt-6">
        <div class="card-3d p-6" data-reveal>
          <h3 class="text-[13px] font-semibold text-[var(--text)] mb-4">{{ isEs ? 'Esta semana' : 'This week' }}</h3>
          <div v-if="weekTasks.length === 0" class="py-6 text-center"><p class="text-[12px] text-[var(--text-faint)]">{{ t('calendar.noEvents') }}</p></div>
          <div v-else class="space-y-2">
            <div v-for="task in weekTasks" :key="task.id" class="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--card-bg)] transition-all duration-500">
              <div class="w-1.5 h-1.5 rounded-full bg-[var(--btn-bg)] flex-shrink-0"/>
              <p class="text-[12px] text-[var(--text)] truncate flex-1">{{ task.title }}</p>
              <span class="text-[10px] text-[var(--text-muted)] font-mono">{{ formatShortDate(task.due_date) }}</span>
            </div>
          </div>
        </div>
        <div class="card-3d p-6" data-reveal>
          <h3 class="text-[13px] font-semibold text-[var(--text)] mb-4">{{ isEs ? 'Resumen' : 'Summary' }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-center"><p class="text-[28px] font-bold text-[var(--text)] leading-none">{{ monthTaskCount }}</p><p class="text-[10px] text-[var(--text-muted)] mt-2 uppercase tracking-wider">{{ t('nav.tasks') }}</p></div>
            <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-center"><p class="text-[28px] font-bold text-[var(--text)] leading-none">{{ monthCompletedCount }}</p><p class="text-[10px] text-[var(--text-muted)] mt-2 uppercase tracking-wider">{{ t('dashboard.completed') }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTasksStore } from '../stores/tasks'
import { useScrollReveal } from '../composables/useAnimations'
import { useI18n } from '../composables/useI18n'
import { ref, computed } from 'vue'
const tasksStore = useTasksStore()
const { t, isEs } = useI18n()
useScrollReveal()
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const monthNames = computed(() => t('calendar.months'))
const weekDays = computed(() => t('calendar.weekdays'))

const calendarCells = computed(() => {
  const y = currentYear.value, m = currentMonth.value
  const first = new Date(y, m, 1), last = new Date(y, m + 1, 0)
  const offset = (first.getDay() + 6) % 7, total = last.getDate()
  const cells = [], prev = new Date(y, m, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: prev - i, isCurrentMonth: false, isToday: false, tasks: [] })
  for (let d = 1; d <= total; d++) {
    const date = new Date(y, m, d), ds = date.toISOString().split('T')[0]
    cells.push({ day: d, isCurrentMonth: true, isToday: d === today.getDate() && m === today.getMonth() && y === today.getFullYear(), tasks: tasksStore.tasks.filter(t => t.due_date && t.due_date.startsWith(ds)) })
  }
  for (let i = 1; i <= 42 - cells.length; i++) cells.push({ day: i, isCurrentMonth: false, isToday: false, tasks: [] })
  return cells
})

const weekTasks = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return tasksStore.tasks.filter(t => t.due_date && new Date(t.due_date) >= start && new Date(t.due_date) <= end).slice(0, 5)
})

const monthTaskCount = computed(() => { const p = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`; return tasksStore.tasks.filter(t => t.due_date && t.due_date.startsWith(p)).length })
const monthCompletedCount = computed(() => { const p = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`; return tasksStore.tasks.filter(t => t.due_date && t.due_date.startsWith(p) && t.completed).length })

function prevMonth() { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value-- }
function nextMonth() { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++ }
function goToToday() { currentMonth.value = today.getMonth(); currentYear.value = today.getFullYear() }
function formatShortDate(d) { return d ? new Date(d).toLocaleDateString(lang.value === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }) : '' }
</script>
