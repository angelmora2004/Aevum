import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDeviceId } from '@/composables/useDeviceId'

export const useNotesStore = defineStore('notes', () => {
  const { deviceId } = useDeviceId()
  const notes = ref([])
  const loading = ref(false)
  const activeNote = ref(null)

  const pinnedNotes = computed(() => notes.value.filter(n => n.pinned))
  const regularNotes = computed(() => notes.value.filter(n => !n.pinned))
  const sortedNotes = computed(() => [...pinnedNotes.value, ...regularNotes.value])

  async function fetchNotes() {
    loading.value = true
    try {
      const res = await fetch(`/api/db?table=notes&user_id=${deviceId}`)
      notes.value = await res.json()
    } catch (e) {
      console.error('Error fetching notes:', e)
    } finally {
      loading.value = false
    }
  }

  async function createNote(note) {
    try {
      const res = await fetch('/api/db?table=notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, user_id: deviceId })
      })
      const newNote = await res.json()
      notes.value.unshift(newNote)
      return newNote
    } catch (e) {
      console.error('Error creating note:', e)
    }
  }

  async function updateNote(id, updates) {
    try {
      const res = await fetch('/api/db?table=notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, user_id: deviceId })
      })
      const updated = await res.json()
      const index = notes.value.findIndex(n => n.id === id)
      if (index !== -1) notes.value[index] = updated
      return updated
    } catch (e) {
      console.error('Error updating note:', e)
    }
  }

  async function deleteNote(id) {
    try {
      await fetch(`/api/db?table=notes&id=${id}&user_id=${deviceId}`, { method: 'DELETE' })
      notes.value = notes.value.filter(n => n.id !== id)
    } catch (e) {
      console.error('Error deleting note:', e)
    }
  }

  return { notes, loading, activeNote, pinnedNotes, regularNotes, sortedNotes, fetchNotes, createNote, updateNote, deleteNote }
})
