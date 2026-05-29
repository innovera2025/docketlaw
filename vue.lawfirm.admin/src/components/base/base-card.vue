<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    value?: string | number | null
    valueColor?: string
    unit?: string
  }>(),
  {
    title: '',
    value: null,
    valueColor: '#000000',
    unit: '',
  },
)
</script>

<template>
  <div class="space-y-3 border border-[#E7E8E9] p-4 leading-none rounded-[8px]">
    <p v-if="title" class="font-semibold">{{ title }}</p>
    <p v-if="value" class="text-[30px] font-semibold" :style="{ color: valueColor }">
      {{ value }} <span class="text-[20px] !text-[#3b4854] !font-normal">{{ unit }}</span>
    </p>
    <slot />
  </div>
</template>
