<script setup lang="ts">
import IconTrash from '@/components/icons/IconTrash.vue'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { API } from '@/api'
import { push } from 'notivue'
import moment from 'moment/min/moment-with-locales'
import { usePermissions } from '@/composables/usePermissions'
moment.locale('th')

const { p } = usePermissions()

const props = defineProps<{
  caseId: number
  progress: {
    id: number
    case_id: number
    case_step_id: number
    case_step_name: string
    date: string
    description: string
    result: string
    status: string
    insert_date_time: string
    insert_username: string
  }[]
}>()
const emit = defineEmits<{ refresh: [] }>()

type StepStatus = 'done' | 'active' | 'pending'

const stepOptions = ref<any>([])

const statusOptions = [
  { name: 'รอดำเนินการ', value: 'pending' },
  { name: 'กำลังดำเนินการ', value: 'active' },
  { name: 'เสร็จสิ้น', value: 'done' },
]

const statusStyle: Record<StepStatus, { circleBg: string; badgeBg: string; text: string }> = {
  done: { circleBg: 'bg-[#e9fae2]', badgeBg: 'bg-[#e9fae2]', text: 'text-[#78df42]' },
  active: { circleBg: 'bg-[#def3ff]', badgeBg: 'bg-[#def3ff]', text: 'text-[#16b1ff]' },
  pending: { circleBg: 'bg-[#edeff1]', badgeBg: 'bg-[#edeff1]', text: 'text-[#8e9aab]' },
}

const steps = ref<
  {
    id: number
    caseStepId: number
    name: string
    date: string
    rawDate: Date
    by: string
    description: string
    result: string
    status: StepStatus
    statusLabel: string
  }[]
>([])

watch(
  () => props?.progress,
  (val) => {
    steps.value = val.map((p) => {
      const statusOpt = statusOptions.find((o) => o.value === p.status)
      return {
        id: p.id,
        caseStepId: p.case_step_id,
        name: p.case_step_name,
        date: moment(p.date).isValid() ? moment(p.date).format('DD MMM YYYY') : p.date,
        rawDate: moment(p.date).isValid() ? moment(p.date).toDate() : new Date(),
        by: p.insert_username || '-',
        description: p.description || '',
        result: p.result || '',
        status: (p.status as StepStatus) ?? 'pending',
        statusLabel: statusOpt?.name ?? p.status,
      }
    })
  },
  { immediate: true },
)

const openDeleteStepModal = ref(false)
const deletingStepId = ref<number | null>(null)

const confirmDeleteStep = (id: number) => {
  deletingStepId.value = id
  openDeleteStepModal.value = true
}

