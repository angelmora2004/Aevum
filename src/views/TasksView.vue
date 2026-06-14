<template>
  <div class="min-h-full px-5 lg:px-10 py-12 lg:py-20">
    <div class="max-w-[1400px] mx-auto">
      <div class="mb-16" data-reveal>
        <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">Flow</span>
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4">
          <h1 class="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[var(--text)]">{{ t('tasks.title') }}</h1>
          <button @click="openCreateModal()" class="btn btn-white group self-start sm:self-auto">
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ t('tasks.new') }}
          </button>
        </div>

        <!-- AI Quick Add -->
        <div class="mt-6 card-3d p-3 flex items-center gap-3">
          <svg class="w-4 h-4 text-[var(--text-dim)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
          <input
            v-model="aiInput"
            @keydown.enter="parseNaturalLanguage"
            :placeholder="aiPlaceholder"
            class="flex-1 bg-transparent outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
            :disabled="aiLoading"
          />
          <button v-if="aiLoading" class="text-[10px] text-[var(--text-dim)]">{{ isEs ? 'Procesando...' : 'Processing...' }}</button>
          <button v-else-if="aiInput.trim()" @click="parseNaturalLanguage" class="btn btn-white !py-1.5 !px-3 !text-[11px]">{{ isEs ? 'Crear' : 'Create' }}</button>
        </div>
        <p class="text-[14px] text-[var(--text-dim)] mt-3">{{ tasksStore.pendingTasks.length }} {{ t('dashboard.pending').toLowerCase() }} · {{ tasksStore.completedTasks.length }} {{ t('dashboard.completed').toLowerCase() }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-8" data-reveal>
        <button v-for="f in filters" :key="f.id" @click="activeFilter = f.id" :class="['px-3 sm:px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-500', activeFilter === f.id ? 'bg-[var(--card-hover)] text-[var(--text)] border border-[var(--border-strong)]' : 'bg-transparent text-[var(--text-dim)] border border-transparent hover:bg-[var(--card-bg)]']">
          <span class="sm:hidden">{{ f.mobile }}</span>
          <span class="hidden sm:inline">{{ f.label }}</span>
        </button>
      </div>

      <div v-if="tasksStore.loading"><TaskSkeleton :count="5" /></div>

      <EmptyState v-else-if="filteredTasks.length === 0" :title="t('tasks.empty')" :description="t('tasks.emptyDesc')" :icon="emptyIcon" data-reveal-scale>
        <button @click="openCreateModal()" class="btn btn-white mt-4">{{ t('tasks.new') }}</button>
      </EmptyState>

      <TransitionGroup v-else name="task-list" tag="div" class="space-y-2 relative">
        <div
          v-for="(task, i) in filteredTasks"
          :key="task.id"
          class="relative group drag-item"
          :class="{ 'drag-over': drag.isDragOver(i) }"
          :draggable="true"
          @dragstart="drag.onDragStart($event, task, i)"
          @dragend="drag.onDragEnd"
          @dragover="drag.onDragOver($event, i)"
          @dragleave="drag.onDragLeave"
          @drop="drag.onDrop($event, i)"
          :data-reveal="''"
          :style="{ transitionDelay: (i * 0.04) + 's' }"
        >
          <div :class="['task-card-wrapper', swipe.isSwiping.value && swipe.direction.value ? (swipe.direction.value === 'left' ? 'swiping-right' : 'swiping-left') : '']">
            <!-- Swipe background actions (mobile only) -->
            <div class="swipe-bg-left">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span class="text-[11px] font-semibold ml-2">{{ t('dashboard.completed') }}</span>
            </div>
            <div class="swipe-bg-right">
              <span class="text-[11px] font-semibold mr-2">{{ t('common.delete') }}</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <!-- Main card content -->
            <div
              class="task-card-content"
              :style="isMobile ? {
                transform: `translateX(${swipe.currentX.value}px)`,
                transition: swipe.isSwiping.value ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                touchAction: 'pan-y'
              } : {}"
              @touchstart="handleSwipeStart($event, task)"
              @touchmove="isMobile && swipe.onTouchMove($event)"
              @touchend="isMobile && swipe.onTouchEnd()"
              @touchcancel="isMobile && swipe.onTouchCancel()"
            >
              <div class="p-5">
                <div class="flex items-center gap-2 sm:gap-4">
                  <div class="cursor-grab active:cursor-grabbing text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-colors flex-shrink-0 hidden sm:block">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                  </div>
                  <button @click="toggleTask(task)" :class="['relative w-6 h-6 rounded-lg border-[1.5px] flex items-center justify-center transition-all duration-500 flex-shrink-0', celebratingIds.has(task.id) ? 'just-checked confetti-burst' : '', task.completed ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-faint)] hover:border-[var(--text-dim)]']">
                    <span v-if="celebratingIds.has(task.id)" class="c1"/><span v-if="celebratingIds.has(task.id)" class="c2"/><span v-if="celebratingIds.has(task.id)" class="c3"/><span v-if="celebratingIds.has(task.id)" class="c4"/>
                    <svg v-if="task.completed" class="w-3 h-3 text-[var(--btn-text)] check-icon task-checked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline class="checkmark-path" points="20 6 9 17 4 12"/></svg>
                  </button>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p :class="['text-[14px] font-medium truncate transition-all duration-500', task.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]']">{{ task.title }}</p>
                      <span v-if="task.is_recurring" class="text-[9px] px-1.5 py-0.5 rounded bg-[var(--card-hover)] text-[var(--text-dim)]">↻</span>
                    </div>
                    <p v-if="task.description" class="text-[11px] text-[var(--text-faint)] mt-0.5 truncate">{{ task.description }}</p>
                  </div>
                  <div class="hidden sm:flex items-center gap-2">
                    <button v-if="!task.completed" @click.stop="toggleTimer(task.id)" :class="['px-2 py-1 rounded-lg text-[10px] font-mono transition-all duration-300', timeTracker.isRunning(task.id) ? 'bg-[var(--pulse-bg)] text-[var(--text)] animate-pulse' : 'bg-[var(--card-bg)] text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text-dim)]']">
                      {{ timeTracker.isRunning(task.id) ? timeTracker.formatTime(timeTracker.activeTimers.value[task.id]?.seconds || 0) : formatTime(task.time_spent) }}
                    </button>
                    <span v-else class="text-[10px] font-mono text-[var(--text-muted)]">{{ formatTime(task.time_spent) }}</span>
                  </div>
                  <span :class="['text-[10px] font-medium px-2.5 py-1 rounded-full', priorityClass(task.priority)]">{{ task.priority }}</span>
                  <div class="hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100 items-center gap-1 transition-opacity duration-500">
                    <button @click.stop="addSubtask(task)" class="btn-icon !w-8 !h-8 !rounded-lg" title="Subtarea"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                    <button @click.stop="openCreateModal(task)" class="btn-icon !w-8 !h-8 !rounded-lg"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button @click.stop="deleteWithUndo(task)" class="btn-icon !w-8 !h-8 !rounded-lg"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                </div>
                <div v-if="getSubtasks(task.id).length > 0" class="mt-3 ml-6 sm:ml-10 space-y-1">
                  <div v-for="sub in getSubtasks(task.id)" :key="sub.id" class="flex items-center gap-3 py-1.5 group/sub">
                    <button @click="toggleTask(sub)" :class="['relative w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-300 flex-shrink-0', sub.completed ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-faint)] hover:border-[var(--text-dim)]']">
                      <svg v-if="sub.completed" class="w-2 h-2 text-[var(--btn-text)] task-checked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline class="checkmark-path" points="20 6 9 17 4 12"/></svg>
                    </button>
                    <p :class="['text-[12px] flex-1 transition-all duration-300', sub.completed ? 'text-[var(--text-faint)] line-through' : 'text-[var(--text-dim)]']">{{ sub.title }}</p>
                    <button @click="deleteWithUndo(sub)" class="opacity-0 group-hover/sub:opacity-100 p-1 rounded hover:bg-[var(--card-hover)] text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-all duration-300"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Modal -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
            <div class="fixed inset-0 backdrop-blur-[40px]" style="background: var(--backdrop);" @click="showModal = false"/>
            <transition name="slide-up">
              <div v-if="showModal" class="relative rounded-[24px] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 32px 100px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
                <div class="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)]">
                  <h3 class="text-[14px] font-semibold text-[var(--text)]">{{ editingTask ? t('common.edit') : isSubtask ? (isEs ? 'Subtarea' : 'Subtask') : t('tasks.new') }} {{ isEs ? 'Tarea' : 'Task' }}</h3>
                  <button @click="showModal = false" class="btn-icon !w-8 !h-8"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                <div class="flex-1 overflow-y-auto p-6 space-y-4">
                  <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Título' : 'Title' }}</label><input v-model="form.title" :placeholder="t('tasks.placeholder')"/></div>
                  <div v-if="!isSubtask"><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Descripción' : 'Description' }}</label><textarea v-model="form.description" :placeholder="isEs ? 'Detalles...' : 'Details...'" rows="3" class="resize-none"/></div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ t('tasks.priority') }}</label><CustomSelect v-model="form.priority" :options="[{ value: 'low', label: t('tasks.priorityLow') }, { value: 'medium', label: t('tasks.priorityMedium') }, { value: 'high', label: t('tasks.priorityHigh') }]"/></div>
                    <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Fecha' : 'Date' }}</label><CustomDateTimePicker v-model="form.due_date"/></div>
                  </div>
                  <div v-if="!isSubtask" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Categoría' : 'Category' }}</label><input v-model="form.category" :placeholder="isEs ? 'trabajo...' : 'work...'"/></div>
                    <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Tiempo est. (min)' : 'Est. time (min)' }}</label><input v-model.number="form.time_estimated" type="number" placeholder="0"/></div>
                  </div>
                  <div v-if="!isSubtask">
                    <label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ t('tasks.recurring') }}</label>
                    <div class="flex items-center gap-3">
                      <button @click="form.is_recurring = !form.is_recurring" :class="['w-10 h-[22px] rounded-full relative transition-all duration-500', form.is_recurring ? 'bg-[var(--btn-bg)]' : 'bg-[var(--card-hover)]']">
                        <div :class="['w-4 h-4 rounded-full absolute top-[3px] transition-all duration-500', form.is_recurring ? 'left-[22px] bg-[#030303]' : 'left-[3px] bg-[var(--toggle-knob-off)]']"/>
                      </button>
                      <span class="text-[12px] text-[var(--text-dim)]">{{ form.is_recurring ? (isEs ? 'Activo' : 'Active') : t('common.no') }}</span>
                    </div>
                    <div v-if="form.is_recurring" class="mt-3">
                      <CustomSelect v-model="form.recurring_type" :options="[{ value: 'daily', label: isEs ? 'Diario' : 'Daily' }, { value: 'weekly', label: isEs ? 'Semanal' : 'Weekly' }, { value: 'monthly', label: isEs ? 'Mensual' : 'Monthly' }]"/>
                    </div>
                  </div>
                </div>
                <div class="px-6 py-4 border-t border-[var(--card-border)] flex justify-end gap-2">
                  <button @click="showModal = false" class="btn btn-ghost-nav">{{ t('common.cancel') }}</button>
                  <button @click="saveTask" class="btn btn-white">{{ editingTask ? t('common.save') : t('common.create') }}</button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { useTasksStore } from '../stores/tasks'
