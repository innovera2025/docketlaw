<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
  }>(),
  {
    name: '',
  },
)

const iconComponent = computed(() => {
  return props.name ? defineAsyncComponent(() => import(`.././icons/Icon${props.name}.vue`)) : null
})
</script>

<template>
  <iconComponent v-if="name" :style="'width: ' + size + ';'" />
</template>
