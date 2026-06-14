<template>
  <div :class="['skeleton', pulse ? 'pulse' : 'shimmer', rounded ? 'rounded-full' : 'rounded-lg']" :style="{ width, height }"></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '14px' },
  rounded: { type: Boolean, default: false },
  pulse: { type: Boolean, default: false }
})
</script>

<style scoped>
.skeleton {
  background: var(--card-hover);
  border: 1px solid var(--divider);
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, var(--shimmer) 50%, transparent 100%);
  animation: shimmer 1.6s ease-in-out infinite;
}
.pulse {
  animation: pulse-fade 1.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes pulse-fade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
