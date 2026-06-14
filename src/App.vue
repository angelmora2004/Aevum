<template>
  <div :class="['h-full relative overflow-hidden transition-colors duration-500', theme]">
    <div class="grain"/>
    <AppLayout />
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
import AppLayout from './components/layout/AppLayout.vue'
const { theme } = useTheme()
</script>