import { useAppStore } from '../stores/app'
import { useTimeTracker } from '../composables/useTimeTracker'
import { useDragDrop } from '../composables/useDragDrop'
import { useScrollReveal, useCardTilt } from '../composables/useAnimations'
import { useI18n } from '../composables/useI18n'
import { useSwipe } from '../composables/useSwipe'
import { useSound } from '../composables/useSound'
import EmptyState from '../components/ui/EmptyState.vue'
import TaskSkeleton from '../components/ui/TaskSkeleton.vue'
import CustomSelect from '../components/ui/CustomSelect.vue'
import CustomDateTimePicker from '../components/ui/CustomDateTimePicker.vue'
import { inject, ref, computed, onMounted, onUnmounted } from 'vue'

const tasksStore = useTasksStore()
const appStore = useAppStore()
const timeTracker = useTimeTracker()
const { t, isEs, lang } = useI18n()
const sound = useSound()
const showUndo = inject('showUndo')
useScrollReveal()
useCardTilt()

const isMobile = ref(false)
function checkMobile() { isMobile.value = window.innerWidth < 1024 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

const celebratingIds = ref(new Set())
function celebrate(taskId) {
  celebratingIds.value.add(taskId)
  setTimeout(() => { celebratingIds.value.delete(taskId) }, 600)
}

const swipeTarget = ref(null)
const swipe = useSwipe({
  threshold: 100,
  onSwipeRight: () => {
    const t = swipeTarget.value
    if (t && !t.completed) {
      toggleTask(t)
      sound.complete()
    }
  },
  onSwipeLeft: () => {
    const t = swipeTarget.value
    if (t) {
      deleteWithUndo(t)
      sound.delete()
    }
  }
})

function handleSwipeStart(e, task) {
  if (!isMobile.value) return
  swipeTarget.value = task
  swipe.onTouchStart(e)
}

const aiInput = ref('')
const aiLoading = ref(false)
const aiPlaceholder = computed(() => isEs.value
  ? 'Escribe: "Reunión con Juan mañana a las 3pm"'
  : 'Type: "Meeting with John tomorrow at 3pm"')

async function parseNaturalLanguage() {
  const text = aiInput.value.trim()
  if (!text || aiLoading.value) return
  aiLoading.value = true
  try {
    const res = await fetch('/api/parse-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang.value })
    })
    if (!res.ok) throw new Error('Parse failed')
    const parsed = await res.json()
    let due_date = parsed.due_date || ''
    if (due_date && !due_date.includes('T')) due_date = due_date + 'T09:00'
    const taskData = {
      title: parsed.title || text.slice(0, 80),
      description: parsed.description || '',
      priority: ['low', 'medium', 'high'].includes(parsed.priority) ? parsed.priority : 'medium',
      due_date: due_date || '',
      category: parsed.category || 'general',
      is_recurring: !!parsed.is_recurring,
      recurring_type: parsed.recurring_type || 'daily',
      time_estimated: 0
    }
    await tasksStore.createTask(taskData)
    sound.complete()
    appStore.addNotification({ type: 'success', title: t('common.create'), message: isEs.value ? 'Tarea creada con IA' : 'Task created with AI' })
    aiInput.value = ''
  } catch (e) {
    sound.error()
    appStore.addNotification({ type: 'error', title: isEs.value ? 'Error al procesar' : 'Parse error' })
  } finally {
    aiLoading.value = false
  }
}

