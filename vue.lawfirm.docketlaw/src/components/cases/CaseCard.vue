<script setup lang="ts">
import { useRouter } from 'vue-router'
import IconClient from '@/components/icons/IconClient.vue'
import IconLocation from '@/components/icons/IconLocation.vue'
import IconCalendarV2 from '@/components/icons/IconCalendarV2.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconAction from '@/components/icons/IconAction.vue'
import moment from 'moment/min/moment-with-locales'
moment.locale('th')

export interface CaseItem {
  id: number
  caseType: string
  caseNumber: string
  status: string
  statusLabel: string
  title: string
  description: string
  client: string
  court: string
  filedDate: string
  nextDate: string | null
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-[#def3ff]', text: 'text-[#16b1ff]' },
  pending: { bg: 'bg-[#ede6ff]', text: 'text-[#904eff]' },
  draft: { bg: 'bg-[#edeff1]', text: 'text-[#8e9aab]' },
  done: { bg: 'bg-[#e8f9e8]', text: 'text-[#49b84b]' },
}

const props = defineProps<{ item: CaseItem }>()

const router = useRouter()
</script>

<template>
  <div
    class="rounded-[20px] bg-[#f4f4f4] p-[25px] cursor-pointer hover:bg-[#eeeeee] transition-colors"
  >
    <!-- Row 1: badges -->
    <div class="flex flex-wrap items-center gap-[10px] mb-[12px]">
      <span class="rounded-full bg-[#e7e8e9] px-[15px] py-[6px] text-[14px] text-[#8e9aab]">
        {{ item.caseNumber }}
      </span>
      <span class="rounded-full bg-[#e7e8e9] px-[15px] py-[6px] text-[14px] text-[#8e9aab]">
        {{ item.caseType }}
      </span>
      <span
        class="rounded-full px-[15px] py-[6px] text-[14px]"
        :class="[statusConfig[item.status]?.bg, statusConfig[item.status]?.text]"
      >
        {{ item.statusLabel }}
      </span>
    </div>

    <!-- Row 2: title + actions -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-[17px] text-[#3b4854] mb-[8px]">{{ item.title || '-' }}</p>
        <p class="text-[15px] text-[#777f87] mb-[16px]">{{ item.description || '-' }}</p>

        <!-- Meta row -->
        <div class="flex flex-wrap items-center gap-x-[30px] gap-y-[8px]">
          <div class="flex items-center gap-[8px]">
            <IconClient class="w-[18px]" />
            <span class="text-[14px] text-[#777f87]">{{ item.client || '-' }}</span>
          </div>
          <div class="flex items-center gap-[8px]">
            <IconLocation class="w-[13px]" />
            <span class="text-[14px] text-[#777f87]">{{ item.court || '-' }}</span>
          </div>
          <div class="flex items-center gap-[8px]">
            <IconCalendarV2 class="w-[18px]" />
            <span class="text-[14px] text-[#777f87]"
              >ยื่นฟ้อง :
              {{
                moment(item.filedDate).isValid()
                  ? moment(item.filedDate).format('DD MMMM YYYY')
                  : '-'
              }}</span
            >
          </div>
          <div v-if="item.nextDate" class="flex items-center gap-[8px]">
            <IconDocument class="w-[18px]" />
            <span class="text-[14px] font-medium text-[#3b4854]"
              >นัดถัดไป :
              {{
                moment(item.nextDate).isValid() ? moment(item.nextDate).format('DD MMMM YYYY') : '-'
              }}</span
            >
          </div>
        </div>
      </div>

      <!-- Action button -->
      <div class="flex items-center gap-[8px] shrink-0">
        <button
          @click="router.push(`/cases/${item.id}`)"
          class="flex size-[40px] items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-[#e5e5e5] transition-colors"
        >
          <IconAction class="w-[20px]" />
        </button>
      </div>
    </div>
  </div>
</template>
