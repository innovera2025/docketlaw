<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CasesPageHeader from '@/components/cases/CasesPageHeader.vue'
import CasesFilter from '@/components/cases/CasesFilter.vue'
import CaseCard from '@/components/cases/CaseCard.vue'
import type { CaseItem } from '@/components/cases/CaseCard.vue'
import { API } from '@/api'
import moment from 'moment/min/moment-with-locales'
moment.locale('th')

const statusLabelMap: Record<string, string> = {
  active: 'กำลังดำเนินการ',
  pending: 'รอนัดพิจารณา',
  draft: 'แบบร่าง',
  done: 'ดำเนินการเสร็จสิ้น',
}

const searchQuery = ref('')
const filterStatus = ref('all')
const cases = ref<CaseItem[]>([])
const isLoading = ref(true)

onMounted(async () => {
  const lawyerId = localStorage.getItem('lawyer_user_id')
  await API('specific\\lawfirm\\cases', 'select', { lawyer_id: lawyerId })
    .then((res) => {
      if (res.response_status) {
        cases.value = res.response_data.map((item: any) => ({
          id: item.id,
          caseType:
            String(item.case_type_id) == '1'
              ? 'คดีแพ่ง'
              : String(item.case_type_id) == '2'
                ? 'คดีอาญา'
                : String(item.case_type_id),
          caseNumber: item?.code || '-',
          status: item?.status || '-',
          statusLabel: statusLabelMap[item.status] ?? item.status,
          title: item?.name || '-',
          description: item?.description || '-',
          client: item?.client_name || '-',
          court: item?.court || '-',
          filedDate: item?.date_filling || '-',
          nextDate: item?.next_schedule?.date || '',
        }))
      }
    })
    .finally(() => {
      isLoading.value = false
    })
})

const filteredCases = computed(() => {
  return cases.value.filter((c) => {
    const matchesSearch =
      !searchQuery.value ||
      c.title.includes(searchQuery.value) ||
      c.caseNumber.includes(searchQuery.value) ||
      c.client.includes(searchQuery.value) ||
      c.caseType.includes(searchQuery.value)

    const matchesFilter = filterStatus.value === 'all' || c.status === filterStatus.value

    return matchesSearch && matchesFilter
  })
})
</script>

<template>
  <section class="space-y-4 px-[20px] py-[15px]">
    <CasesPageHeader :case-count="cases.length" />

    <base-loading v-if="isLoading" />

    <template v-else>
      <CasesFilter v-model:search-query="searchQuery" v-model:filter-status="filterStatus" />

      <div class="space-y-[10px]">
        <CaseCard v-for="c in filteredCases" :key="c.id" :item="c" />

        <div
          v-if="filteredCases.length === 0"
          class="py-[60px] text-center text-[16px] text-[#8e9aab]"
        >
          ไม่พบรายการคดีที่ตรงกับเงื่อนไขการค้นหา
        </div>
      </div>
    </template>
  </section>
</template>
