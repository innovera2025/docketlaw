<script setup lang="ts">
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'

const model = defineModel<Date | Date[] | string | null>()

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    error?: string | null
    range?: boolean
    helper?: string | null
    showTime?: boolean
    timeOnly?: boolean
    hourFormat?: '12' | '24'
    inputClass?: string
    after?: string
    before?: string
    afterClass?: string
    beforeClass?: string
    paddingLeft?: string
    paddingRight?: string
  }>(),
  {
    label: undefined,
    required: false,
    placeholder: 'เลือกวันที่',
    disabled: false,
    labelWidth: '200px',
    error: null,
    range: false,
    helper: null,
    showTime: false,
    timeOnly: false,
    hourFormat: '24',
    inputClass: '',
    after: '',
    before: '',
    beforeClass: '',
    afterClass: '',
    paddingLeft: 'pl-[60px]',
    paddingRight: 'pr-[60px]',
  },
)

const pickerValue = computed({
  get() {
    if (typeof model.value === 'string' && model.value) {
      return new Date(model.value)
    }
    return model.value as Date | Date[] | null
  },
  set(val: Date | Date[] | null) {
    if (val instanceof Date && !props.timeOnly && !props.showTime) {
      const y = val.getFullYear()
      const m = String(val.getMonth() + 1).padStart(2, '0')
      const d = String(val.getDate()).padStart(2, '0')
      model.value = `${y}-${m}-${d}`
    } else {
      model.value = val as Date[] | string | null
    }
  },
})
</script>

<template>
  <div
    class="flex mt-2 md:flex-row md:items-center flex-col w-full gap-x-6 gap-2 relative"
    :class="[{ 'mt-2': label }]"
  >
    <div v-if="label" class="md:text-end" :style="`min-width: ${labelWidth}`">
      <label class="h-[16px] px-1" :class="{ 'text-nowrap': !label.includes('<br>') }">
        <span v-if="required" class="text-danger">*</span>
        <span v-html="label"></span>
      </label>
    </div>
    <div class="flex-grow relative" :style="`max-width: ${inputWidth}`">
      <label
        v-if="before"
        :class="[
          'absolute left-[15px] top-1/2 -translate-y-1/2 bg-transparent text-[15px] text-black border-r-1 border-[#DBDCDF] pr-[15px] z-10',
          beforeClass,
        ]"
      >
        {{ before }}
      </label>
      <label
        v-if="after || $slots.after"
        :class="[
          'absolute right-[20px] top-1/2 -translate-y-1/2 bg-transparent text-[15px] text-black border-l-1 border-[#DBDCDF] pl-[15px] z-10',
          afterClass,
        ]"
      >
        <slot name="after">{{ after }}</slot>
      </label>
      <div
        class="!w-[100%] !rounded-[10px] !shadow-none"
        :class="[error ? '!border-danger border-1' : '!border-[#EDEDED] border-1']"
      >
        <DatePicker
          v-model="pickerValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :selectionMode="range ? 'range' : 'single'"
          dateFormat="dd/mm/yy"
          :showTime="timeOnly || showTime"
          :timeOnly="timeOnly"
          :hourFormat="hourFormat"
          :defaultDate="new Date()"
          showIcon
          iconDisplay="input"
          :class="[
            '!w-[100%]',
            { 'error-state': error },
            { [paddingLeft]: before },
            { [paddingRight]: after },
            inputClass,
          ]"
          inputClass="!border-0 !shadow-none !h-[42px] !text-[15px] mx-1"
        >
          <template #inputicon>
            <IconCalendar class="w-5 h-5 text-[#979898]" />
          </template>
        </DatePicker>
      </div>
      <p v-if="error" class="text-[12px] text-danger absolute">{{ error }}</p>
      <p v-if="helper && !error" class="text-[12px] text-grey">{{ helper }}</p>
    </div>
  </div>
</template>

<style scoped>
/* จัดตำแหน่ง icon container */
:deep(.p-datepicker-input-icon-container) {
  position: absolute !important;
  right: 10px !important;
  top: 0 !important;
  bottom: 0 !important;
  height: auto !important;
  margin: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: none !important;
  transform: none !important;
}

:deep(.p-datepicker-input-icon-container svg) {
  display: block;
  margin: 0;
}

:deep(.p-datepicker) {
  position: relative;
}

:deep(input) {
  line-height: 2em;
}

/* จัดกลาง icon ในแนวตั้ง */
:deep(.p-inputicon) {
  display: flex;
  align-items: center;
}

/* Error state */
:deep(.p-datepicker.error-state input),
:deep(.p-datepicker.error-state input:focus) {
  border-color: transparent !important;
  outline: none !important;
}
</style>
