<script setup lang="ts">
const model = defineModel<string>()

withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    error?: string | null
    inputClass?: string
    maxlength?: number
    after?: string
    rows?: number
    labelType?: 'horizontal' | 'vertical'
  }>(),
  {
    label: undefined,
    required: false,
    placeholder: '',
    disabled: false,
    helper: null,
    error: null,
    inputClass: '',
    maxlength: undefined,
    after: '',
    rows: 4,
    labelWidth: '200px',
    labelType: 'vertical',
  },
)
</script>

<template>
  <div
    class="mt-2 w-full"
    :class="
      labelType === 'vertical' ? 'flex flex-col gap-2' : 'flex md:flex-row flex-col gap-x-6 gap-2'
    "
  >
    <div
      v-if="label"
      :class="labelType === 'vertical' ? 'text-start' : 'md:text-end'"
      :style="labelType === 'horizontal' ? `width: ${labelWidth}` : ''"
    >
      <p
        class="text-[15px]"
        :class="labelType === 'vertical' ? 'text-[15px] font-medium' : 'text-nowrap pt-2'"
      >
        <span v-if="labelType === 'horizontal' && required" class="text-danger">*</span>
        {{ label }}
        <span v-if="labelType === 'vertical' && required" class="text-danger">*</span>
      </p>
    </div>
    <div class="flex-grow" :style="`max-width: ${inputWidth}`">
      <label
        v-if="after"
        class="absolute right-[25px] top-[12px] bg-transparent px-1 text-[15px] text-[#3B4854] max-sm:hidden"
      >
        {{ after }}
      </label>
      <textarea
        :placeholder="placeholder"
        v-model="model"
        :disabled="disabled"
        :rows="rows"
        class="w-full rounded-[6px] outline-none ring ring-grey-highlight p-2 placeholder:text-[#939393] focus:outline-none focus:ring-2 focus:ring-blue disabled:cursor-not-allowed"
        :class="{ '!ring-danger focus:outline-none focus:ring-danger': error }"
      >
      </textarea>
      <p class="text-[12px] text-danger">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
textarea {
  line-height: 1.5em;
  resize: vertical;
}
</style>
