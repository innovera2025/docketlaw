<script setup lang="ts">
import IconSearch from '@/components/icons/IconSearch.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

defineProps<{
  searchQuery: string
  filterStatus: string
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:filterStatus': [value: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-3 items-center">
    <div class="relative flex-1 min-w-[260px]">
      <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-[20px]" />
      <input
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="ค้นหาคดีจากคีย์เวิร์ด, เลขคดี, ชื่อลูกความ หรืออื่น ๆ …"
        class="w-full rounded-[8px] border border-[#e7e8e9] bg-white py-[13px] pl-[45px] pr-[15px] text-[16px] text-[#3b4854] placeholder-[#aeb3b7] outline-none focus:border-[#0f182a] placeholder:py-1"
      />
    </div>
    <div class="relative">
      <select
        :value="filterStatus"
        @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value)"
        class="appearance-none cursor-pointer rounded-[8px] border border-[#e7e8e9] bg-white py-[13px] pl-[15px] pr-[40px] text-[16px] text-[#3b4854] outline-none focus:border-[#0f182a]"
      >
        <option value="all">แสดงคดีทั้งหมด</option>
        <option value="active">กำลังดำเนินการ</option>
        <option value="pending">รอนัดพิจารณา</option>
        <option value="draft">แบบร่าง</option>
        <option value="done">ดำเนินการเสร็จสิ้น</option>
      </select>
      <IconChevronRight
        class="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 rotate-90 text-[#b2b6bb]"
      />
    </div>
  </div>
</template>
