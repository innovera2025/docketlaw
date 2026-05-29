<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Switch } from '@headlessui/vue'

const model = defineModel<number>()
const isChecked = computed(() => model.value === 1)

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    error?: string | null
  }>(),
  {
    label: undefined,
    required: false,
    disabled: false,
    helper: null,
    error: null,
    labelWidth: '200px',
  },
)

const emit = defineEmits(['change'])

onMounted(() => {
  model.value = model.value === 1 ? 1 : 0
})

const toggleSwitch = () => {
  if (!props.disabled) {
    model.value = model.value === 1 ? 0 : 1
    emit('change')
  }
}
</script>

<template>
  <div class="flex md:flex-row flex-col mt-2 gap-x-6 gap-2">
    <div
      v-if="label"
      class="md:text-end"
      :style="labelWidth ? `min-width: ${labelWidth}` : ''"
      :class="!labelWidth ? 'w-full' : ''"
    >
      <label class="text-nowrap px-1">
        <span v-if="required" class="text-danger">*</span>
        {{ label }}
      </label>
    </div>
    <div
      class="relative"
      :style="inputWidth ? `min-width: ${inputWidth}` : ''"
      :class="!inputWidth ? 'w-full' : ''"
    >
      <div class="flex items-center">
        <Switch
          :modelValue="isChecked"
          :disabled="disabled"
          :class="[
            isChecked ? 'bg-[#007AE8]' : 'bg-grey',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]"
          class="relative inline-flex h-[25px] w-[45px] min-w-[45px] items-center rounded-full"
          @click="toggleSwitch"
        >
          <span
            :class="[
              isChecked ? 'translate-x-[22px]' : 'translate-x-1',
              'inline-block h-[19px] w-[19px] transform rounded-full bg-white transition',
            ]"
          />
        </Switch>
        <p v-if="helper" class="ml-3 text-grey-mid">{{ helper }}</p>
      </div>
      <p v-if="error" class="text-[12px] text-danger mt-1">{{ error }}</p>
    </div>
  </div>
</template>
