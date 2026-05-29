<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const model = defineModel<string | number | (string | number)[] | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    options: { name: string; value: string | number }[]
    placeholder?: string
    error?: string | null
    required?: boolean
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    textNowrap?: boolean
    multiple?: boolean
    styleProps?: Record<string, string | number> | null
    placeholderSelectAll?: string
    noOptionsText?: string
    noResultsText?: string
    labelType?: 'horizontal' | 'vertical'
  }>(),
  {
    placeholderSelectAll: 'Select All',
    placeholder: 'All',
    disabled: false,
    helper: null,
    labelWidth: '200px',
    textNowrap: true,
    multiple: false,
    styleProps: null,
    noOptionsText: 'ไม่มีข้อมูล',
    noResultsText: 'ไม่พบข้อมูล',
    labelType: 'horizontal',
  },
)

const emit = defineEmits(['change'])
const multiselectRef = ref<any>(null)
const openDirection = ref<'bottom' | 'top'>('bottom')

const inner = computed({
  get: () => {
    if (props.multiple) {
      return Array.isArray(model.value) ? model.value : model.value != null ? [model.value] : []
    }
    return model.value
  },
  set: (v: any) => {
    model.value = props.multiple
      ? Array.isArray(v)
        ? v
        : v != null
          ? [v]
          : []
      : Array.isArray(v)
        ? (v[0] ?? null)
        : v
    emit('change', model.value)
  },
})

const multiselectOptions = computed(() => {
  return props.options.map((opt) => ({
    label: opt.name,
    value: opt.value,
  }))
})

const isAllSelected = computed(() => {
  if (!props.multiple || !Array.isArray(inner.value)) return false
  return inner.value.length === props.options.length
})

const isIndeterminate = computed(() => {
  if (!props.multiple || !Array.isArray(inner.value)) return false
  return inner.value.length > 0 && inner.value.length < props.options.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    inner.value = []
  } else {
    inner.value = props.options.map((opt) => opt.value)
  }
}

const checkDropdownPosition = () => {
  if (!multiselectRef.value) return

  const element = multiselectRef.value.$el
  if (!element) return

  const rect = element.getBoundingClientRect()
  const dropdownHeight = 300
  const spacing = 10 // ระยะห่างที่เพิ่มเข้าไป
  const spaceBelow = window.innerHeight - rect.bottom - spacing
  const spaceAbove = rect.top - spacing

  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    openDirection.value = 'top'
  } else {
    openDirection.value = 'bottom'
  }
}

let observer: MutationObserver | null = null

