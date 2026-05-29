<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: '20',
  },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="#e63946" />
    <path d="M13 7L7 13M7 7l6 6" stroke="white" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>
