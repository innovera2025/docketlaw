<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'default' | 'pill'
    variant?: 'primary' | 'danger' | 'warning' | 'blue' | 'success' | 'secondary' | 'black'
    label?: string
    disabled?: boolean
  }>(),
  {
    type: 'default',
    variant: 'primary',
    label: 'Button',
    disabled: false,
  },
)

const Emits = defineEmits(['click'])
</script>

<template>
  <button
    class="flex py-[15px] w-fit text-nowrap items-center gap-2 px-8 text-[16px] disabled:cursor-not-allowed font-semibold"
    :class="{
      'bg-primary text-white hover:bg-primary/80': variant === 'primary',
      'bg-danger text-white hover:bg-danger/80': variant === 'danger',
      'bg-warning text-[#3b4854] hover:bg-warning/80': variant === 'warning',
      'bg-blue text-white hover:bg-blue/80': variant === 'blue',
      'bg-success text-white hover:bg-success/80': variant === 'success',
      'bg-black text-white hover:bg-black/80': variant === 'black',
      'border-2 border-[#EDEDED] dark:border-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700':
        variant === 'secondary',
      'rounded-[6px]': type === 'default',
      'rounded-full': type === 'pill',
    }"
    @click="Emits('click')"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