const removeStep = async () => {
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'deleteProgress', {
    case_progress_id: deletingStepId.value,
  })
    .then(async (res) => {
      if (res.response_status) {
        const stepName = steps.value.find((s) => s.id === deletingStepId.value)?.name || ''
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `ลบขั้นตอน : ${stepName}`,
          type: 'cases',
        })
        push.success('ลบขั้นตอนสำเร็จ!')
        openDeleteStepModal.value = false
        deletingStepId.value = null
        emit('refresh')
      } else {
        push.error('ลบขั้นตอนไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openStepModal = ref(false)
const editingStepId = ref<number | null>(null)
const isEditMode = computed(() => editingStepId.value !== null)
const formSubmitted = ref(false)
const isSubmitting = ref(false)

const stepForm = reactive({
  caseStepId: null as number | null,
  date: null as string | null,
  description: '',
  result: '',
  status: 'pending' as string | null,
})

const resetStepForm = () => {
  stepForm.caseStepId = null
  stepForm.date = null
  stepForm.description = ''
  stepForm.result = ''
  stepForm.status = 'pending'
  editingStepId.value = null
}

const openAddStep = async () => {
  resetStepForm()
  formSubmitted.value = false
  await loadDataPreFill()
  openStepModal.value = true
}

const openEditStep = async (step: (typeof steps.value)[number]) => {
  formSubmitted.value = false
  await loadDataPreFill()
  editingStepId.value = step.id
  stepForm.caseStepId = step.caseStepId
  stepForm.date = moment(step.rawDate).format('YYYY-MM-DD')
  stepForm.description = step.description
  stepForm.result = step.result
  stepForm.status = step.status
  openStepModal.value = true
}

const handleSaveStep = async () => {
  formSubmitted.value = true
  if (!stepForm.caseStepId || !stepForm.date) return
  isSubmitting.value = true
  const dateStr = stepForm.date
  const progressPayload = {
    case_step_id: stepForm.caseStepId,
    date: dateStr,
    description: stepForm.description,
    result: stepForm.result,
    status: stepForm.status ?? 'pending',
  }

  const apiCall = isEditMode.value
    ? API('specific\\lawfirm\\cases', 'updateProgress', {
        case_progress_id: editingStepId.value,
        progress: progressPayload,
      })
    : API('specific\\lawfirm\\cases', 'insertProgress', {
        case_id: props.caseId,
        progress: progressPayload,
      })

  await apiCall
    .then(async (res) => {
      if (res.response_status) {
        const stepName =
          stepOptions.value.find((o: any) => o.value === stepForm.caseStepId)?.name || ''
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `${isEditMode.value ? 'แก้ไขขั้นตอน' : 'เพิ่มขั้นตอน'} : ${stepName}`,
          type: 'cases',
        })
        push.success(isEditMode.value ? 'แก้ไขขั้นตอนสำเร็จ!' : 'เพิ่มขั้นตอนสำเร็จ!')
        resetStepForm()
        openStepModal.value = false
        emit('refresh')
      } else {
        push.error(
          (isEditMode.value ? 'แก้ไขขั้นตอนไม่สำเร็จ!\n' : 'เพิ่มขั้นตอนไม่สำเร็จ!\n') +
            res.response_message,
        )
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const loadDataPreFill = async () => {
  await API('specific\\lawfirm\\cases', 'preFill', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  })
    .then((res) => {
      if (res?.response_status) {
        stepOptions.value = (res.response_data.case_steps ?? []).map((s: any) => ({
          name: s.name,
          value: s.id,
        }))
      } else {
        push.error('เกิดข้อผิดพลาดในการโหลดข้อมูล preFill: ' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
}

onMounted(async () => {})
</script>

<template>
  <div class="space-y-[20px]">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[22px] text-[#3b4854]">การดำเนินคดี</p>
        <p class="text-[16px] text-[#777f87]">
          ขั้นตอนการดำเนินคดีในชั้นศาล (สามารถเพิ่ม ลบ ขั้นตอนได้ที่หน้าจัดการขั้นตอนของคดี)
        </p>
      </div>
      <button
        v-if="p.is_edit_case"
        class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 shrink-0"
        @click="openAddStep"
      >
        + เพิ่มขั้นตอน
      </button>
    </div>

    <!-- Timeline -->
    <div class="relative">
      <!-- Vertical connector line -->
      <div
        v-if="steps.length > 1"
        class="absolute left-[24px] top-[50px] w-[1px] bg-[#e7e8e9]"
        :style="{ height: `calc(100% - 100px)` }"
      ></div>

      <!-- Steps -->
      <div
        v-for="(step, i) in steps"
        :key="step.id"
        class="flex gap-[25px]"
        :class="i < steps.length - 1 ? 'mb-[15px]' : ''"
      >
        <!-- Step number circle -->
        <div
          class="shrink-0 size-[50px] rounded-full flex items-center justify-center z-10"
          :class="statusStyle[step.status].circleBg"
        >
          <span class="text-[16px] font-medium" :class="statusStyle[step.status].text">{{
            i + 1
          }}</span>
        </div>

        <!-- Card -->
        <div class="flex-1 min-w-0 rounded-[20px] border border-[#e7e8e9] bg-white overflow-hidden">
          <!-- Top: name + meta + status + actions -->
          <div class="flex items-center gap-[16px] px-[20px] pt-[20px] pb-[12px]">
            <div class="flex-1 min-w-0">
              <p class="text-[16px] text-[#3b4854] mb-[4px]">{{ step.name || '-' }}</p>
              <div class="flex items-center gap-[8px] text-[14px] text-[#b2b6bb]">
                <span>{{ step.date || '-' }}</span>
                <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block"></span>
                <span>โดย : {{ step.by || '-' }}</span>
              </div>
            </div>

            <!-- Status badge -->
            <span
              class="shrink-0 rounded-full px-[15px] py-[8px] text-[15px]"
              :class="[statusStyle[step.status].badgeBg, statusStyle[step.status].text]"
            >
              {{ step.statusLabel }}
            </span>

            <!-- Edit button -->
            <button
              v-if="p.is_edit_case"
              class="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-white hover:bg-[#f4f4f4] transition-colors"
              @click="openEditStep(step)"
            >
              <IconPencil class="w-[18px] text-[#777F87]" />
            </button>

            <!-- Delete button -->
            <button
              v-if="p.is_edit_case"
              @click="confirmDeleteStep(step.id)"
              class="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-white hover:bg-[#fff0f0] transition-colors"
            >
              <IconTrash class="w-[16px] text-[#777F87]" />
            </button>
          </div>

          <!-- Result bar -->
          <div class="mx-[20px] mb-[20px] rounded-[5px] bg-[#f3f3f4] px-[15px] py-[10px]">
            <span class="text-[15px] text-[#777f87]">ผลลัพธ์ : {{ step.result || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="steps.length === 0"
        class="flex items-center justify-center rounded-[20px] border border-dashed border-[#e7e8e9] py-[60px] text-[16px] text-[#8e9aab]"
      >
        ยังไม่มีขั้นตอน
      </div>
    </div>
  </div>

  <base-modal
    v-if="openDeleteStepModal"
    open
    title="ลบขั้นตอน"
    subtitle="คุณต้องการลบขั้นตอนนี้ใช่หรือไม่?"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isSubmitting"
    @primary="removeStep"
    @close="openDeleteStepModal = false"
  />

  <base-modal
    v-if="openStepModal"
    open
    :title="isEditMode ? 'แก้ไขขั้นตอนในคดี' : 'เพิ่มขั้นตอนในคดี'"
    subtitle="บันทึกข้อมูลขั้นตอนที่เกิดขึ้นในคดีพร้อมรายละเอียด และผลลัพธ์การดำเนินการ"
    size="smm"
    action-button
    positionAction="left"
    action-text="บันทึก"
    variant="black"
    :disabled="isSubmitting"
    @primary="handleSaveStep"
    @close="
      () => {
        resetStepForm()
        formSubmitted = false
        openStepModal = false
      }
    "
  >
    <!-- ขั้นตอน -->
    <div class="mb-[20px]">
      <p class="mb-[10px] text-[15px] text-[#3b4854]">
        ขั้นตอน <span class="text-[#ff725d]">*</span>
      </p>
      <base-dropdown-multi-select
        v-model="stepForm.caseStepId"
        :options="stepOptions"
        placeholder="เลือกขั้นตอน"
        :error="formSubmitted && !stepForm.caseStepId ? 'กรุณาเลือกขั้นตอน' : null"
      />
    </div>

    <!-- วันที่ดำเนินการ -->
    <div class="mb-[5px]">
      <p class="mb-[10px] text-[15px] text-[#3b4854]">
        วันที่ดำเนินการ <span class="text-[#ff725d]">*</span>
      </p>
      <base-datepicker-label
        v-model="stepForm.date"
        inputWidth="265px"
        placeholder="วว/ดด/ปปปป"
        :error="formSubmitted && !stepForm.date ? 'กรุณาเลือกวันที่ดำเนินการ' : null"
      />
    </div>
    <p class="mb-[20px] text-[14px] text-[#ff725d]" :class="{ 'mt-4': formSubmitted }">
      มีผลต่อลำดับการแสดงผล
    </p>

    <!-- คำอธิบาย / รายละเอียด -->
    <div class="mb-[20px]">
      <base-textarea
        v-model="stepForm.description"
        label="คำอธิบาย / รายละเอียด"
        labelType="vertical"
        placeholder="เช่น สืบพยานโจทก์"
        :rows="3"
      />
    </div>

    <!-- ผลลัพธ์ -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="stepForm.result"
        label="ผลลัพธ์"
        labelType="vertical"
        placeholder="กรอกหากมี"
      />
    </div>

    <!-- สถานะการดำเนินการ -->
    <div class="mb-[5px]">
      <p class="mb-[10px] text-[15px] text-[#3b4854]">สถานะการดำเนินการ</p>
      <base-dropdown-multi-select
        v-model="stepForm.status"
        :options="statusOptions"
        placeholder="เลือกสถานะ"
      />
    </div>
  </base-modal>
</template>
