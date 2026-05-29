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
    class="flex py-2 px-2 items-center text-grey justify-center gap-2 rounded-[10px] text-[16px] font-semibold disabled:cursor-not-allowed disabled:!text-grey"
    :class="[
      { ' text-grey hover:text-grey hover:bg-neutral-100': !variant },
      { ' hover:text-blue hover:bg-blue/10': variant === 'primary' },
      { ' hover:text-danger hover:bg-danger/10': variant === 'danger' },
      { ' hover:text-warning hover:bg-warning/10': variant === 'warning' },
      { ' hover:text-success hover:bg-success/10': variant === 'success' },
    ]"
    @click="Emits('click')"
  >
    <base-icon :name="iconName" :size="size" />
  </button>
</template>
