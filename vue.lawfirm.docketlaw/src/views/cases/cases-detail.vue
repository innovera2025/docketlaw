<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API } from '@/api'
import { push } from 'notivue'

const router = useRouter()
const route = useRoute()
const openDeleteCaseModal = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)
import CasesTabInfo from './tabs/CasesTabInfo.vue'
import CasesTabFiles from './tabs/CasesTabFiles.vue'
import CasesTabProcess from './tabs/CasesTabProcess.vue'
import CasesTabNotes from './tabs/CasesTabNotes.vue'
import CasesTabFinance from './tabs/CasesTabFinance.vue'
import moment from 'moment/min/moment-with-locales'
moment.locale('th')

const activeTab = ref('info')

const tabs = [
  { key: 'info', label: 'ข้อมูลคดี', icon: 'contract' },
  { key: 'files', label: 'ไฟล์ประกอบคดี / เอกสารแนบ', icon: 'file' },
  { key: 'process', label: 'การดำเนินคดี', icon: 'hourglass' },
  { key: 'notes', label: 'บันทึกเพิ่มเติม', icon: 'notes' },
  { key: 'finance', label: 'บันทึกการเงิน', icon: 'money' },
]

const statusLabelMap: Record<string, string> = {
  active: 'กำลังดำเนินการ',
  pending: 'รอนัดพิจารณา',
  draft: 'แบบร่าง',
  done: 'ดำเนินการเสร็จสิ้น',
}

const contacts = ref<
  { prefix: string; name: string; tel: string; email: string; remark: string }[]
>([])
const files = ref<any[]>([])
const progress = ref<any[]>([])
const details = ref<any[]>([])
const financeBox = ref({ total: 0, paid: 0, waiting: 0 })
const finance = ref<any[]>([])

const caseData = ref({
  id: 0,
  caseType: '',
  caseNumber: '',
  typeShort: '',
  status: 'draft',
  statusLabel: '',
  title: '',
  description: '',
  client: '',
  court: '',
  filedDate: '',
  nextDate: '',
  lawyer: '',
  lawyerInfo: '',
  clientFullName: '',
  clientIdCard: '',
  clientPhone: '',
  clientEmail: '',
  clientAddress: '',
  updatedAt: '',
  updatedBy: '',
  createdAt: '',
  createdBy: '',
})

const fetchCase = async () => {
  const id = route.params.id
  await API('specific\\lawfirm\\cases', 'getByID', { id })
    .then((res) => {
      if (res.response_status) {
        const d = res.response_data
        const status = d.status || d.status_case || 'draft'
        const caseType =
          String(d.case_type_id) === '1'
            ? 'คดีแพ่ง'
            : String(d.case_type_id) === '2'
              ? 'คดีอาญา'
              : String(d.case_type_id)
        contacts.value = Array.isArray(d.contacts) ? d.contacts : []
        files.value = Array.isArray(d.files) ? d.files : []
        progress.value = Array.isArray(d.progress) ? d.progress : []
        details.value = Array.isArray(d.details) ? d.details : []
        financeBox.value = d.finance_box ?? { total: 0, paid: 0, waiting: 0 }
        finance.value = Array.isArray(d.finance) ? d.finance : []
        caseData.value = {
          id: d.id,
          caseType: caseType || '-',
          caseNumber: d.code || '-',
          typeShort: caseType || '-',
          status,
          statusLabel: statusLabelMap[status] ?? status,
          title: d.name || '-',
          description: d.description || '-',
          client: d.client_name || '-',
          court: d.court || '-',
          filedDate: moment(d.date_filling).isValid()
            ? moment(d.date_filling).format('DD MMMM YYYY')
            : '-',
          nextDate: moment(d?.next_schedule?.date).isValid()
            ? moment(d?.next_schedule?.date).format('DD MMMM YYYY')
            : '-',
          lawyer: d?.case_lawyer?.details?.full_name || '-',
          lawyerInfo: d?.case_lawyer?.details
            ? `ทนายในสังกัด${d.case_lawyer.details.department || '-'}, หมายเลข : ${d.case_lawyer.details.license_no || '-'}`
            : '-',
          clientFullName: d.client_name || '-',
          clientIdCard: d.client_id ? String(d.client_id) : '-',
          clientPhone: d.client_tel || '-',
          clientEmail: d.client_email || '-',
          clientAddress: d.client_address || '-',
          updatedAt: moment(d.update_date_time).isValid()
            ? moment(d.update_date_time).format('DD MMMM YYYY, HH:mm')
            : '-',
          updatedBy: d.update_user_id === -1 ? '-' : d.update_username || '-',
          createdAt: moment(d.insert_date_time).isValid()
            ? moment(d.insert_date_time).format('DD MMMM YYYY, HH:mm')
            : '-',
          createdBy: d.insert_username || '-',
        }
      }
    })
    .finally(() => {
      isLoading.value = false
    })
}

onMounted(fetchCase)

