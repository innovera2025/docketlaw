<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    subLabel?: string
    labelWidth?: string
    dataWidth?: string
    dataCheck?: string | number | boolean
    responsiveSize?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { labelWidth: '200px', dataCheck: 'test', responsiveSize: 'md' },
)
</script>

<template>
  <div
    class="flex flex-col mt-2 w-full gap-x-8"
    :class="{
      'sm:flex-row': responsiveSize === 'sm',
      'md:flex-row': responsiveSize === 'md',
      'lg:flex-row': responsiveSize === 'lg',
      'xl:flex-row': responsiveSize === 'xl',
    }"
  >
    <div v-if="label" class="" :style="`min-width: ${labelWidth}`">
      <label class="h-[16px] text-[16px] text-[#777F87]">
        <p>
          {{ label }}
        </p>
        <p v-if="subLabel" class="text-[#676A6F] text-[14px]">
          {{ subLabel }}
        </p>
      </label>
    </div>
    <div :style="`width: ${dataWidth}`" :class="{ 'text-gray': dataCheck }" class="flex-grow">
      <slot />
    </div>
  </div>
</template>
