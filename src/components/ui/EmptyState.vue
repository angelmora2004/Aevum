<template>
  <div class="w-full py-20 flex flex-col items-center text-center">
    <div class="relative mb-6">
      <!-- Animated rings -->
      <div class="w-24 h-24 rounded-full border border-[var(--card-border)] flex items-center justify-center" style="animation: breathe 3s ease-in-out infinite">
        <div class="w-16 h-16 rounded-full border border-[var(--border-medium)] flex items-center justify-center" style="animation: breathe 3s ease-in-out infinite 0.5s">
          <div class="w-10 h-10 rounded-full bg-[var(--card-bg)] flex items-center justify-center">
            <div v-html="icon" class="w-5 h-5 text-[var(--text-muted)]"/>
          </div>
        </div>
      </div>
      <!-- Floating dots (symmetric) -->
      <div class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--card-hover)]" style="animation: float 4s ease-in-out infinite"/>
      <div class="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[var(--card-hover)]" style="animation: float 3s ease-in-out infinite 1s"/>
      <div class="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-[var(--card-bg)]" style="animation: float 3.5s ease-in-out infinite 0.5s"/>
      <div class="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--card-bg)]" style="animation: float 3.5s ease-in-out infinite 1.5s"/>
    </div>
    <h3 class="text-[15px] font-semibold text-[var(--text)] mb-2">{{ title }}</h3>
    <p class="text-[13px] text-[var(--text-dim)] max-w-[280px] leading-relaxed">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' }
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes breathe {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}
</style>
