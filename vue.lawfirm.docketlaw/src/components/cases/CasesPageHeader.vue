<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

defineProps<{
  caseCount: number
}>()

const router = useRouter()
const { p } = usePermissions()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <p class="text-[20px] text-[#3b4854]">รายการคดี</p>
      <p class="text-[16px] text-[#777f87]">จัดการข้อมูลคดีทั้งหมด ({{ caseCount }} คดี)</p>
    </div>
    <button
      v-if="p.is_add_case"
      @click="router.push('/cases/add')"
      class="flex items-center gap-2 rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
    >
      + บันทึกคดีใหม่
    </button>
  </div>
</template>
