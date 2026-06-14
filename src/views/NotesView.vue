<template>
  <div class="min-h-full px-5 lg:px-10 py-12 lg:py-20">
    <div class="max-w-[1400px] mx-auto">
      <div class="mb-16" data-reveal>
        <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em]">Ideas</span>
        <div class="flex items-end justify-between mt-4">
          <h1 class="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[var(--text)]">{{ t('notes.title') }}</h1>
          <button @click="showTemplateModal = true" class="btn btn-white group">
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ t('notes.new') }}
          </button>
        </div>
        <p class="text-[14px] text-[var(--text-dim)] mt-3">{{ notesStore.notes.length }} {{ isEs ? 'notas en total' : 'notes total' }}</p>
      </div>

      <div class="flex items-center gap-2 mb-8" data-reveal>
        <button v-for="f in filters" :key="f.id" @click="activeFilter = f.id" :class="['px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-500', activeFilter === f.id ? 'bg-[var(--card-hover)] text-[var(--text)] border border-[var(--border-strong)]' : 'bg-transparent text-[var(--text-dim)] border border-transparent hover:bg-[var(--card-bg)]']">
          {{ f.label }}
        </button>
      </div>

      <div v-if="notesStore.loading"><NoteSkeleton :count="6" /></div>

      <EmptyState v-else-if="filteredNotes.length === 0" :title="t('notes.empty')" :description="t('notes.emptyDesc')" :icon="emptyIcon" data-reveal-scale>
        <button @click="showTemplateModal = true" class="btn btn-white mt-4">{{ t('notes.new') }}</button>
      </EmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(note, i) in filteredNotes" :key="note.id" class="card-3d p-6 cursor-pointer group" :data-reveal-scale="''" :style="{ transitionDelay: (i * 0.05) + 's' }" @click="openEditModal(note)">
          <div class="flex items-center gap-2 mb-3">
            <div v-if="note.pinned" class="w-1.5 h-1.5 rounded-full bg-[var(--btn-bg)]"/>
            <p class="text-[14px] font-semibold text-[var(--text)] truncate">{{ note.title }}</p>
          </div>
          <p class="text-[12px] text-[var(--text-muted)] line-clamp-3 leading-relaxed whitespace-pre-wrap">{{ note.content || (isEs ? 'Sin contenido' : 'No content') }}</p>
          <div v-if="note.tags && note.tags.length" class="flex flex-wrap gap-1.5 mt-3">
            <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--card-bg)] text-[var(--text-dim)]">{{ tag }}</span>
          </div>
          <div class="mt-4 pt-3 border-t border-[var(--divider)] flex items-center justify-between">
            <p class="text-[10px] text-[var(--text-faint)] font-mono">{{ formatDate(note.updated_at || note.created_at) }}</p>
            <button @click.stop="deleteWithUndo(note)" class="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--card-hover)] text-[var(--text-faint)] hover:text-[var(--text)] transition-all duration-500">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Template Modal -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="showTemplateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showTemplateModal = false">
            <div class="fixed inset-0 backdrop-blur-[40px]" style="background: var(--backdrop);" @click="showTemplateModal = false"/>
            <transition name="slide-up">
              <div v-if="showTemplateModal" class="relative rounded-[24px] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 32px 100px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
                <div class="px-6 py-5 border-b border-[var(--divider)]">
                  <h3 class="text-[14px] font-semibold text-[var(--text)]">{{ isEs ? 'Elegir plantilla' : 'Choose template' }}</h3>
                  <p class="text-[11px] text-[var(--text-dim)] mt-1">{{ isEs ? 'O empieza desde cero' : 'Or start from scratch' }}</p>
                </div>
                <div class="flex-1 overflow-y-auto p-3">
                  <button v-for="tpl in templates" :key="tpl.id" @click="createFromTemplate(tpl)" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--card-bg)] transition-all duration-300 text-left group">
                    <div class="w-10 h-10 rounded-xl bg-[var(--card-hover)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--card-hover)] transition-all">
                      <div v-html="tpl.icon" class="w-5 h-5 text-[var(--text-dim)]"/>
                    </div>
                    <div>
                      <p class="text-[13px] font-medium text-[var(--text)]">{{ tpl.name }}</p>
                      <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ tpl.content ? (isEs ? 'Con estructura' : 'With structure') : (isEs ? 'Vacía' : 'Empty') }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </Teleport>

      <!-- Edit Modal -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
            <div class="fixed inset-0 backdrop-blur-[40px]" style="background: var(--backdrop);" @click="showModal = false"/>
            <transition name="slide-up">
              <div v-if="showModal" class="relative rounded-[24px] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 32px 100px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-highlight);">
                <div class="flex items-center justify-between px-6 py-5 border-b border-[var(--divider)]">
                  <h3 class="text-[14px] font-semibold text-[var(--text)]">{{ editingNote ? t('common.edit') : t('notes.new') }} {{ isEs ? 'Nota' : 'Note' }}</h3>
                  <button @click="showModal = false" class="btn-icon !w-8 !h-8"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                <div class="flex-1 overflow-y-auto p-6 space-y-4">
                  <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Título' : 'Title' }}</label><input v-model="form.title" :placeholder="isEs ? 'Título...' : 'Title...'"/></div>
                  <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Contenido' : 'Content' }}</label><textarea v-model="form.content" :placeholder="isEs ? 'Escribe...' : 'Write...'" rows="12" class="resize-none font-mono text-[12px] leading-relaxed"/></div>
                  <div><label class="text-[10px] text-[var(--text-dim)] font-medium mb-1.5 block uppercase tracking-[0.15em]">{{ isEs ? 'Etiquetas' : 'Tags' }}</label><input v-model="tagsInput" :placeholder="isEs ? 'trabajo, ideas...' : 'work, ideas...'"/></div>
                  <div class="flex items-center gap-3">
                    <label class="text-[12px] text-[var(--text-dim)]">{{ isEs ? 'Fijar' : 'Pin' }}</label>
                    <button @click="form.pinned = !form.pinned" :class="['w-10 h-[22px] rounded-full relative transition-all duration-500', form.pinned ? 'bg-[var(--btn-bg)]' : 'bg-[var(--card-hover)]']">
                      <div :class="['w-4 h-4 rounded-full absolute top-[3px] transition-all duration-500', form.pinned ? 'left-[22px] bg-[#030303]' : 'left-[3px] bg-[var(--toggle-knob-off)]']"/>
                    </button>
                  </div>
                </div>
                <div class="px-6 py-4 border-t border-[var(--divider)] flex justify-end gap-2">
                  <button @click="showModal = false" class="btn btn-ghost-nav">{{ t('common.cancel') }}</button>
                  <button @click="saveNote" class="btn btn-white">{{ editingNote ? t('common.save') : t('common.create') }}</button>
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
import { useNotesStore } from '../stores/notes'
import { useAppStore } from '../stores/app'
import { useScrollReveal, useCardTilt } from '../composables/useAnimations'
import { useI18n } from '../composables/useI18n'
import { noteTemplates } from '../data/templates'
import EmptyState from '../components/ui/EmptyState.vue'
import NoteSkeleton from '../components/ui/NoteSkeleton.vue'
import { inject, ref, computed } from 'vue'

