<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="i in count" :key="i" class="card-3d p-6 space-y-3">
      <Skeleton width="70%" height="14px" />
      <Skeleton width="100%" height="10px" />
      <Skeleton width="90%" height="10px" />
      <Skeleton width="50%" height="10px" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue'
defineProps({ count: { type: Number, default: 6 } })
</script>
