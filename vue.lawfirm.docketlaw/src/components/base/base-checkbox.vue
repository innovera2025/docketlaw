<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const model = defineModel<number>()

withDefaults(
  defineProps<{
    id?: string
    label?: string
    required?: boolean
    helper?: string | null
    error?: string | null
    disabled?: boolean
    placeholder?: string
    labelWidth?: string
    inputWidth?: string
  }>(),
  {
    label: undefined,
    required: false,
    helper: null,
    error: null,
    disabled: false,
  },
)

const emit = defineEmits(['change'])

const preModel = ref(model.value === 1 ? true : false)

watch(preModel, () => {
  model.value = preModel.value ? 1 : 0
  emit('change')
})

watch(model, (val) => {
  const next = !!+val!
  if (preModel.value !== next) preModel.value = next
})

onMounted(() => {
  if (model.value === undefined || model.value === null) return
  preModel.value = +model.value ? true : false
})
</script>

<template>
  <div class="flex md:flex-row flex-col mt-2 w-full gap-x-6 gap-2">
    <div
      v-if="label && labelWidth"
      class="md:text-end"
      :style="labelWidth ? `min-width: ${labelWidth}` : ''"
      :class="!labelWidth ? 'w-full' : ''"
    >
      <label class="h-[16px] text-nowrap px-1 text-[15px]">
        <span v-if="required" class="text-danger">*</span>
        {{ label }}
      </label>
    </div>
    <div
      class="relative"
      :style="inputWidth ? `min-width: ${inputWidth}` : ''"
      :class="!inputWidth ? 'w-full' : ''"
    >
      <div class="flex items-center gap-2 flex-nowrap">
        <label
          class="relative flex cursor-pointer items-center"
          :class="{ 'opacity-60 cursor-not-allowed': disabled }"
          :for="id || (label && !labelWidth ? label : 'checkbox')"
        >
          <input
            v-model="preModel"
            type="checkbox"
            :disabled="disabled"
            :id="id || (label && !labelWidth ? label : 'checkbox')"
            class="peer relative min-h-[24px] min-w-[24px] cursor-pointer appearance-none rounded-md border bg-white border-[#CCCCCC] transition-all checked:border-b checked:border-blue checked:bg-blue checked:before:bg-blue"
            :class="{ 'cursor-not-allowed': disabled }"
          />
          <span
            class="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-[#EDEDED] opacity-100 transition-opacity peer-checked:opacity-100 peer-checked:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </label>
        <label
          v-if="label && !labelWidth"
          :for="id || (label ? label : 'checkbox')"
          class="cursor-pointer"
          :class="{ 'text-grey-mid': disabled }"
        >
          {{ label }}
        </label>
      </div>
      <p v-if="helper" class="text-[14px] text-grey-mid mt-1">{{ helper }}</p>
      <p v-if="error" class="text-[12px] text-danger">{{ error }}</p>
    </div>
  </div>
</template>