const notesStore = useNotesStore()
const appStore = useAppStore()
const { t, isEs, lang } = useI18n()
const showUndo = inject('showUndo')
useScrollReveal()
useCardTilt()

const activeFilter = ref('all')
const showModal = ref(false)
const showTemplateModal = ref(false)
const editingNote = ref(null)
const tagsInput = ref('')
const form = ref({ title: '', content: '', color: 'default', tags: [], pinned: false, template_id: null })
const templates = computed(() => noteTemplates.map(tpl => ({ ...tpl, name: t('notes.template.' + tpl.id) || tpl.name })))
const filters = computed(() => [
  { id: 'all', label: isEs.value ? 'Todas' : 'All' },
  { id: 'pinned', label: t('notes.pin') + (isEs.value ? 's' : 'ned') },
  { id: 'recent', label: isEs.value ? 'Recientes' : 'Recent' }
])
const emptyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'

const filteredNotes = computed(() => {
  if (activeFilter.value === 'pinned') return notesStore.notes.filter(n => n.pinned)
  if (activeFilter.value === 'recent') return notesStore.notes.slice(0, 5)
  return notesStore.sortedNotes
})

function createFromTemplate(template) {
  showTemplateModal.value = false
  editingNote.value = null
  const isBlank = template.id === 'blank'
  form.value = { title: isBlank ? '' : template.name, content: template.content, color: 'default', tags: [], pinned: false, template_id: template.id }
  tagsInput.value = ''
  showModal.value = true
}

function openEditModal(note) {
  editingNote.value = note
  form.value = { title: note.title, content: note.content, color: note.color || 'default', tags: note.tags || [], pinned: note.pinned || false, template_id: note.template_id }
  tagsInput.value = (note.tags || []).join(', ')
  showModal.value = true
}

async function saveNote() {
  const data = { ...form.value, tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) }
  if (editingNote.value) {
    await notesStore.updateNote(editingNote.value.id, data)
    appStore.addNotification({ type: 'success', title: t('common.save'), message: isEs.value ? 'Nota actualizada' : 'Note updated' })
  } else {
    await notesStore.createNote(data)
    appStore.addNotification({ type: 'success', title: t('common.create'), message: isEs.value ? 'Nueva nota lista' : 'New note ready' })
  }
  showModal.value = false
}

async function deleteWithUndo(note) {
  const noteData = { ...note }
  await notesStore.deleteNote(note.id)
  showUndo(isEs.value ? 'Nota eliminada' : 'Note deleted', async () => {
    await notesStore.createNote(noteData)
  })
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString(lang.value === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '' }
</script>
