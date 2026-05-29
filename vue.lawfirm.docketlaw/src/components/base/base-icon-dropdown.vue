<script setup lang="ts">
import { ref, type Component } from 'vue'
import baseIconButton from '@/components/base/base-icon-button.vue'
import IconMore from '@/components/icons/IconMore.vue'
// import iconFolderDownload from '@/components/icons/IconFolderDownload.vue'
// import iconFolderUpload from '@/components/icons/IconFolderUpload.vue'

// Props
interface Props {
  modelValue?: boolean
  buttonClass?: string
  icon?: Component
  iconClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  buttonClass: '',
  icon: IconMore,
  iconClass: 'w-[20px] text-[#979898]',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'action': [action: string]
}>()

// State
const isOpen = ref(props.modelValue)
const buttonRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Methods
const toggleMenu = (event: MouseEvent) => {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
  
  if (isOpen.value && buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 8,
      left: rect.right - 256 // 256px is the dropdown width (w-64)
    }
  }
}

const closeMenu = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}

const handleAction = (action: string) => {
  emit('action', action)
  closeMenu()
}

// Watch for prop changes
import { watch } from 'vue'
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})
</script>

<template>
  <div class="relative">
    <!-- Excel Button -->
    <button 
      ref="buttonRef"
      :class="[
        'bg-[#fff] w-[36px] h-[36px] w-[36px] min-h-[36px] h-full flex items-center justify-center rounded-full hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-500 dark:hover:bg-neutral-700',
        buttonClass
      ]"
      @click="toggleMenu"
    >
      <base-icon :name="icon" :class="iconClass" />
    </button>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeMenu"
    ></div>

    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen" 
      class="fixed w-64 bg-white rounded-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-50"
      :style="{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }"
      @click.stop
    >
      <!-- Menu Items -->
      <div class="py-2">
        <slot :handleAction="handleAction" :closeMenu="closeMenu"></slot>
      </div>
    </div>
  </div>
</template>