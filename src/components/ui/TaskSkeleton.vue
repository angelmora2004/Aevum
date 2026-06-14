<template>
  <div class="space-y-2">
    <div v-for="i in count" :key="i" class="card-3d p-5">
      <div class="flex items-center gap-4">
        <Skeleton width="24px" height="24px" rounded />
        <div class="flex-1 space-y-2">
          <Skeleton width="60%" height="14px" />
          <Skeleton width="40%" height="10px" />
        </div>
        <Skeleton width="60px" height="22px" rounded />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue'
defineProps({ count: { type: Number, default: 4 } })
</script>
