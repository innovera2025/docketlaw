<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { API } from '@/api'
import { push } from 'notivue'
import moment from 'moment/min/moment-with-locales'
import { usePermissions } from '@/composables/usePermissions'
moment.locale('th')

const { p } = usePermissions()

const props = defineProps<{
  caseId: number
  financeBox: { total: number; paid: number; waiting: number }
  finance: {
    id: number
    case_id: number
    name: string
    payment_type: string
    payment_amount: string
    description: string
    payer: string
    payment_date: string
    status: string
    insert_date_time: string
    insert_username: string
  }[]
}>()
const emit = defineEmits<{ refresh: [] }>()

const statusLabelMap: Record<string, string> = {
  paid: 'ชำระแล้ว',
  pending: 'รอชำระ',
}

const search = ref('')

const records = ref<
  {
    id: number
    description: string
    paymentMethod: string
    payer: string
    detail: string
    amount: number
    date: string
    status: string
    statusLabel: string
  }[]
>([])

watch(
  () => props.finance,
  (val) => {
    records.value = val.map((f) => ({
      id: f.id,
      description: f.name || '-',
      paymentMethod: f.payment_type || '-',
      payer: f.payer || '-',
      detail: f.description || '-',
      amount: parseFloat(f.payment_amount) || 0,
      date: moment(f.payment_date).isValid()
        ? moment(f.payment_date).format('DD MMMM YYYY')
        : f.payment_date,
      status: f.status,
      statusLabel: statusLabelMap[f.status] ?? f.status,
    }))
  },
  { immediate: true },
)

const filteredRecords = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return records.value
  return records.value.filter(
    (r) =>
      r.description.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q) ||
      r.payer.toLowerCase().includes(q) ||
      r.detail.toLowerCase().includes(q) ||
      formatAmount(r.amount).includes(q) ||
      r.date.toLowerCase().includes(q) ||
      r.statusLabel.toLowerCase().includes(q),
  )
})

const formatAmount = (n: number) =>
  '฿ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const financeTable = {
  columns: [
    { field: 'description', header: 'รายการ' },
    { field: 'paymentMethod', header: 'วิธีการชำระเงิน' },
    { field: 'payer', header: 'ผู้ชำระ' },
    { field: 'detail', header: 'รายละเอียดเพิ่มเติม' },
    { field: 'amount', header: 'ยอดชำระ' },
    { field: 'date', header: 'วันที่' },
    { field: 'status', header: 'สถานะ' },
    { field: 'actions', header: 'จัดการ', width: '1%' },
  ],
}

const paymentMethodOptions = [
  { name: 'เงินสด', value: 'เงินสด' },
  { name: 'โอนเงิน', value: 'โอนเงิน' },
  { name: 'เช็ค', value: 'เช็ค' },
  { name: 'บัตรเครดิต', value: 'บัตรเครดิต' },
]

const paymentStatusOptions = [
  { name: 'รอชำระ', value: 'pending' },
  { name: 'ชำระแล้ว', value: 'paid' },
]

const openAddFinanceModal = ref(false)
const formSubmitted = ref(false)
const isSubmitting = ref(false)

const openAddFinance = () => {
  resetFinanceForm()
  formSubmitted.value = false
  openAddFinanceModal.value = true
}

const financeForm = reactive({
  description: '',
  paymentMethod: null as string | null,
  amount: null as number | null,
  detail: '',
  payer: '',
  date: null as string | null,
  status: 'pending' as string | null,
})

const resetFinanceForm = () => {
  financeForm.description = ''
  financeForm.paymentMethod = null
  financeForm.amount = null
  financeForm.detail = ''
  financeForm.payer = ''
  financeForm.date = null
  financeForm.status = 'pending'
}

