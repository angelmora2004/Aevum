<template>
  <Teleport to="body">
    <transition name="slide-chat">
      <div v-if="appStore.chatOpen" class="fixed right-0 top-0 h-full z-50 w-full sm:w-[400px]" style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
        <div class="h-full flex flex-col" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border-left: 1px solid var(--card-border);">
          <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--divider)]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--card-hover)] border border-[var(--border-medium)] flex items-center justify-center">
                <svg class="w-4 h-4 text-[var(--text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <div>
                <h3 class="text-[13px] font-semibold text-[var(--text)]">Aevum AI</h3>
                <p class="text-[10px] text-[var(--text-dim)]">{{ isEs ? 'En línea' : 'Online' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button v-if="messages.length > 0" @click="messages = []" class="btn-icon !w-8 !h-8" :title="isEs ? 'Nueva conversación' : 'New conversation'"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg></button>
              <button @click="appStore.toggleChat" class="btn-icon !w-8 !h-8"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          </div>

          <div ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <!-- Empty state + proactive suggestions -->
            <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center">
              <div class="w-14 h-14 rounded-2xl bg-[var(--card-hover)] border border-[var(--card-border)] flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
              </div>
              <h4 class="text-[14px] font-semibold text-[var(--text)] mb-1">Aevum AI</h4>
              <p class="text-[12px] text-[var(--text-dim)] max-w-[240px] leading-relaxed">{{ isEs ? 'Tu asistente de productividad.' : 'Your productivity assistant.' }}</p>

              <!-- Proactive suggestions -->
              <div v-if="proactiveSuggestions.length > 0" class="mt-6 space-y-2 w-full max-w-[280px]">
                <p class="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">{{ isEs ? 'Sugerencias' : 'Suggestions' }}</p>
                <button v-for="s in proactiveSuggestions" :key="s" @click="sendMessage(s)" class="w-full text-left px-4 py-2.5 rounded-xl text-[12px] bg-[var(--card-bg)] border border-[var(--divider)] hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)] transition-all duration-500 text-[var(--text-dim)] hover:text-[var(--text)]">{{ s }}</button>
              </div>

              <!-- Default suggestions -->
              <div class="mt-4 space-y-2 w-full max-w-[280px]">
                <button v-for="s in defaultSuggestions" :key="s" @click="sendMessage(s)" class="w-full text-left px-4 py-2.5 rounded-xl text-[12px] bg-[var(--card-bg)] border border-[var(--divider)] hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)] transition-all duration-500 text-[var(--text-dim)] hover:text-[var(--text)]">{{ s }}</button>
              </div>
            </div>

            <div v-for="(msg, i) in messages" :key="i" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed break-words', msg.role === 'user' ? 'bg-[var(--card-hover)] text-[var(--text)] border border-[var(--border-medium)] rounded-br-md' : 'bg-[var(--card-bg)] text-[var(--text)] border border-[var(--divider)] rounded-bl-md']">
                <div v-html="formatMessage(msg.content)"/>
              </div>
            </div>

            <div v-if="loading" class="flex justify-start">
              <div class="bg-[var(--card-bg)] border border-[var(--divider)] rounded-2xl rounded-bl-md px-4 py-3">
                <div class="flex gap-1.5">
                  <span class="w-1.5 h-1.5 bg-[var(--toggle-knob-off)] rounded-full" style="animation: breathe 1.4s ease-in-out infinite"/>
                  <span class="w-1.5 h-1.5 bg-[var(--toggle-knob-off)] rounded-full" style="animation: breathe 1.4s ease-in-out 0.2s infinite"/>
                  <span class="w-1.5 h-1.5 bg-[var(--toggle-knob-off)] rounded-full" style="animation: breathe 1.4s ease-in-out 0.4s infinite"/>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 py-3 border-t border-[var(--divider)]">
            <div class="flex items-end gap-2">
              <textarea v-model="input" @keydown.enter.exact.prevent="sendMessage()" :placeholder="t('chat.placeholder')" rows="1" class="flex-1 resize-none !rounded-xl !py-2.5 !text-[13px] max-h-32"/>
              <button @click="sendMessage()" :disabled="!input.trim() || loading" class="btn-icon !rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]" :title="t('chat.send')">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import { useAppStore } from '@/stores/app'
import { useNotesStore } from '@/stores/notes'
import { useTasksStore } from '@/stores/tasks'
import { useI18n } from '@/composables/useI18n'

const appStore = useAppStore()
const notesStore = useNotesStore()
const tasksStore = useTasksStore()
const { t, isEs, lang } = useI18n()

const CHAT_KEY = 'aevum-chat-messages'
const messages = ref([])
const input = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

onMounted(() => {
  try {
    const saved = localStorage.getItem(CHAT_KEY)
    if (saved) messages.value = JSON.parse(saved)
  } catch {}
})

watch(messages, (val) => {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(val.slice(-100))) } catch {}
}, { deep: true })

