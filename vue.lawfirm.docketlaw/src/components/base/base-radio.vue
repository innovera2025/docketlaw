<script setup lang="ts">
const model = defineModel<string | number | boolean>()

withDefaults(
  defineProps<{
    label?: string
    options: {
      value: boolean | number | string
      name: string
    }[]
    align?: 'v' | 'h'
    variant?: 'primary' | 'danger' | 'warning'
    required?: boolean
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    error?: string | null
  }>(),
  {
    label: undefined,
    align: 'h',
    variant: 'primary',
    required: false,
    disabled: false,
    helper: null,
    error: null,
  },
)

const emit = defineEmits(['change'])
</script>

<template>
  <div class="flex md:flex-row flex-col mt-2 w-full gap-x-6 gap-2">
    <div
      v-if="label"
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
      <div
        :class="[
          { 'flex flex-wrap gap-4': align === 'h' },
          { 'flex flex-col space-y-2': align === 'v' },
        ]"
      >
        <label
          v-for="option in options"
          :key="option.name"
          class="flex cursor-pointer items-center gap-2 rounded-full"
          :class="{ 'opacity-60 cursor-not-allowed': disabled }"
        >
          <div class="relative flex items-center justify-center">
            <input
              type="radio"
              :id="option.value.toString()"
              :value="option.value"
              :disabled="disabled"
              @change="emit('change')"
              v-model="model"
              class="before:content[''] before:bg-blue-gray-500 peer relative min-h-[30px] min-w-[30px] cursor-pointer appearance-none rounded-full border border-grey-highlightborder-grey-mid/50 transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-12 before:w-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:opacity-0 before:transition-opacity"
              :class="[
                { 'text-blue checked:border-b border-grey-highlightlue': variant === 'primary' },
                { 'text-danger checked:border-danger': variant === 'danger' },
                { 'text-warning checked:border-warning': variant === 'warning' },
                { 'cursor-not-allowed': disabled },
              ]"
            />
            <span
              class="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 opacity-0 transition-opacity peer-checked:opacity-100"
              :class="[
                { 'text-blue': variant === 'primary' },
                { 'text-danger': variant === 'danger' },
                { 'text-warning': variant === 'warning' },
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <g
                  id="Ellipse_1364"
                  data-name="Ellipse 1364"
                  fill="transparent"
                  stroke="CurrentColor"
                  stroke-width="3"
                >
                  <circle cx="15" cy="15" r="15" stroke="none" />
                  <circle cx="15" cy="15" r="13.5" fill="none" />
                </g>
                <circle
                  id="Ellipse_1366"
                  data-name="Ellipse 1366"
                  cx="7"
                  cy="7"
                  r="7"
                  transform="translate(8 8)"
                  fill="CurrentColor"
                />
              </svg>
            </span>
          </div>
          <span :class="{ 'text-grey-mid': disabled }">{{ option.name }}</span>
        </label>
      </div>
      <p v-if="helper" class="text-[14px] text-grey-mid mt-1">{{ helper }}</p>
      <p v-if="error" class="text-[12px] text-danger">{{ error }}</p>
    </div>
  </div>
</template>
