<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

const model = defineModel<string>()

withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    error?: string | null
  }>(),
  {
    label: 'Data Date',
    required: false,
    placeholder: '',
    disabled: false,
    error: null,
  },
)

const pick = ref(null)

onClickOutside(pick, () => (openPick.value = false))

const openPick = ref(false)
</script>

<template>
  <div class="relative w-fit">
    <button
      class="flex w-fit items-center gap-4 border border-grey-highlight px-4 py-2"
      @click="openPick = !openPick"
    >
      <p class="border-r pr-4 text-grey-dark">{{ label }}</p>
      <p class="w-[320px] text-start">ก่อนหน้า 90 วัน ถึงวันนี้ 00:00</p>
      <icon-calendar />
    </button>
    <div
      ref="pick"
      v-if="openPick"
      class="absolute left-0 top-12 z-[999] grid w-full grid-cols-3 border-[#DBDCDF] border border-grey-highlightbg-white"
    >
      <div class="flex flex-col space-y-2 border-r border-[#DBDCDF] p-4">
        <button class="text-start">วันนี้</button>
        <button class="text-start">ย้อนหลัง 7 วัน</button>
        <button class="text-start">ย้อนหลัง 30 วัน</button>
        <button class="text-start">ย้อนหลัง 60 วัน</button>
        <button class="text-start">ย้อนหลัง 90 วัน</button>
        <button class="text-start">กำหนดวันที่</button>
      </div>
      <div class="col-span-2 space-y-4 p-4">
        <div class="space-y-2">
          <p class="text-[14px] text-grey-dark">From Date</p>
          <input type="date" class="w-full border border-grey-highlight p-2" />
        </div>
        <div class="space-y-2">
          <p class="text-[14px] text-grey-dark">To Date</p>
          <input type="date" class="w-full border border-grey-highlight p-2" />
        </div>
        <div class="flex justify-end">
          <button class="text-semibold bg-primary px-10 py-2 text-white">Filter</button>
        </div>
      </div>
    </div>
  </div>
</template>