const defaultSuggestions = computed(() => isEs.value
  ? ['Crear nota', '¿Qué tareas tengo?', 'Tips de productividad', 'Crear tarea urgente']
  : ['Create note', 'What tasks do I have?', 'Productivity tips', 'Create urgent task'])

const proactiveSuggestions = computed(() => {
  const suggestions = []
  const overdue = tasksStore.overdueTasks.length
  const pending = tasksStore.pendingTasks.length
  const today = tasksStore.todayTasks.length

  if (overdue > 0) suggestions.push(isEs.value ? `Tengo ${overdue} tarea(s) vencida(s), ayúdame a organizarlas` : `I have ${overdue} overdue task(s), help me organize them`)
  if (today > 3) suggestions.push(isEs.value ? `Tengo ${today} tareas hoy, ¿cómo las organizo mejor?` : `I have ${today} tasks today, how do I organize them better?`)
  if (pending > 10) suggestions.push(isEs.value ? `Tengo ${pending} tareas pendientes, prioriza las más importantes` : `I have ${pending} pending tasks, prioritize the most important`)
  if (notesStore.notes.length === 0) suggestions.push(isEs.value ? 'Necesito crear mi primera nota' : 'I need to create my first note')
  if (tasksStore.completedTasks.length > 5) suggestions.push(isEs.value ? 'Dame un resumen de mi productividad' : 'Give me a summary of my productivity')

  return suggestions.slice(0, 3)
})

function formatMessage(text) {
  // Step 1: escape all HTML
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Step 2: apply safe markdown → HTML
  const withMarkdown = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-[var(--card-hover)] px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/\n/g, '<br>')
  // Step 3: sanitize with DOMPurify — strip anything we didn't explicitly allow
  return DOMPurify.sanitize(withMarkdown, {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'br'],
    ALLOWED_ATTR: ['class']
  })
}

async function sendMessage(text) {
  const msg = text || input.value.trim()
  if (!msg || loading.value) return
  messages.value.push({ role: 'user', content: msg })
  input.value = ''
  loading.value = true
  await nextTick()
  scrollToBottom()
  try {
    const tasksList = tasksStore.tasks.map(t => `${t.id}:${t.title}${t.completed ? '(done)' : ''}${t.priority !== 'medium' ? `[${t.priority}]` : ''}${t.due_date ? ` due:${t.due_date.split('T')[0]}` : ''}`).join(', ')
    const notesList = notesStore.notes.map(n => `${n.id}:${n.title}${n.pinned ? '(pinned)' : ''}`).join(', ')
    const ctx = `TASKS[${tasksStore.tasks.length}]: ${tasksList || 'ninguna'}\nNOTES[${notesStore.notes.length}]: ${notesList || 'ninguna'}\nPendientes: ${tasksStore.pendingTasks.length}, Vencidas: ${tasksStore.overdueTasks.length}, Hoy: ${tasksStore.todayTasks.length}, Completadas: ${tasksStore.completedTasks.length}`
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages.value.map(m => ({ role: m.role, content: m.content })), context: ctx, language: lang.value }) })
    const data = await res.json()
    if (data.reply) {
      const actions = parseActions(data.reply)
      if (actions.length > 0) {
        for (const action of actions) {
          await executeAction(action)
        }
      } else {
        const cleanReply = cleanMessage(data.reply)
        if (cleanReply) {
          messages.value.push({ role: 'assistant', content: cleanReply })
        }
      }
    }
  } catch { messages.value.push({ role: 'assistant', content: isEs.value ? 'Error de conexión.' : 'Connection error.' }) }
  finally { loading.value = false; await nextTick(); scrollToBottom() }
}

function parseActions(text) {
  const regex = /<!--ACTION:(\w+):(\{.*?\})-->/g
  const actions = []
  let match
  while ((match = regex.exec(text)) !== null) {
    try {
      actions.push({ type: match[1], data: JSON.parse(match[2]) })
    } catch {}
  }
  return actions
}

function cleanMessage(text) {
  return text
    .replace(/<!--ACTION:[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\{[^}]*"title"[^}]*\}/g, '')
    .trim()
}

// Sanitize strings from AI action data
function sanitizeActionString(str, maxLen = 200) {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>]/g, '').trim().substring(0, maxLen)
}

const VALID_PRIORITIES = ['low', 'medium', 'high']
const VALID_CATEGORIES = ['work', 'personal', 'health', 'learning', 'admin', 'shopping', 'general']

