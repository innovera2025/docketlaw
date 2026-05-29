<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'

const model = defineModel<string | number>()

const props = withDefaults(
  defineProps<{
    label?: string
    options: {
      name: string
      value: string | number
    }[]
    placeholder?: string
    error?: string | null
    required?: boolean
    filter?: boolean
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    labelType?: 'horizontal' | 'vertical'
  }>(),
  {
    filter: true,
    placeholder: 'All',
    disabled: false,
    helper: null,
    labelWidth: '200px',
    labelType: 'horizontal',
  },
)

const emit = defineEmits(['change'])

const displayName = ref<string | number | undefined>(props.placeholder)

watch(model, (newValue) => {
  displayName.value = newValue
    ? props.options.find((option) => option.value == newValue)?.name
    : props.placeholder
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
      <label class="h-[16px] text-nowrap px-1 text-[15px]">
        <span v-if="labelType === 'horizontal' && required" class="text-danger">*</span>
        {{ label }}
        <span v-if="labelType === 'vertical' && required" class="text-danger">*</span>
      </label>
    </div>
    <div class="flex-grow" :style="`max-width: ${inputWidth}`">
      <Dropdown
        v-model="model"
        :options="options"
        :value="options"
        option-value="value"
        :filter="filter"
        :disabled="disabled"
        optionLabel="name"
        :placeholder="props.placeholder"
        class="relative h-[47.5px] w-full rounded-[10px] border border-grey-highlight"
        :class="{ '!border-danger': error, 'opacity-75 cursor-not-allowed': disabled }"
        @change="(e: any) => emit('change', e.value)"
        :pt="{
          root: `outline-none dark:!bg-neutral-800  ${error ? '!border-danger' : '!border-grey-highlight'} !rounded-[10px] !shadow-none !transition-none`,
          panel: '!rounded-[10px]',
          input: 'text-[15px]',
          filterInput: 'border border-grey-highlight !rounded-[10px]',
          filterContainer: 'pb-2',
          item: 'py-2',
          itemGroup: 'font-bold',
          label: `mt-1  ${!model ? '!text-[#939393]' : 'dark:!text-white text-[#3b4854]'}`,
        }"
      >
        <template #option="slotProps">
          <div class="align-items-center flex">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Dropdown>
      <p v-if="helper" class="text-[14px] text-grey-mid mt-1">{{ helper }}</p>
      <p v-if="error" class="text-[12px] text-danger">{{ error }}</p>
    </div>
  </div>
</template>
