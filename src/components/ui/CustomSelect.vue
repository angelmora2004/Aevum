<template>
  <div class="custom-select" ref="root">
    <button
      type="button"
      @click="open = !open"
      :class="['select-trigger', open && 'is-open']"
    >
      <span class="select-value">{{ selectedLabel }}</span>
      <svg class="select-chevron" :class="{ 'rotate-180': open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <transition name="select">
      <div v-if="open" class="select-dropdown">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          @click="select(opt.value)"
          :class="['select-option', modelValue === opt.value && 'is-selected']"
        >
          <span>{{ opt.label }}</span>
          <svg v-if="modelValue === opt.value" class="select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : props.modelValue
})

function select(val) {
  emit('update:modelValue', val)
  open.value = false
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.custom-select { position: relative; width: 100%; }
.select-trigger {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
  padding: 12px 16px; color: var(--text); font-family: 'Geist', system-ui, sans-serif;
  font-size: 13px; cursor: pointer; outline: none; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.select-trigger:hover { border-color: var(--text-muted); }
.select-trigger.is-open { border-color: var(--text-dim); }
.select-value { flex: 1; text-align: left; }
.select-chevron {
  width: 16px; height: 16px; color: var(--text-dim); flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
.select-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
  background: var(--glass-bg); backdrop-filter: blur(30px) saturate(1.2);
  border: 1px solid var(--glass-border); border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 var(--glass-highlight); padding: 4px; overflow: hidden;
}
.select-option {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  padding: 10px 14px; border-radius: 8px; color: var(--text-dim);
  font-family: 'Geist', system-ui, sans-serif; font-size: 13px;
  cursor: pointer; border: none; background: none; outline: none;
  transition: all 0.2s ease;
}
.select-option:hover { background: var(--hover-bg); color: var(--text); }
.select-option.is-selected { background: var(--selection-bg); color: var(--text); }
.select-check { width: 14px; height: 14px; color: var(--accent); flex-shrink: 0; }

.select-enter-active { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.select-leave-active { transition: all 0.15s ease; }
.select-enter-from, .select-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
