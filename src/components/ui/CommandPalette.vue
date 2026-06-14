<template>
  <Teleport to="body">
    <transition name="cmd">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4" @click.self="close">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="close"/>
        <div class="relative w-full max-w-xl rounded-2xl overflow-hidden" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 32px 100px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-[var(--card-border)]">
            <svg class="w-4 h-4 text-[var(--text-dim)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              ref="inputRef"
              v-model="query"
              @keydown.down.prevent="cursor = Math.min(cursor + 1, flatResults.length - 1)"
              @keydown.up.prevent="cursor = Math.max(cursor - 1, 0)"
              @keydown.enter.prevent="onSelect(flatResults[cursor])"
              @keydown.escape="close"
              type="text"
              :placeholder="isEs ? 'Buscar notas, tareas...' : 'Search notes, tasks...'"
              class="flex-1 bg-transparent outline-none text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
            <kbd class="text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border-medium)]">ESC</kbd>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            <div v-if="flatResults.length === 0 && query" class="px-5 py-12 text-center">
              <p class="text-[12px] text-[var(--text-muted)]">{{ isEs ? 'Sin resultados para' : 'No results for' }} "{{ query }}"</p>
            </div>

            <div v-else-if="flatResults.length === 0" class="px-5 py-10">
              <p class="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">{{ isEs ? 'Atajos' : 'Shortcuts' }}</p>
              <div class="space-y-1.5">
                <div v-for="hint in hints" :key="hint.key" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--card-bg)]">
                  <span class="text-[12px] text-[var(--text-dim)]">{{ hint.label }}</span>
                  <kbd class="text-[10px] font-mono text-[var(--text-dim)] px-1.5 py-0.5 rounded border border-[var(--border-medium)]">{{ hint.key }}</kbd>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="grouped.notes.length" class="py-2">
                <p class="px-5 py-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">{{ t('nav.notes') }}</p>
                <button v-for="(item, i) in grouped.notes" :key="'n-' + item.id" @click="onSelect(item)" :class="['w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors', cursor === getFlatIndex(item) ? 'bg-[var(--card-hover)]' : 'hover:bg-[var(--card-bg)]']">
                  <svg class="w-3.5 h-3.5 text-[var(--text-dim)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] text-[var(--text)] truncate">{{ item.title || t('notes.untitled') }}</p>
                    <p class="text-[11px] text-[var(--text-muted)] truncate">{{ stripMd(item.content) || '—' }}</p>
                  </div>
                </button>
              </div>

              <div v-if="grouped.tasks.length" class="py-2 border-t border-[var(--card-border)]">
                <p class="px-5 py-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">{{ t('nav.tasks') }}</p>
                <button v-for="(item, i) in grouped.tasks" :key="'t-' + item.id" @click="onSelect(item)" :class="['w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors', cursor === getFlatIndex(item) ? 'bg-[var(--card-hover)]' : 'hover:bg-[var(--card-bg)]']">
                  <div :class="['w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0', item.completed ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-muted)]']">
                    <svg v-if="item.completed" class="w-2 h-2 text-[var(--btn-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p :class="['text-[13px] truncate', item.completed ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text)]']">{{ item.title }}</p>
                    <p v-if="item.due_date" class="text-[11px] text-[var(--text-muted)]">{{ formatDate(item.due_date) }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="px-5 py-2.5 border-t border-[var(--card-border)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1"><kbd class="font-mono px-1 rounded border border-[var(--border-medium)]">↑</kbd><kbd class="font-mono px-1 rounded border border-[var(--border-medium)]">↓</kbd> {{ isEs ? 'navegar' : 'navigate' }}</span>
              <span class="flex items-center gap-1"><kbd class="font-mono px-1 rounded border border-[var(--border-medium)]">↵</kbd> {{ isEs ? 'abrir' : 'open' }}</span>
            </div>
            <span>{{ flatResults.length }} {{ isEs ? 'resultados' : 'results' }}</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useTasksStore } from '@/stores/tasks'
import { useI18n } from '@/composables/useI18n'

const notesStore = useNotesStore()
const tasksStore = useTasksStore()
const { t, isEs, lang } = useI18n()
const router = useRouter()

const open = ref(false)
const query = ref('')
const cursor = ref(0)
const inputRef = ref(null)

const hints = computed(() => [
  { key: '⌘ K', label: isEs.value ? 'Abrir búsqueda' : 'Open search' },
  { key: 'N', label: isEs.value ? 'Nueva tarea (próximamente)' : 'New task (soon)' },
  { key: '?', label: isEs.value ? 'Atajos' : 'Shortcuts' }
])

const grouped = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return { notes: [], tasks: [] }
  const notes = notesStore.notes.filter(n =>
    (n.title || '').toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q)
  ).slice(0, 5)
  const tasks = tasksStore.tasks.filter(t =>
    (t.title || '').toLowerCase().includes(q) ||
    (t.description || '').toLowerCase().includes(q)
  ).slice(0, 5)
  return { notes, tasks }
})

const flatResults = computed(() => [...grouped.value.notes, ...grouped.value.tasks])

function getFlatIndex(item) {
  return flatResults.value.findIndex(r => r.id === item.id)
}

watch(query, () => { cursor.value = 0 })

function openPalette() {
  open.value = true
  query.value = ''
  cursor.value = 0
  nextTick(() => inputRef.value?.focus())
}

function close() { open.value = false }

function onSelect(item) {
  close()
  if (!item) return
  if (item.content !== undefined) {
    router.push('/notes')
    setTimeout(() => notesStore.activeNote = item, 100)
  } else if (item.priority !== undefined || item.due_date !== undefined) {
    router.push('/tasks')
  }
}

function stripMd(s) { return (s || '').replace(/[#*`>-]/g, '').replace(/\n+/g, ' ').trim() }
function formatDate(d) { return d ? new Date(d).toLocaleDateString(lang.value === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }) : '' }

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value ? close() : openPalette()
  } else if (open.value && e.key === 'Escape') {
    close()
  }
}

function onOpenEvent() { openPalette() }

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('aevum:open-search', onOpenEvent)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('aevum:open-search', onOpenEvent)
})

defineExpose({ open: openPalette, close })
</script>

<style scoped>
.cmd-enter-active, .cmd-leave-active { transition: opacity 0.2s ease; }
.cmd-enter-active > .relative, .cmd-leave-active > .relative { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease; }
.cmd-enter-from, .cmd-leave-to { opacity: 0; }
.cmd-enter-from > .relative, .cmd-leave-to > .relative { transform: scale(0.96) translateY(-10px); opacity: 0; }
</style>