const handleSaveFinance = async () => {
  formSubmitted.value = true
  if (!financeForm.description || !financeForm.date) return
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'insertFinance', {
    case_id: props.caseId,
    finance: {
      name: financeForm.description,
      payment_type: financeForm.paymentMethod ?? '',
      payment_amount: financeForm.amount ?? 0,
      description: financeForm.detail,
      payer: financeForm.payer,
      payment_date: financeForm.date,
      status: financeForm.status ?? 'pending',
    },
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `เพิ่มรายการ : ${financeForm.description}`,
          type: 'cases',
        })
        push.success('เพิ่มบันทึกทางการเงินสำเร็จ!')
        resetFinanceForm()
        openAddFinanceModal.value = false
        emit('refresh')
      } else {
        push.error('เพิ่มบันทึกทางการเงินไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openEditFinanceModal = ref(false)
const editingFinanceId = ref<number | null>(null)

const openEditFinance = (id: number) => {
  const original = props.finance.find((f) => f.id === id)
  if (!original) return
  formSubmitted.value = false
  editingFinanceId.value = id
  financeForm.description = original.name || ''
  financeForm.paymentMethod = original.payment_type || null
  financeForm.amount = parseFloat(original.payment_amount) || null
  financeForm.detail = original.description || ''
  financeForm.payer = original.payer || ''
  financeForm.date = moment(original.payment_date).isValid()
    ? moment(original.payment_date).format('YYYY-MM-DD')
    : null
  financeForm.status = original.status || 'pending'
  openEditFinanceModal.value = true
}

const handleUpdateFinance = async () => {
  formSubmitted.value = true
  if (!financeForm.description || !financeForm.date) return
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'updateFinance', {
    case_finance_id: editingFinanceId.value,
    finance: {
      name: financeForm.description,
      payment_type: financeForm.paymentMethod ?? '',
      payment_amount: financeForm.amount ?? 0,
      description: financeForm.detail,
      payer: financeForm.payer,
      payment_date: financeForm.date,
      status: financeForm.status ?? 'pending',
    },
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `แก้ไขรายการ : ${financeForm.description}`,
          type: 'cases',
        })
        push.success('แก้ไขบันทึกทางการเงินสำเร็จ!')
        resetFinanceForm()
        editingFinanceId.value = null
        openEditFinanceModal.value = false
        emit('refresh')
      } else {
        push.error('แก้ไขบันทึกทางการเงินไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openDeleteFinanceModal = ref(false)
const deletingFinanceId = ref<number | null>(null)

const confirmDeleteFinance = (id: number) => {
  deletingFinanceId.value = id
  openDeleteFinanceModal.value = true
}

const removeFinance = async () => {
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'deleteFinance', {
    case_finance_id: deletingFinanceId.value,
  })
    .then(async (res) => {
      if (res.response_status) {
        const financeName =
          records.value.find((r) => r.id === deletingFinanceId.value)?.description || ''
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `ลบรายการ : ${financeName}`,
          type: 'cases',
        })
        push.success('ลบบันทึกทางการเงินสำเร็จ!')
        openDeleteFinanceModal.value = false
        deletingFinanceId.value = null
        emit('refresh')
      } else {
        push.error('ลบบันทึกทางการเงินไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}
</script>

<template>
  <div class="space-y-[15px]">
    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-[15px]">
      <!-- ยอดรวมทั้งหมด -->
      <div
        class="rounded-[8px] border border-[#e7e8e9] bg-white px-[25px] py-[20px] flex items-center justify-center gap-[20px]"
      >
        <div class="text-center">
          <p class="text-[15px] text-[#777f87] mb-[4px]">ยอดรวมทั้งหมด</p>
          <p class="text-[22px] font-bold text-[#3b4854]">
            {{ formatAmount(props.financeBox.total) }}
          </p>
        </div>
      </div>

      <!-- ยอดชำระแล้ว -->
      <div
        class="rounded-[8px] border border-[#e7e8e9] bg-white px-[25px] py-[20px] flex items-center justify-center gap-[20px]"
      >
        <div class="text-center">
          <p class="text-[15px] text-[#777f87] mb-[4px]">ยอดชำระแล้ว</p>
          <p class="text-[22px] font-bold text-[#78df42]">
            {{ formatAmount(props.financeBox.paid) }}
          </p>
        </div>
      </div>

      <!-- ยอดค้างชำระ -->
      <div
        class="rounded-[8px] border border-[#e7e8e9] bg-white px-[25px] py-[20px] flex items-center justify-center gap-[20px]"
      >
        <div class="text-center">
          <p class="text-[15px] text-[#777f87] mb-[4px]">ยอดค้างชำระ</p>
          <p class="text-[22px] font-bold text-[#ff725d]">
            {{ formatAmount(props.financeBox.waiting) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main section -->
    <div class="rounded-[8px] border border-[#e7e8e9] bg-white overflow-hidden">
      <!-- Section header -->
      <div class="px-[25px] pt-[25px] pb-[15px]">
        <div class="flex items-start justify-between gap-[20px]">
          <div>
            <p class="text-[20px] text-[#3b4854]">บันทึกทางการเงิน</p>
            <p class="text-[16px] text-[#777f87]">
              บันทึกข้อมูลทางการเงินที่เกี่ยวข้องกับคดีและงานว่าจ้าง
            </p>
          </div>
          <div v-if="p.is_edit_case" class="flex items-center gap-[10px] shrink-0">
            <!-- Search -->
            <div
              class="flex items-center gap-[10px] rounded-[6px] border border-[#e7e8e9] bg-white px-[15px] py-[12px] w-[220px]"
            >
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path
                  d="M17.393,16.444a8.75,8.75,0,1,0-.95.95L21.05,22l.95-.95ZM10.75,18.156a7.406,7.406,0,1,1,7.406-7.406,7.406,7.406,0,0,1-7.406,7.406Z"
                  fill="#aeb3b7"
                />
              </svg>
              <input
                v-model="search"
                type="text"
                placeholder="ค้นหาจากคีย์เวิร์ด…"
                class="flex-1 min-w-0 text-[16px] text-[#3b4854] placeholder-[#aeb3b7] outline-none bg-transparent"
              />
            </div>
            <!-- Add button -->
            <button
              class="rounded-[5px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 whitespace-nowrap"
              @click="openAddFinance"
            >
              เพิ่มข้อมูล
            </button>
          </div>
        </div>
      </div>

      <BaseDataTable :table="financeTable" :data="filteredRecords">
        <template #cell-description="{ row }">
          <span class="text-[15px] text-[#3b4854]">{{ row.description }}</span>
        </template>
        <template #cell-paymentMethod="{ row }">
          <span class="text-[15px] text-[#777f87]">{{ row.paymentMethod }}</span>
        </template>
        <template #cell-payer="{ row }">
          <span class="text-[15px] text-[#777f87]">{{ row.payer }}</span>
        </template>
        <template #cell-detail="{ row }">
          <span class="text-[15px] text-[#777f87]">{{ row.detail }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="text-[15px] font-medium text-[#3b4854]">{{ formatAmount(row.amount) }}</span>
        </template>
        <template #cell-date="{ row }">
          <span class="text-[15px] text-[#777f87]">{{ row.date }}</span>
        </template>
        <template #cell-status="{ row }">
          <span
            class="inline-block rounded-[6px] px-[15px] py-[8px] text-[15px] w-fit"
            :class="
              row.status === 'paid' ? 'bg-[#e9fae2] text-[#78df42]' : 'bg-[#fff2db] text-[#ffab00]'
            "
          >
            {{ row.statusLabel }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div v-if="p.is_edit_case" class="flex items-center gap-[6px]">
            <button
              class="flex size-[36px] items-center justify-center rounded-full hover:bg-[#f4f4f4] transition-colors"
              @click="openEditFinance(row.id)"
            >
              <IconPencil class="w-[16px] text-[#777f87]" />
            </button>
            <button
              class="flex size-[36px] items-center justify-center rounded-full hover:bg-[#fff0f0] transition-colors"
              @click="confirmDeleteFinance(row.id)"
            >
              <IconTrash class="w-[15px] text-[#777f87]" />
            </button>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </div>

  <base-modal
    v-if="openAddFinanceModal"
    open
    title="เพิ่มบันทึกทางการเงิน"
    subtitle="บันทึกข้อมูลการชำระเงินที่เกี่ยวข้องกับคดี ในเบื้องต้น"
    size="smm"
    action-button
    positionAction="left"
    action-text="บันทึก"
    variant="black"
    :disabled="isSubmitting"
    @primary="handleSaveFinance"
    @close="
      () => {
        resetFinanceForm()
        formSubmitted = false
        openAddFinanceModal = false
      }
    "
  >
    <!-- รายการ -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="financeForm.description"
        label="รายการ"
        labelType="vertical"
        placeholder="ชำระค่าทนายความ งวดที่ 1"
        required
        :error="formSubmitted && !financeForm.description ? 'กรุณากรอกรายการ' : null"
      />
    </div>

    <!-- วิธีการชำระเงิน + ยอดชำระ -->
    <div class="mb-[20px] grid grid-cols-2 gap-[20px]">
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">วิธีการชำระเงิน</p>
        <base-dropdown-multi-select
          v-model="financeForm.paymentMethod"
          :options="paymentMethodOptions"
          placeholder="เลือกวิธีการชำระ"
        />
      </div>
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">ยอดชำระ</p>
        <base-text-input
          v-model="financeForm.amount"
          labelType="vertical"
          type="number"
          placeholder="0.00"
          after="บาท"
        />
      </div>
    </div>

    <!-- คำอธิบาย / รายละเอียด -->
    <div class="mb-[20px]">
      <base-textarea
        v-model="financeForm.detail"
        label="คำอธิบาย / รายละเอียด"
        labelType="vertical"
        placeholder="เช่น ผู้รับเงิน หรือบัญชีที่รับเงิน"
        :rows="3"
      />
    </div>

    <!-- ผู้ชำระ -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="financeForm.payer"
        label="ผู้ชำระ"
        labelType="vertical"
        placeholder="ชื่อผู้ชำระเงิน"
      />
    </div>

    <!-- วันที่ชำระเงิน + สถานะ -->
    <div class="grid grid-cols-2 gap-[20px]">
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">
          วันที่ชำระเงิน <span class="text-[#ff725d]">*</span>
        </p>
        <base-datepicker-label
          v-model="financeForm.date"
          placeholder="วว/ดด/ปปปป"
          :error="formSubmitted && !financeForm.date ? 'กรุณาเลือกวันที่ชำระเงิน' : null"
        />
      </div>
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">สถานะการชำระเงิน</p>
        <base-dropdown-multi-select
          v-model="financeForm.status"
          :options="paymentStatusOptions"
          placeholder="เลือกสถานะ"
        />
      </div>
    </div>
  </base-modal>

  <base-modal
    v-if="openEditFinanceModal"
    open
    title="แก้ไขบันทึกทางการเงิน"
    subtitle="แก้ไขข้อมูลการชำระเงินที่เกี่ยวข้องกับคดี"
    size="smm"
    action-button
    action-text="บันทึก"
    variant="black"
    :disabled="isSubmitting"
    @primary="handleUpdateFinance"
    @close="
      () => {
        resetFinanceForm()
        formSubmitted = false
        editingFinanceId = null
        openEditFinanceModal = false
      }
    "
  >
    <div class="mb-[20px]">
      <base-text-input
        v-model="financeForm.description"
        label="รายการ"
        labelType="vertical"
        placeholder="ชำระค่าทนายความ งวดที่ 1"
        required
        :error="formSubmitted && !financeForm.description ? 'กรุณากรอกรายการ' : null"
      />
    </div>
    <div class="mb-[20px] grid grid-cols-2 gap-[20px]">
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">วิธีการชำระเงิน</p>
        <base-dropdown-multi-select
          v-model="financeForm.paymentMethod"
          :options="paymentMethodOptions"
          placeholder="เลือกวิธีการชำระ"
        />
      </div>
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">ยอดชำระ</p>
        <base-text-input
          v-model="financeForm.amount"
          labelType="vertical"
          type="number"
          placeholder="0.00"
          after="บาท"
        />
      </div>
    </div>
    <div class="mb-[20px]">
      <base-textarea
        v-model="financeForm.detail"
        label="คำอธิบาย / รายละเอียด"
        labelType="vertical"
        placeholder="เช่น ผู้รับเงิน หรือบัญชีที่รับเงิน"
        :rows="3"
      />
    </div>
    <div class="mb-[20px]">
      <base-text-input
        v-model="financeForm.payer"
        label="ผู้ชำระ"
        labelType="vertical"
        placeholder="ชื่อผู้ชำระเงิน"
      />
    </div>
    <div class="grid grid-cols-2 gap-[20px]">
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">
          วันที่ชำระเงิน <span class="text-[#ff725d]">*</span>
        </p>
        <base-datepicker-label
          v-model="financeForm.date"
          placeholder="วว/ดด/ปปปป"
          :error="formSubmitted && !financeForm.date ? 'กรุณาเลือกวันที่ชำระเงิน' : null"
        />
      </div>
      <div>
        <p class="mb-[10px] text-[15px] text-[#3b4854]">สถานะการชำระเงิน</p>
        <base-dropdown-multi-select
          v-model="financeForm.status"
          :options="paymentStatusOptions"
          placeholder="เลือกสถานะ"
        />
      </div>
    </div>
  </base-modal>

  <base-modal
    v-if="openDeleteFinanceModal"
    open
    title="ลบบันทึกทางการเงิน"
    subtitle="คุณต้องการลบบันทึกทางการเงินนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isSubmitting"
    @primary="removeFinance"
    @close="openDeleteFinanceModal = false"
  />
</template>
