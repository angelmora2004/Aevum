<template>
  <div class="custom-datetime" ref="root">
    <button type="button" @click="open = !open" class="datetime-trigger">
      <svg class="datetime-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span class="datetime-value">{{ displayValue }}</span>
      <svg class="datetime-chevron" :class="{ 'rotate-180': open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <transition name="select">
      <div v-if="open" class="datetime-dropdown">
        <div class="datetime-row">
          <label class="datetime-label">{{ isEs ? 'Fecha' : 'Date' }}</label>
          <input type="date" :value="datePart" @input="onDateChange" class="datetime-input"/>
        </div>
        <div class="datetime-row">
          <label class="datetime-label">{{ isEs ? 'Hora' : 'Time' }}</label>
          <input type="time" :value="timePart" @input="onTimeChange" class="datetime-input"/>
        </div>
        <div class="datetime-actions">
          <button type="button" @click="clear" class="datetime-clear">{{ isEs ? 'Limpiar' : 'Clear' }}</button>
          <button type="button" @click="open = false" class="datetime-done">OK</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '../../composables/useI18n'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const { isEs } = useI18n()

const open = ref(false)
const root = ref(null)

const datePart = computed(() => props.modelValue ? props.modelValue.split('T')[0] : '')
const timePart = computed(() => props.modelValue && props.modelValue.includes('T') ? props.modelValue.split('T')[1] : '09:00')

const displayValue = computed(() => {
  if (!props.modelValue) return isEs.value ? 'Sin fecha' : 'No date'
  const d = new Date(props.modelValue)
  return d.toLocaleDateString(isEs.value ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString(isEs.value ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })
})

function onDateChange(e) {
  emit('update:modelValue', e.target.value + 'T' + timePart.value)
}

function onTimeChange(e) {
  const date = datePart.value || new Date().toISOString().split('T')[0]
  emit('update:modelValue', date + 'T' + e.target.value)
}

function clear() { emit('update:modelValue', ''); open.value = false }

function onClickOutside(e) { if (root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.custom-datetime { position: relative; width: 100%; }
.datetime-trigger {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
  padding: 12px 16px; color: var(--text); font-family: 'Geist', system-ui, sans-serif;
  font-size: 13px; cursor: pointer; outline: none; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.datetime-trigger:hover { border-color: var(--text-muted); }
.datetime-icon { width: 16px; height: 16px; color: var(--text-dim); flex-shrink: 0; }
.datetime-value { flex: 1; text-align: left; }
.datetime-chevron { width: 16px; height: 16px; color: var(--text-dim); flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.datetime-chevron.rotate-180 { transform: rotate(180deg); }
.datetime-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
  background: var(--glass-bg); backdrop-filter: blur(30px) saturate(1.2);
  border: 1px solid var(--glass-border); border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 var(--glass-highlight); padding: 12px; overflow: hidden;
}
.datetime-row { margin-bottom: 10px; }
.datetime-label { display: block; font-size: 10px; color: var(--text-dim); font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px; }
.datetime-input {
  width: 100%; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px;
  padding: 10px 14px; color: var(--text); font-family: 'Geist', system-ui, sans-serif; font-size: 13px;
  outline: none; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); color-scheme: dark;
}
.datetime-input:focus { border-color: var(--text-dim); box-shadow: 0 0 0 3px rgba(128,128,128,0.08); }
.datetime-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.datetime-clear {
  padding: 6px 14px; border-radius: 8px; border: none; background: transparent;
  color: var(--text-muted); font-family: 'Geist', system-ui, sans-serif; font-size: 12px;
  cursor: pointer; transition: all 0.2s ease;
}
.datetime-clear:hover { color: var(--text); background: var(--hover-bg); }
.datetime-done {
  padding: 6px 16px; border-radius: 8px; border: 1px solid var(--card-border);
  background: var(--card-bg); color: var(--text); font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;
}
.datetime-done:hover { background: var(--card-hover); }

.select-enter-active { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.select-leave-active { transition: all 0.15s ease; }
.select-enter-from, .select-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