function sanitizeActionData(data, type) {
  const clean = { ...data }
  if (clean.title !== undefined) clean.title = sanitizeActionString(clean.title, 200)
  if (clean.description !== undefined) clean.description = sanitizeActionString(clean.description, 1000)
  if (clean.content !== undefined) clean.content = sanitizeActionString(clean.content, 5000)
  if (clean.priority && !VALID_PRIORITIES.includes(clean.priority)) clean.priority = 'medium'
  if (clean.category && !VALID_CATEGORIES.includes(clean.category)) clean.category = 'general'
  if (clean.id && typeof clean.id !== 'string') clean.id = ''
  // Strip any fields not expected for this action type
  const allowed = {
    CREATE_TASK: ['title', 'description', 'priority', 'category', 'due_date', 'color'],
    CREATE_NOTE: ['title', 'content', 'tags', 'color'],
    UPDATE_TASK: ['id', 'title', 'description', 'priority', 'category', 'due_date', 'completed', 'color'],
    UPDATE_NOTE: ['id', 'title', 'content', 'pinned', 'color'],
    DELETE_TASK: ['id'],
    DELETE_NOTE: ['id']
  }
  const keep = allowed[type] || []
  const filtered = {}
  for (const key of keep) {
    if (clean[key] !== undefined) filtered[key] = clean[key]
  }
  return filtered
}

async function executeAction(action) {
  try {
    const safeData = sanitizeActionData(action.data, action.type)
    switch (action.type) {
      case 'CREATE_TASK': {
        const title = (safeData.title || '').trim()
        if (title.length < 2) {
          messages.value.push({ role: 'assistant', content: isEs.value ? 'Necesito un titulo para la tarea. Dime que quieres que contenga.' : 'I need a task title. Tell me what it should contain.' })
          return
        }
        await tasksStore.createTask(safeData)
        messages.value.push({ role: 'assistant', content: isEs.value ? `Tarea creada: "${title}"` : `Task created: "${title}"` })
        break
      }
      case 'CREATE_NOTE': {
        const title = (safeData.title || '').trim()
        if (title.length < 2) {
          messages.value.push({ role: 'assistant', content: isEs.value ? 'Necesito un titulo para la nota. Dime que quieres que contenga.' : 'I need a note title. Tell me what it should contain.' })
          return
        }
        await notesStore.createNote(safeData)
        messages.value.push({ role: 'assistant', content: isEs.value ? `Nota creada: "${title}"` : `Note created: "${title}"` })
        break
      }
      case 'UPDATE_TASK': {
        const { id, ...updates } = safeData
        if (!id) return
        const task = tasksStore.tasks.find(t => t.id === id)
        const label = task ? task.title : id
        await tasksStore.updateTask(id, updates)
        if (updates.completed === true) {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Tarea completada: "${label}"` : `Task completed: "${label}"` })
        } else if (updates.completed === false) {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Tarea reabierta: "${label}"` : `Task reopened: "${label}"` })
        } else {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Tarea actualizada: "${label}"` : `Task updated: "${label}"` })
        }
        break
      }
      case 'UPDATE_NOTE': {
        const { id, ...updates } = safeData
        if (!id) return
        const note = notesStore.notes.find(n => n.id === id)
        const label = note ? note.title : id
        await notesStore.updateNote(id, updates)
        if (updates.pinned === true) {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Nota fijada: "${label}"` : `Note pinned: "${label}"` })
        } else if (updates.pinned === false) {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Nota desfijada: "${label}"` : `Note unpinned: "${label}"` })
        } else {
          messages.value.push({ role: 'assistant', content: isEs.value ? `Nota actualizada: "${label}"` : `Note updated: "${label}"` })
        }
        break
      }
      case 'DELETE_TASK': {
        const { id } = safeData
        if (!id) return
        const task = tasksStore.tasks.find(t => t.id === id)
        const label = task ? task.title : id
        await tasksStore.deleteTask(id)
        messages.value.push({ role: 'assistant', content: isEs.value ? `Tarea eliminada: "${label}"` : `Task deleted: "${label}"` })
        break
      }
      case 'DELETE_NOTE': {
        const { id } = safeData
        if (!id) return
        const note = notesStore.notes.find(n => n.id === id)
        const label = note ? note.title : id
        await notesStore.deleteNote(id)
        messages.value.push({ role: 'assistant', content: isEs.value ? `Nota eliminada: "${label}"` : `Note deleted: "${label}"` })
        break
      }
    }
  } catch {
    messages.value.push({ role: 'assistant', content: isEs.value ? 'Error al ejecutar la acción' : 'Error executing action' })
  }
}

function scrollToBottom() { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }
watch(() => appStore.chatOpen, (v) => { if (v) nextTick(scrollToBottom) })
</script>

<style scoped>
.slide-chat-enter-active, .slide-chat-leave-active { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-chat-enter-from, .slide-chat-leave-to { transform: translateX(100%); }
</style>