const activeFilter = ref('all')
const showModal = ref(false)
const editingTask = ref(null)
const isSubtask = ref(false)
const parentId = ref(null)
const form = ref({ title: '', description: '', priority: 'medium', due_date: '', category: 'general', time_estimated: 0, is_recurring: false, recurring_type: 'daily', recurring_interval: 1 })

const filters = computed(() => [
  { id: 'all', label: t('tasks.filters.all'), mobile: t('tasks.filters.allMobile') },
  { id: 'pending', label: t('tasks.filters.pending'), mobile: t('tasks.filters.pendingMobile') },
  { id: 'completed', label: t('tasks.filters.completed'), mobile: t('tasks.filters.completedMobile') },
  { id: 'today', label: isEs.value ? 'Hoy' : 'Today', mobile: isEs.value ? 'Hoy' : 'Today' },
  { id: 'recurring', label: t('tasks.filters.recurring'), mobile: t('tasks.filters.recurringMobile') }
])
const emptyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks.filter(t => !t.parent_id)
  if (activeFilter.value === 'pending') tasks = tasksStore.pendingTasks.filter(t => !t.parent_id)
  if (activeFilter.value === 'completed') tasks = tasksStore.completedTasks.filter(t => !t.parent_id)
  if (activeFilter.value === 'today') tasks = tasksStore.todayTasks.filter(t => !t.parent_id)
  if (activeFilter.value === 'recurring') tasks = tasks.filter(t => t.is_recurring)
  return tasks
})

