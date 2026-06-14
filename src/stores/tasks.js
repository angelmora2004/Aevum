import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDeviceId } from '@/composables/useDeviceId'

export const useTasksStore = defineStore('tasks', () => {
  const { deviceId } = useDeviceId()
  const tasks = ref([])
  const loading = ref(false)

  const pendingTasks = computed(() => tasks.value.filter(t => !t.completed))
  const completedTasks = computed(() => tasks.value.filter(t => t.completed))
  const overdueTasks = computed(() =>
    tasks.value.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date())
  )
  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.value.filter(t => t.due_date && t.due_date.startsWith(today))
  })

  async function fetchTasks() {
    loading.value = true
    try {
      const res = await fetch(`/api/db?table=tasks&user_id=${deviceId}`)
      tasks.value = await res.json()
    } catch (e) {
      console.error('Error fetching tasks:', e)
    } finally {
      loading.value = false
    }
  }

  async function createTask(task) {
    try {
      const res = await fetch('/api/db?table=tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, user_id: deviceId })
      })
      const newTask = await res.json()
      tasks.value.unshift(newTask)
      return newTask
    } catch (e) {
      console.error('Error creating task:', e)
    }
  }

  async function updateTask(id, updates) {
    try {
      const res = await fetch('/api/db?table=tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, user_id: deviceId })
      })
      const updated = await res.json()
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) tasks.value[index] = updated
      return updated
    } catch (e) {
      console.error('Error updating task:', e)
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`/api/db?table=tasks&id=${id}&user_id=${deviceId}`, { method: 'DELETE' })
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (e) {
      console.error('Error deleting task:', e)
    }
  }

  async function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      return updateTask(id, { completed: !task.completed })
    }
  }

  return { tasks, loading, pendingTasks, completedTasks, overdueTasks, todayTasks, fetchTasks, createTask, updateTask, deleteTask, toggleTask }
})
