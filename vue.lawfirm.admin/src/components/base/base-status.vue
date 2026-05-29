<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'warning' | 'danger' | 'blue' | 'default' | 'success'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <div class="col-span-2 flex items-center gap-2 text-nowrap font-medium">
    <div
      class="h-[12px] w-[12px] rounded-[4px] ring-[2px]"
      :class="[
        { 'ring-grey/30 bg-grey': variant === 'default' },
        { 'ring-primary/30 bg-primary': variant === 'primary' },
        { 'ring-warning/30 bg-warning': variant === 'warning' },
        { 'ring-danger/30 bg-danger': variant === 'danger' },
        { 'ring-success/30 bg-success': variant === 'success' },
        { 'ring-blue/30 bg-blue': variant === 'blue' },
      ]"
    />
    <slot />
  </div>
</template>