onMounted(() => {
  if (multiselectRef.value) {
    const element = multiselectRef.value.$el
    observer = new MutationObserver(() => {
      const dropdown = element.querySelector('.multiselect-dropdown')
      if (dropdown && dropdown.style.display !== 'none') {
        checkDropdownPosition()
      }
    })
    observer.observe(element, { attributes: true, childList: true, subtree: true })
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div
    class="flex w-full gap-x-6 gap-2 relative mt-2"
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
      :style="labelType === 'horizontal' ? `min-width: ${labelWidth}` : ''"
    >
      <label class="h-[16px] px-1 text-[15px]" :class="textNowrap ? 'text-nowrap' : ''">
        <span v-if="labelType === 'horizontal' && required" class="text-danger">*</span>
        {{ label }}
        <span v-if="labelType === 'vertical' && required" class="text-danger">*</span>
      </label>
    </div>

    <div class="flex-grow min-w-0 w-full" :style="`max-width: ${inputWidth} !important`">
      <Multiselect
        ref="multiselectRef"
        v-model="inner"
        :options="multiselectOptions"
        :mode="multiple ? 'tags' : 'single'"
        :placeholder="placeholder"
        searchable
        :disabled="disabled"
        :close-on-select="!multiple"
        valueProp="value"
        label="label"
        append-to-body
        :openDirection="openDirection"
        @open="checkDropdownPosition"
        :noOptionsText="noOptionsText"
        :noResultsText="noResultsText"
        class="w-full rounded-[10px]"
        :style="styleProps"
        :class="{
          '!border-danger': error && error.length > 0,
          'has-error': error && error.length > 0,
        }"
      >
        <template v-if="multiple" #beforelist>
          <div class="select-all-option" @click="toggleSelectAll">
            <div
              class="custom-checkbox"
              :class="{
                checked: isAllSelected,
                indeterminate: isIndeterminate,
              }"
            >
              <svg
                v-if="isAllSelected"
                class="checkbox-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div v-else-if="isIndeterminate" class="checkbox-minus"></div>
            </div>
            <span class="select-all-text">{{ placeholderSelectAll }}</span>
          </div>
        </template>

        <template v-if="multiple" #option="{ option, isSelected }">
          <div class="option-wrapper">
            <div class="custom-checkbox" :class="isSelected(option) ? 'checked' : ''">
              <svg
                v-if="isSelected(option)"
                class="checkbox-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>{{ option.label }}</span>
          </div>
        </template>
      </Multiselect>

      <p v-if="helper" class="text-[14px] text-grey-mid mt-1">{{ helper }}</p>
      <p v-if="error" class="text-[12px] text-danger absolute mt-[2px]">{{ error }}</p>
    </div>
  </div>
</template>

<style>
.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 1px solid #d1d5db !important;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.custom-checkbox:hover {
  border-color: #3872e1;
  box-shadow: 0 0 0 3px rgba(56, 114, 225, 0.1);
}

.custom-checkbox.checked {
  background-color: #3872e1;
  border-color: #3872e1;
  box-shadow: 0 1px 3px rgba(56, 114, 225, 0.3);
}

.custom-checkbox.indeterminate {
  background-color: #3872e1;
  border-color: #3872e1;
}

.checkbox-icon {
  width: 12px;
  height: 12px;
  animation: checkmark 0.2s ease-in-out;
}

.checkbox-minus {
  width: 10px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.multiselect.has-error {
  border-color: #dc3545 !important;
}

.multiselect.has-error.is-active {
  outline: 1px solid #dc3545 !important;
  border-color: #dc3545 !important;
}

.select-all-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-weight: 600;
  transition: background-color 0.15s ease;
  position: sticky;
  top: 0;
  z-index: 10;
}

.select-all-option:hover {
  background-color: #f3f4f6;
}

.select-all-text {
  user-select: none;
  color: #374151;
  font-size: 14px;
}

.option-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}
.multiselect-option {
  cursor: pointer;
  padding: 10px 12px !important;
  transition: background-color 0.15s ease;
}

.multiselect-option:hover {
  background-color: #f3f4f6;
}

.multiselect-option.is-selected {
  background-color: var(--color-primary) !important;
  color: white !important;
  font-weight: 500;
}

.multiselect-option.is-selected:hover {
  background-color: var(--color-primary) !important;
  opacity: 0.9;
}

.multiselect {
  outline: none;
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #ededed !important;
}

.multiselect.is-disabled {
  background-color: #f9fafb !important;
}

.multiselect.is-active {
  outline: 2px solid #3872e1 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

.multiselect-tag {
  background: var(--color-primary) !important;
  color: white !important;
  border-radius: 6px !important;
  padding: 4px 8px !important;
}

.multiselect-tag-remove {
  color: white !important;
  opacity: 0.8;
}

.multiselect-tag-remove:hover {
  opacity: 1;
}

.multiselect-single,
.multiselect-tags,
.multiselect-wrapper {
  border-radius: 10px !important;
}

.multiselect-input,
.multiselect-search {
  border-radius: 10px !important;
  padding-right: 60px;
}

.multiselect-dropdown {
  margin-top: 2px !important;
  overflow: hidden;
  overflow-y: auto;
}

.multiselect-dropdown.is-top {
  margin-top: 0 !important;
  margin-bottom: 2px !important;
}
</style>
