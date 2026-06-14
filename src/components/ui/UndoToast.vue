<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div v-if="visible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 px-5 py-3 rounded-2xl" style="background: var(--glass-bg); backdrop-filter: blur(40px) saturate(1.2); border: 1px solid var(--glass-border); box-shadow: 0 16px 48px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-highlight);">
        <span class="text-[12px] text-[var(--text-dim)]">{{ message }}</span>
        <button @click="handleUndo" class="text-[12px] font-medium text-[var(--text)] hover:text-[#ccc] transition-colors px-3 py-1 rounded-lg bg-[var(--card-hover)] hover:bg-[var(--pulse-bg)]">Deshacer</button>
        <div class="w-[1px] h-4 bg-[var(--card-hover)]"/>
        <button @click="close" class="text-[11px] text-[var(--text-dim)] hover:text-[var(--text-dim)] transition-colors">Cerrar</button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: { type: String, default: 'Acción deshecha' },
  duration: { type: Number, default: 5000 }
})

const emit = defineEmits(['undo'])
const visible = ref(false)
let timer = null

function show() {
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, props.duration)
}

function handleUndo() {
  emit('undo')
  visible.value = false
}

function close() {
  visible.value = false
  clearTimeout(timer)
}

defineExpose({ show, close })
</script>