const handleDelete = async () => {
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'delete', { id: route.params.id })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'ลบข้อมูลคดี',
          description: `เลขคดี : ${caseData.value.caseNumber}`,
          type: 'cases',
        })
        push.success('ลบข้อมูลคดีสำเร็จ!')
        router.push('/cases')
      } else {
        push.error('ลบข้อมูลคดีไม่สำเร็จ!\n' + res.response_message)
        openDeleteCaseModal.value = false
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
      openDeleteCaseModal.value = false
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-[#def3ff]', text: 'text-[#16b1ff]' },
  pending: { bg: 'bg-[#ede6ff]', text: 'text-[#904eff]' },
  draft: { bg: 'bg-[#edeff1]', text: 'text-[#8e9aab]' },
  done: { bg: 'bg-[#e8f9e8]', text: 'text-[#49b84b]' },
}
</script>

<template>
  <section class="px-[20px] pt-[15px] pb-[40px] space-y-[20px]">
    <base-loading v-if="isLoading" />

    <template v-else>
      <!-- Page Header -->
      <div>
        <p class="text-[22px] text-[#3b4854]">ข้อมูลเคส / คดี</p>
        <p class="text-[16px] text-[#777f87]">
          บันทึกรายละเอียดเคส และรายละเอียดผู้ติดต่อหรือผู้เกี่ยวข้อง
        </p>
      </div>

      <!-- Hero card (dark) -->
      <div class="rounded-[10px] bg-[#0f182a] p-[25px]">
        <div class="flex flex-wrap items-center gap-[10px] mb-[12px]">
          <span class="rounded-full bg-[#777f87] px-[15px] py-[6px] text-[14px] text-[#f3f3f4]">
            {{ caseData.caseNumber }}
          </span>
          <span class="rounded-full bg-[#777f87] px-[15px] py-[6px] text-[14px] text-[#f3f3f4]">
            {{ caseData.typeShort }}
          </span>
          <span
            class="rounded-full px-[15px] py-[6px] text-[14px]"
            :class="[statusConfig[caseData.status].bg, statusConfig[caseData.status].text]"
          >
            {{ caseData.statusLabel }}
          </span>
        </div>
        <p class="text-[17px] text-white mb-[8px]">{{ caseData.title }}</p>
        <p class="text-[15px] text-[#e7e8e9] mb-[16px]">{{ caseData.description }}</p>
        <div class="flex flex-wrap items-center gap-x-[30px] gap-y-[8px]">
          <div class="flex items-center gap-[8px]">
            <IconClient class="w-[18px]" />
            <span class="text-[14px] text-[#b2b6bb]">{{ caseData.client }}</span>
          </div>
          <div class="flex items-center gap-[8px]">
            <IconLocation class="w-[13px]" />
            <span class="text-[14px] text-[#b2b6bb]">{{ caseData.court }}</span>
          </div>
          <div class="flex items-center gap-[8px]">
            <IconCalendarV2 class="w-[18px]" />
            <span class="text-[14px] text-[#b2b6bb]">ยื่นฟ้อง : {{ caseData.filedDate }}</span>
          </div>
          <div class="flex items-center gap-[8px]">
            <IconDocument class="w-[18px] text-white" />
            <span class="text-[14px] font-medium text-white"
              >นัดถัดไป : {{ caseData.nextDate }}</span
            >
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-[#e7e8e9]">
        <div class="flex gap-[0px] overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex items-center gap-[8px] px-[20px] py-[15px] text-[16px] whitespace-nowrap transition-colors relative"
            :class="
              activeTab === tab.key ? 'text-[#c29f5f]' : 'text-[#3b4854] hover:text-[#c29f5f]'
            "
            @click="activeTab = tab.key"
          >
            <IconDocumentV3
              v-if="tab.icon === 'contract'"
              class="w-[17px]"
              :class="activeTab === tab.key ? 'text-[#c29f5f]' : ''"
            />

            <IconFileV2
              v-if="tab.icon === 'file'"
              class="w-[20px]"
              :class="activeTab === tab.key ? 'text-[#c29f5f]' : ''"
            />
            <IconHourglass
              v-if="tab.icon === 'hourglass'"
              class="w-[17px]"
              :class="activeTab === tab.key ? 'text-[#c29f5f]' : ''"
            />
            <IconDocument
              v-if="tab.icon === 'notes'"
              class="w-[20px]"
              :class="activeTab === tab.key ? 'text-[#c29f5f]' : ''"
            />
            <IconMoney
              v-if="tab.icon === 'money'"
              class="w-[18px]"
              :class="activeTab === tab.key ? 'text-[#c29f5f]' : ''"
            />

            {{ tab.label }}
            <span
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 h-[2px] w-full bg-[#c29f5f] rounded-t-full"
            ></span>
          </button>
        </div>
      </div>

      <!-- Tab content -->
      <CasesTabInfo
        v-if="activeTab === 'info'"
        :case-data="caseData"
        :contacts="contacts"
        :status-config="statusConfig"
        @delete="openDeleteCaseModal = true"
      />
      <CasesTabFiles
        v-else-if="activeTab === 'files'"
        :files="files"
        :case-id="caseData.id"
        @refresh="fetchCase"
      />
      <CasesTabProcess
        v-else-if="activeTab === 'process'"
        :case-id="caseData.id"
        :progress="progress"
        @refresh="fetchCase"
      />
      <CasesTabNotes
        v-else-if="activeTab === 'notes'"
        :case-id="caseData.id"
        :details="details"
        @refresh="fetchCase"
      />
      <CasesTabFinance
        v-else-if="activeTab === 'finance'"
        :case-id="caseData.id"
        :finance-box="financeBox"
        :finance="finance"
        @refresh="fetchCase"
      />
    </template>
  </section>

  <base-modal
    v-if="openDeleteCaseModal"
    open
    title="ลบข้อมูลคดี"
    subtitle="การลบคดี จะลบไฟล์ที่เกี่ยวข้องในโฟลเดอร์คดีนี้ทั้งหมดยืนยันที่จะลบใช่หรือไม่"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isSubmitting"
    @primary="handleDelete"
    @close="openDeleteCaseModal = false"
  />
</template>