const drag = useDragDrop(filteredTasks, async (newOrder) => {
  for (const task of newOrder) {
    await tasksStore.updateTask(task.id, { sort_order: task.sort_order })
  }
})

function getSubtasks(parentId) { return tasksStore.tasks.filter(t => t.parent_id === parentId) }
function priorityClass(p) { return { high: 'bg-[#ff4444]/15 text-[#ff6666]', medium: 'bg-[var(--chip-bg)] text-[var(--text-dim)]', low: 'bg-[var(--chip-bg)] text-[var(--text-muted)]' }[p] || 'bg-[var(--chip-bg)] text-[var(--text-dim)]' }
function formatTime(s) { if (!s) return '0:00'; const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60; return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}` }

function toggleTimer(taskId) {
  const elapsed = timeTracker.toggle(taskId)
  if (elapsed) { const task = tasksStore.tasks.find(t => t.id === taskId); if (task) tasksStore.updateTask(taskId, { time_spent: (task.time_spent || 0) + elapsed }) }
}

function openCreateModal(task = null) {
  if (task && task.id) {
    editingTask.value = task
    isSubtask.value = false
    parentId.value = null
    form.value = { title: task.title || '', description: task.description || '', priority: task.priority || 'medium', due_date: task.due_date || '', category: task.category || 'general', time_estimated: task.time_estimated || 0, is_recurring: task.is_recurring || false, recurring_type: task.recurring_type || 'daily', recurring_interval: task.recurring_interval || 1 }
  } else {
    isSubtask.value = false
    parentId.value = null
    editingTask.value = null
    form.value = { title: '', description: '', priority: 'medium', due_date: '', category: 'general', time_estimated: 0, is_recurring: false, recurring_type: 'daily', recurring_interval: 1 }
  }
  showModal.value = true
}

function addSubtask(task) { isSubtask.value = true; parentId.value = task.id; editingTask.value = null; form.value = { title: '', description: '', priority: 'medium', due_date: '', category: task.category || 'general', time_estimated: 0, is_recurring: false, recurring_type: 'daily', recurring_interval: 1 }; showModal.value = true }

async function toggleTask(task) {
  const wasCompleted = task.completed
  await tasksStore.updateTask(task.id, { completed: !task.completed })
  if (!wasCompleted) { sound.complete(); celebrate(task.id) }
}

async function saveTask() {
  if (!form.value.title.trim()) return
  const data = { ...form.value, parent_id: parentId.value }
  if (editingTask.value) { await tasksStore.updateTask(editingTask.value.id, data); appStore.addNotification({ type: 'success', title: t('common.save'), message: isEs.value ? 'Tarea actualizada' : 'Task updated' }) }
  else { await tasksStore.createTask(data); appStore.addNotification({ type: 'success', title: t('common.create'), message: isSubtask.value ? (isEs.value ? 'Subtarea agregada' : 'Subtask added') : (isEs.value ? 'Nueva tarea lista' : 'New task ready') }) }
  showModal.value = false
}

async function deleteWithUndo(task) {
  const taskData = { ...task }
  await tasksStore.deleteTask(task.id)
  sound.delete()
  showUndo(isEs.value ? 'Tarea eliminada' : 'Task deleted', async () => { await tasksStore.createTask(taskData) })
}
</script>

<style scoped>
.check-icon { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
