<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'danger' | 'warning' | 'success'
    iconName: string | null
    size?: number | string
  }>(),
  {
    iconName: '',
    size: 20,
  },
)

const Emits = defineEmits(['click'])
</script>

<template>
  <button
    class="flex py-[15px] px-4 items-center hover:bg-neutral-100 dark:hover:bg-neutral-700 justify-center gap-2 rounded-[10px] border border-grey-highlight dark:border-neutral-500 text-[16px] font-semibold disabled:cursor-not-allowed disabled:!text-grey"
    :class="[
      { ' text-grey hover:text-[#3b4854]': !variant },
      { ' text-blue': variant === 'primary' },
      { ' text-danger': variant === 'danger' },
      { ' text-warning': variant === 'warning' },
      { ' text-success': variant === 'success' },
    ]"
    @click="Emits('click')"
  >
    <base-icon :name="iconName" :size="size" />
  </button>
</template>
