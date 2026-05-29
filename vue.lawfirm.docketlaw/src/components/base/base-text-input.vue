<script setup lang="ts">
import { ref, computed } from 'vue'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeSlash from '@/components/icons/IconEyeSlash.vue'

const model = defineModel<string | number>()

const props = withDefaults(
  defineProps<{
    type?: 'text' | 'password' | 'number' | 'color' | 'date' | 'time' | 'email'
    label?: string
    required?: boolean
    labelColor?: string
    placeholder?: string
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    error?: string | null
    inputClass?: string
    maxlength?: number
    after?: string
    max?: number | string
    min?: number | string
    step?: number
    labelType?: 'horizontal' | 'vertical'
  }>(),
  {
    type: 'text',
    label: undefined,
    required: false,
    placeholder: '',
    disabled: false,
    helper: null,
    error: null,
    inputClass: '',
    maxlength: undefined,
    after: '',
    step: 1,
    labelWidth: '200px',
    labelType: 'vertical',
  },
)

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})
</script>

<template>
  <div
    class="flex mt-2 w-full gap-x-6 gap-2"
    :class="{
      'md:flex-row md:items-center flex-col': labelType === 'horizontal',
      'flex-col': labelType === 'vertical',
    }"
  >
    <div
      v-if="label"
      :class="{
        'md:text-end': labelType === 'horizontal',
        'text-start': labelType === 'vertical',
      }"
      :style="labelType === 'horizontal' ? `width: ${labelWidth}` : ''"
    >
      <label class="h-[16px] text-nowrap text-[15px]">
        <span v-if="labelType === 'horizontal' && required" class="text-danger">*</span>
        {{ label }}
        <span v-if="labelType === 'vertical' && required" class="text-danger">*</span>
      </label>
    </div>
    <div class="flex-grow relative" :style="`max-width: ${inputWidth}`">
      <label
        v-if="after"
        class="absolute right-[10px] top-[10px] bg-transparent px-1 text-[15px] text-[#3b4854] max-sm:hidden"
      >
        {{ after }}
      </label>
      <input
        :type="inputType"
        :placeholder="placeholder"
        v-model="model"
        :max="max"
        :min="min"
        :step="step"
        :disabled="disabled"
        class="w-full rounded-[6px] disabled:bg-neutral-100 outline-none ring ring-grey-highlight px-[10px] py-[5px] placeholder:py-4 placeholder:text-grey-mid focus:outline-none focus:ring-2 focus:ring-blue disabled:cursor-not-allowed"
        :class="{
          '!ring-danger focus:outline-none focus:ring-danger': error,
          'pr-[45px]': type === 'password',
          [inputClass]: true,
        }"
      />
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
      >
        <IconEye class="w-5 h-5" />
      </button>
    </div>
    <p v-if="error" class="text-[12px] text-danger mt-[-5px]">{{ error }}</p>
    <p v-else-if="helper" class="text-[12px] text-[#AEB3B9] mt-[-5px]">{{ helper }}</p>
  </div>
</template>

<style scoped>
input {
  line-height: 2em;
}
</style>
