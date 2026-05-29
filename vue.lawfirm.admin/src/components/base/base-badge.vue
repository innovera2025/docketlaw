<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?:
      | 'primary'
      | 'warning'
      | 'danger'
      | 'blue'
      | 'default'
      | 'success'
      | 'should_restock'
      | 'over_standard'
      | 'out_of_stock'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <div
    class="rounded-full px-4 py-2 w-fit font-medium text-white text-nowrap"
    :class="[
      { '!bg-grey-highlight !text-grey': variant === 'default' },
      { '!bg-primary': variant === 'primary' },
      { '!bg-warning !text-[#3b4854]': variant === 'warning' },
      { '!bg-danger': variant === 'danger' },
      { '!bg-success': variant === 'success' },
      { '!bg-blue': variant === 'blue' },
      { '!bg-[#F4C8EF] !text-[#9B21BF]': variant === 'should_restock' },
      { '!bg-[#BADFEA] !text-[#2094D1]': variant === 'over_standard' },
      { '!bg-[#EFCECB] !text-[#ED4234]': variant === 'out_of_stock' },
    ]"
  >
    <slot />
  </div>
</template>
