<script setup lang="ts">
import DatePicker from 'primevue/datepicker'
import { computed, onMounted, ref, watch } from 'vue'
import CalendarCalendar from './calendar-calendar.vue'
import moment from 'moment/min/moment-with-locales'
import { useRouter, useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { push } from 'notivue'
import { API } from '@/api'
import IconCalendarSmall from '@/components/icons/IconCalendarSmall.vue'
import IconClockSmall from '@/components/icons/IconClockSmall.vue'
import IconMapSmall from '@/components/icons/IconMapSmall.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import IconUserV3 from '@/components/icons/IconUserV3.vue'
import IconCopy from '@/components/icons/IconCopy.vue'

const { p } = usePermissions()
const router = useRouter()
const route = useRoute()

type AppointmentType = 'court' | 'client' | 'witness' | 'document' | 'meeting' | 'other'

interface Appointment {
  id: number
  title: string
  type: AppointmentType
  case_number: string
  client_name: string
  court: string
  date: string
  startTime: string
  endTime: string
  lawyer: string
  remark: string
}

// ===== MOCK DATA =====
const allAppointments = ref<Appointment[]>([
  {
    id: 1,
    title: 'นัดฟังคำพิพากษา',
    type: 'court',
    case_number: 'คดีหมายเลข ค.123/2567',
    client_name: 'นายสมชาย ใจดี',
    court: 'ศาลแพ่งกรุงเทพใต้',
    date: moment().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '12:00',
    lawyer: 'ทนายสมหญิง รักงาน',
    remark: 'เตรียมเอกสารหลักฐาน',
  },
  {
    id: 2,
    title: 'นัดพบลูกความ',
    type: 'client',
    case_number: 'คดีหมายเลข ค.456/2567',
    client_name: 'บริษัท XYZ จำกัด',
    court: 'สำนักงานทนายความ',
    date: moment().add(1, 'days').format('YYYY-MM-DD'),
    startTime: '13:00',
    endTime: '15:00',
    lawyer: 'ทนายประชา ดีงาม',
    remark: '',
  },
  {
    id: 3,
    title: 'นัดพบพยาน',
    type: 'witness',
    case_number: 'คดีหมายเลข ค.789/2567',
    client_name: 'นางสาวมาลี สวยงาม',
    court: 'ศาลจังหวัดนนทบุรี',
    date: moment().add(3, 'days').format('YYYY-MM-DD'),
    startTime: '10:00',
    endTime: '12:00',
    lawyer: 'ทนายสมชาย ใจดี',
    remark: 'เตรียมคำซักพยาน',
  },
  {
    id: 4,
    title: 'ยื่นเอกสารศาล',
    type: 'document',
    case_number: 'คดีหมายเลข ค.111/2567',
    client_name: 'นายวิชัย มั่นคง',
    court: 'ศาลแพ่ง',
    date: moment().add(5, 'days').format('YYYY-MM-DD'),
    startTime: '09:30',
    endTime: '11:00',
    lawyer: 'ทนายสมหญิง รักงาน',
    remark: '',
  },
  {
    id: 5,
    title: 'ประชุมทีมทนาย',
    type: 'meeting',
    case_number: '-',
    client_name: '-',
    court: 'สำนักงานทนายความ',
    date: moment().add(7, 'days').format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '16:00',
    lawyer: 'ทุกท่าน',
    remark: 'ประชุมสรุปคดีประจำสัปดาห์',
  },
  {
    id: 6,
    title: 'นัดขึ้นศาล',
    type: 'court',
    case_number: 'คดีหมายเลข ค.222/2567',
    client_name: 'ห้างหุ้นส่วน ABC',
    court: 'ศาลอาญา',
    date: moment().add(10, 'days').format('YYYY-MM-DD'),
    startTime: '08:30',
    endTime: '12:00',
    lawyer: 'ทนายประชา ดีงาม',
    remark: 'คดีอาญา',
  },
])

const mockNotes = ref<
  Record<number, { id: number; note: string; date: string; insert_username: string }>
>({})
// ===== END MOCK DATA =====

const appointmentTypes = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'court', label: 'ขึ้นศาล' },
  { key: 'client', label: 'นัดพบลูกความ' },
  { key: 'witness', label: 'นัดพบพยาน' },
  { key: 'document', label: 'ยื่นเอกสาร' },
  { key: 'meeting', label: 'ประชุม' },
  { key: 'other', label: 'อื่น ๆ' },
]

const isLoading = ref(false)
const data = ref<any[]>([])
const isLoadingData = ref(false)
const filterType = ref('all')

const package_data = ref({} as any)

const cases = ref<{ id: number; code: string; name: string }[]>([])
const caseOptions = computed(() => [
  { value: 0, name: 'ไม่เกี่ยวข้องกับคดี' },
  ...cases.value.map((c) => ({ value: c.id, name: `${c.code} – ${c.name}` })),
])

const openAddNote = ref(false)
const openEditNote = ref(0)
const openDeleteNote = ref(0)
const openAddAppointment = ref(false)
const openViewAppointment = ref(0)
const viewAppointmentData = ref<any>(null)
const isLoadingViewAppointment = ref(false)
const openEditAppointment = ref(0)
const openDeleteAppointment = ref(0)

const form = ref({
  defaultView: 'month',
  currentYear: +moment().format('YYYY'),
  currentMonth: +moment().format('MM'),
  currentDay: +moment().format('DD'),
})

const lastDayOfMonth = computed(() =>
  moment(`${form.value.currentYear}-${form.value.currentMonth}`, 'YYYY-MM').daysInMonth(),
)

const calendarOptions = computed(() => ({
  ...form.value,
  currentDay: Math.min(form.value.currentDay, lastDayOfMonth.value),
}))

// Appointments lookup map for CalendarCalendar
const appointmentsMap = computed(() =>
  Object.fromEntries(allAppointments.value.map((a) => [a.id, a])),
)

const today = moment().format('YYYY-MM-DD')
const upcomingCount = computed(
  () => data.value.filter((item) => String(item.id ?? '').startsWith('schedule')).length,
)
const nextAppointment = computed(() => allAppointments.value[0] || null)

const months = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

const prevMonth = () => {
  if (form.value.currentMonth === 1) {
    form.value.currentMonth = 12
    form.value.currentYear -= 1
  } else form.value.currentMonth -= 1
}
const nextMonth = () => {
  if (form.value.currentMonth === 12) {
    form.value.currentMonth = 1
    form.value.currentYear += 1
  } else form.value.currentMonth += 1
}

// ---- Note form ----
const noteForm = ref({ note: '', date: '' })
const noteErrors = ref({ note: '', date: '' })

const clearNoteForm = () => {
  noteForm.value = { note: '', date: '' }
  noteErrors.value = { note: '', date: '' }
  openAddNote.value = false
  openEditNote.value = 0
  openDeleteNote.value = 0
}

const handleSubmitNote = async () => {
  noteErrors.value = {
    note: !noteForm.value.note ? 'กรุณากรอกรายละเอียด' : '',
    date: !moment(noteForm.value.date).isValid() ? 'กรุณากรอกวันที่' : '',
  }
  if (Object.values(noteErrors.value).some((v) => v !== '')) return
  const noti = push.promise(openAddNote.value ? 'กำลังสร้างโน้ต...' : 'กำลังแก้ไขโน้ต...')
  await new Promise((r) => setTimeout(r, 500))
  const newId = openEditNote.value || Date.now()
  mockNotes.value[newId] = {
    id: newId,
    note: noteForm.value.note,
    date: noteForm.value.date,
    insert_username: 'ผู้ใช้งาน',
  }
  noti.resolve(openAddNote.value ? 'สร้างโน้ตสำเร็จ' : 'แก้ไขโน้ตสำเร็จ')
  clearNoteForm()
  await loadCalendarData()
}

const handleDeleteNote = async () => {
  const noti = push.promise('กำลังลบโน้ต...')
  await new Promise((r) => setTimeout(r, 500))
  delete mockNotes.value[openDeleteNote.value]
  noti.resolve('ลบโน้ตสำเร็จ')
  clearNoteForm()
  await loadCalendarData()
}

// ---- Appointment form ----
const appointmentForm = ref({
  type: 'court' as AppointmentType,
  title: '',
  case_id: null as number | null,
  client_name: '',
  court: '',
  date: '',
  startTime: '',
  endTime: '',
  lawyer: '',
  remark: '',
})
const appointmentErrors = ref({ title: '', date: '', startTime: '', endTime: '' })
const isSubmittingAppointment = ref(false)

const clearAppointmentForm = () => {
  appointmentForm.value = {
    type: 'court',
    title: '',
    case_id: null,
    client_name: '',
    court: '',
    date: '',
    startTime: '',
    endTime: '',
    lawyer: '',
    remark: '',
  }
  appointmentErrors.value = { title: '', date: '', startTime: '', endTime: '' }
  openAddAppointment.value = false
  openEditAppointment.value = 0
}

const handleAddAppointment = async () => {
  if (!package_data.value.current_package || new Date(package_data.value.expire_date) < new Date()) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  appointmentErrors.value = {
    title: !appointmentForm.value.title ? 'กรุณากรอกหัวข้อ' : '',
    date: !moment(appointmentForm.value.date).isValid() ? 'กรุณากรอกวันที่' : '',
    startTime: !appointmentForm.value.startTime ? 'กรุณากรอกเวลาเริ่ม' : '',
    endTime: !appointmentForm.value.endTime ? 'กรุณากรอกเวลาสิ้นสุด' : '',
  }
  if (Object.values(appointmentErrors.value).some((v) => v !== '')) return
  isSubmittingAppointment.value = true
  await API('specific\\lawfirm\\lawyer_calendar', 'insert', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    data: {
      date: appointmentForm.value.date,
      start_time: appointmentForm.value.startTime,
      end_time: appointmentForm.value.endTime,
      type: appointmentForm.value.type,
      topic: appointmentForm.value.title,
      location: appointmentForm.value.court,
      remark: appointmentForm.value.remark,
      case_id: appointmentForm.value.case_id ?? 0,
    },
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'เพิ่มนัดหมาย',
          description: `หัวข้อ : ${appointmentForm.value.title}`,
          type: 'calendar',
        })
        push.success('สร้างนัดหมายสำเร็จ!')
        clearAppointmentForm()
        loadCalendarData()
      } else {
        push.error('สร้างนัดหมายไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmittingAppointment.value = false
    })
}

const handleEditFromCalendar = (apptData: any) => {
  appointmentForm.value = {
    type: apptData.type ?? 'court',
    title: apptData.topic ?? '',
    case_id: apptData.case_id || null,
    client_name: '',
    court: apptData.location ?? '',
    date: apptData.date ?? '',
    startTime: apptData.start_time?.slice(0, 5) ?? '',
    endTime: apptData.end_time?.slice(0, 5) ?? '',
    lawyer: apptData.insert_username ?? '',
    remark: apptData.remark ?? '',
  }
  openEditAppointment.value = apptData.id
}

const openEditFromView = () => {
  if (!viewAppointmentData.value) return
  const apptData = viewAppointmentData.value
  appointmentForm.value = {
    type: apptData.type ?? 'court',
    title: apptData.topic ?? '',
    case_id: apptData.case_id || null,
    client_name: '',
    court: apptData.location ?? '',
    date: apptData.date ?? '',
    startTime: apptData.start_time?.slice(0, 5) ?? '',
    endTime: apptData.end_time?.slice(0, 5) ?? '',
    lawyer: apptData.insert_username ?? '',
    remark: apptData.remark ?? '',
  }
  openEditAppointment.value = apptData.id
  openViewAppointment.value = 0
}

const handleEditAppointment = async () => {
  appointmentErrors.value = {
    title: !appointmentForm.value.title ? 'กรุณากรอกหัวข้อ' : '',
    date: !moment(appointmentForm.value.date).isValid() ? 'กรุณากรอกวันที่' : '',
    startTime: !appointmentForm.value.startTime ? 'กรุณากรอกเวลาเริ่ม' : '',
    endTime: !appointmentForm.value.endTime ? 'กรุณากรอกเวลาสิ้นสุด' : '',
  }
  if (Object.values(appointmentErrors.value).some((v) => v !== '')) return
  isSubmittingAppointment.value = true
  await API('specific\\lawfirm\\lawyer_calendar', 'update', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    id: openEditAppointment.value,
    data: {
      date: appointmentForm.value.date,
      start_time: appointmentForm.value.startTime,
      end_time: appointmentForm.value.endTime,
      type: appointmentForm.value.type,
      topic: appointmentForm.value.title,
      location: appointmentForm.value.court,
      remark: appointmentForm.value.remark,
      case_id: appointmentForm.value.case_id ?? 0,
    },
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขนัดหมาย',
          description: `หัวข้อ : ${appointmentForm.value.title}`,
          type: 'calendar',
        })
        push.success('แก้ไขนัดหมายสำเร็จ!')
        clearAppointmentForm()
        loadCalendarData()
      } else {
        push.error('แก้ไขนัดหมายไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmittingAppointment.value = false
    })
}

const handleDeleteAppointment = async () => {
  const noti = push.promise('กำลังลบนัดหมาย...')
  await API('specific\\lawfirm\\lawyer_calendar', 'delete', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    id: openDeleteAppointment.value,
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'ลบนัดหมาย',
          description: `หัวข้อ : ${viewAppointmentData.value?.topic || ''}`,
          type: 'calendar',
        })
        noti.resolve('ลบนัดหมายสำเร็จ!')
        openDeleteAppointment.value = 0
        loadCalendarData()
      } else {
        noti.reject('ลบนัดหมายไม่สำเร็จ!\n' + res.response_message)
        openDeleteAppointment.value = 0
      }
    })
    .catch((err) => {
      noti.reject('เกิดข้อผิดพลาด: ' + err.message)
      openDeleteAppointment.value = 0
    })
}

const timeStringToDate = (t: string): Date | null => {
  if (!t) return null
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m, 0, 0)
  return d
}

const loadCalendarData = async () => {
  isLoadingData.value = true
  const month = `${form.value.currentYear}-${String(form.value.currentMonth).padStart(2, '0')}`
  await API('specific\\lawfirm\\lawyer_calendar', 'select', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    month,
    type: filterType.value,
  })
    .then((res) => {
      if (res.response_status) {
        data.value = res.response_data?.list ?? []
        const s = res.response_data?.next_schedule
        allAppointments.value = s
          ? [
              {
                id: s.id,
                title: s.topic,
                type: (s.type as AppointmentType) ?? 'other',
                case_number: String(s.case_id || ''),
                client_name: '',
                court: s.location || '',
                date: s.date,
                startTime: s.start_time?.slice(0, 5) ?? '',
                endTime: s.end_time?.slice(0, 5) ?? '',
                lawyer: s.insert_username || '',
                remark: s.remark || '',
              },
            ]
          : []
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isLoadingData.value = false
    })
}

watch(openViewAppointment, async () => {
  if (openViewAppointment.value) {
    isLoadingViewAppointment.value = true
    await API('specific\\lawfirm\\lawyer_calendar', 'getByID', { id: openViewAppointment.value })
      .then((res) => {
        if (res.response_status) viewAppointmentData.value = res.response_data
      })
      .catch(() => {})
      .finally(() => {
        isLoadingViewAppointment.value = false
      })
  }
})

watch(openEditNote, async () => {
  if (openEditNote.value) {
    isLoading.value = true
    await new Promise((r) => setTimeout(r, 200))
    const n = mockNotes.value[openEditNote.value]
    if (n) noteForm.value = { note: n.note, date: n.date }
    isLoading.value = false
  }
})

watch([filterType, () => form.value.currentMonth, () => form.value.currentYear], () =>
  loadCalendarData(),
)

const handlePackage = async () => {
  const res = await API('specific\\lawfirm\\lawyer_package', 'getPaymentInfo', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  })

  if (res?.response_status) {
    package_data.value = res.response_data
  } else {
    push.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + res.response_message)
  }
}


onMounted(async () => {
  await handlePackage()
  await API('specific\\lawfirm\\lawyer_calendar', 'preFill', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  })
    .then((res) => {
      if (res.response_status) {
        cases.value = (res.response_data?.case ?? []).map(
          (c: { id: number; code: string; name: string }) => ({
            id: c.id,
            code: c.code,
            name: c.name,
          }),
        )
      }
    })
    .catch(() => {})
  await loadCalendarData()
  isLoading.value = false
})
</script>

<template>
  <section v-if="!isLoading" class="flex !p-0 min-h-screen">
    <!-- ===== SIDEBAR ===== -->
    <div class="flex flex-col gap-4 p-4 w-[380px] shrink-0 overflow-y-auto">
      <!-- Card 1: Mini Calendar -->
      <div class="rounded-xl border border-grey-highlight bg-white p-5 space-y-3">
        <div>
          <p class="text-[20px] font-medium leading-snug">ปฏิทินนัดหมาย</p>
          <p class="mt-1">สร้าง จัดการ และดูนัดหมายภายในระบบ</p>
        </div>
        <DatePicker
          inline
          class="w-full"
          @value-change="
            (e) => {
              const d = moment(e as Date).format('YYYY-MM-DD')
              form.currentDay = +d.split('-')[2]
              form.currentMonth = +d.split('-')[1]
              form.currentYear = +d.split('-')[0]
            }
          "
        />
      </div>

      <!-- Card 2: Filter tabs + Add button -->
      <div class="rounded-xl border border-grey-highlight bg-white p-5 space-y-4">
        <div>
          <p class="text-base font-medium">นัดหมายที่กำลังจะมาถึง</p>
          <p class="text-[15px] text-grey">{{ upcomingCount }} รายการ</p>
        </div>

        <!-- Pill filter tabs -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in appointmentTypes"
            :key="t.key"
            @click="filterType = t.key.toString()"
            class="py-1.5 px-4 rounded-full text-[15px] transition-colors duration-150"
            :class="
              filterType === t.key.toString()
                ? 'bg-[#0f182a] text-white'
                : 'bg-[#edeff1] text-[#8e9aab] hover:bg-gray-200'
            "
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Add appointment button -->
        <button
          v-if="p.is_add_appointment"
          class="w-full bg-[#0f182a] text-white rounded-lg py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          @click="openAddAppointment = true"
        >
          + เพิ่มนัดหมาย
        </button>
      </div>

      <!-- Card 3: Upcoming appointment -->
      <div
        v-if="nextAppointment"
        class="rounded-xl border border-grey-highlight bg-white p-5 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)"
        @click="openViewAppointment = nextAppointment.id"
      >
        <p class="text-base font-medium text-[#3b4854]">{{ nextAppointment.title }}</p>

        <div class="flex items-center gap-2 text-[14px] text-[#777f87]">
          <!-- Calendar icon -->
          <IconCalendarSmall class="size-[17px] shrink-0 text-[#777f87]" />
          {{ moment(nextAppointment.date).format('DD MMMM YYYY') }}
        </div>

        <div class="flex items-center gap-2 text-[14px] text-[#777f87]">
          <!-- Clock icon -->
          <IconClockSmall class="size-[17px] shrink-0 text-[#777f87]" />
          {{ nextAppointment.startTime }} - {{ nextAppointment.endTime }} น.
        </div>

        <div class="flex items-center gap-2 text-[14px] text-[#777f87]">
          <!-- Map icon -->
          <IconMapSmall class="size-[17px] shrink-0 text-[#777f87]" />
          {{ nextAppointment.court || '-' }}
        </div>

        <!-- <div class="pt-1">
          <span
            class="inline-block px-3 py-1 rounded-full text-[14px] bg-[#def3ff] text-[#16b1ff] border border-[#b1e5ff]"
          >
            กำลังจะมาถึง
          </span>
        </div> -->
      </div>

      <div
        v-else
        class="rounded-xl border border-grey-highlight bg-white p-5 text-center text-grey text-[15px]"
        style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)"
      >
        ไม่มีนัดหมายที่กำลังจะมาถึง
      </div>
    </div>
    <!-- ===== END SIDEBAR ===== -->

    <!-- ===== MAIN CALENDAR ===== -->
    <div class="border border-grey-highlight min-h-[800px] flex-1 overflow-auto flex flex-col">
      <!-- Calendar Header -->
      <div class="p-4 flex justify-between items-center border-b-2 border-grey-highlight">
        <div class="flex gap-4 items-center">
          <button @click="prevMonth()" class="text-grey">
            <iconCaretRight class="rotate-180 size-[15px]" />
          </button>
          <button @click="nextMonth()" class="text-grey">
            <iconCaretRight class="size-[15px]" />
          </button>
          <p class="text-[22px] font-medium">
            {{ months[form.currentMonth - 1] }} {{ form.currentYear }}
          </p>
        </div>

        <div class="flex gap-4">
          <button
            class="py-2 px-8 rounded-full bg-neutral-50 text-grey"
            :class="{
              'bg-primary-highlight !text-black font-semibold':
                form.currentDay === new Date().getDate() &&
                form.currentMonth === new Date().getMonth() + 1 &&
                form.currentYear === new Date().getFullYear(),
            }"
            @click="
              () => {
                form.currentDay = new Date().getDate()
                form.currentMonth = new Date().getMonth() + 1
                form.currentYear = new Date().getFullYear()
              }
            "
          >
            วันนี้
          </button>
          <div class="flex">
            <button
              class="bg-neutral-50 text-grey py-2 w-[80px] rounded-l-full"
              :class="{
                'bg-primary-highlight !text-black font-semibold': form.defaultView === 'day',
              }"
              @click="form.defaultView = 'day'"
            >
              วัน
            </button>
            <button
              class="bg-neutral-50 text-grey py-2 w-[95px]"
              :class="{
                'bg-primary-highlight !text-black font-semibold': form.defaultView === 'week',
              }"
              @click="form.defaultView = 'week'"
            >
              สัปดาห์
            </button>
            <button
              class="bg-neutral-50 text-grey py-2 w-[80px] rounded-r-full"
              :class="{
                'bg-primary-highlight !text-black font-semibold': form.defaultView === 'month',
              }"
              @click="form.defaultView = 'month'"
            >
              เดือน
            </button>
          </div>
        </div>
      </div>

      <CalendarCalendar
        v-if="!isLoadingData"
        :data="data"
        :options="calendarOptions"
        :appointments="appointmentsMap"
        :notes="mockNotes"
        @editNote="(e) => (openEditNote = e)"
        @deleteNote="(e) => (openDeleteNote = e)"
        @editAppointment="handleEditFromCalendar"
        @refresh="loadCalendarData"
      />
      <div v-else class="min-h-[800px] flex items-center justify-center">
        <baseLoading />
      </div>
    </div>
    <!-- ===== END MAIN CALENDAR ===== -->
  </section>

  <!-- Add / Edit Appointment Modal -->
  <base-modal
    v-if="openAddAppointment || openEditAppointment"
    open
    :title="openEditAppointment ? 'แก้ไขนัดหมาย' : 'เพิ่มนัดหมาย'"
    subtitle="คุณสามารถเพิ่มรายการนัดหมายที่เกี่ยวข้องกับคดีได้"
    action-button
    :action-text="openEditAppointment ? 'บันทึก' : 'เพิ่ม'"
    :disabled="isSubmittingAppointment"
    @close="clearAppointmentForm()"
    @primary="openEditAppointment ? handleEditAppointment() : handleAddAppointment()"
  >
    <!-- หัวข้อนัดหมาย -->
    <base-text-input
      v-model="appointmentForm.title"
      label="หัวข้อนัดหมาย"
      required
      placeholder="เช่น สืบพยานโจทย์"
      :error="appointmentErrors.title"
    />

    <!-- ประเภท -->
    <div class="flex flex-col mt-2">
      <label class="text-[15px]">ประเภท</label>
      <base-dropdown-multi-select
        :model-value="appointmentForm.type"
        @update:model-value="
          (v: string | number | (string | number)[] | null) =>
            (appointmentForm.type = v as AppointmentType)
        "
        :options="
          appointmentTypes
            .filter((t) => t.key.toString() !== 'all')
            .map((t) => ({ value: t.key, name: t.label }))
        "
        placeholder="เลือกประเภท"
      />
    </div>

    <!-- วันที่ + เวลาเริ่ม + เวลาสิ้นสุด -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="flex flex-col mt-2">
        <label class="text-[15px]">วันที่ <span class="text-danger">*</span></label>
        <base-datepicker-label
          :model-value="appointmentForm.date ? new Date(appointmentForm.date) : null"
          @update:model-value="
            (v: Date | Date[] | string | null) =>
              (appointmentForm.date = v ? moment(v as Date).format('YYYY-MM-DD') : '')
          "
          placeholder="วว/ดด/ปปปป"
          :error="appointmentErrors.date"
        />
      </div>
      <div class="flex flex-col mt-2">
        <label class="text-[15px]">เวลาเริ่ม <span class="text-danger">*</span></label>
        <base-datepicker-label
          :model-value="timeStringToDate(appointmentForm.startTime)"
          @update:model-value="
            (v: Date | Date[] | string | null) =>
              (appointmentForm.startTime = v ? moment(v as Date).format('HH:mm') : '')
          "
          :time-only="true"
          placeholder="00:00"
          :error="appointmentErrors.startTime"
        />
      </div>
      <div class="flex flex-col mt-2">
        <label class="text-[15px]">เวลาสิ้นสุด <span class="text-danger">*</span></label>
        <base-datepicker-label
          :model-value="timeStringToDate(appointmentForm.endTime)"
          @update:model-value="
            (v: Date | Date[] | string | null) =>
              (appointmentForm.endTime = v ? moment(v as Date).format('HH:mm') : '')
          "
          :time-only="true"
          placeholder="00:00"
          :error="appointmentErrors.endTime"
        />
      </div>
    </div>

    <!-- สถานที่นัดหมาย -->
    <base-text-input
      v-model="appointmentForm.court"
      label="สถานที่นัดหมาย"
      placeholder="เช่น ศาลแพ่งกรุงเทพใต้ อาคาร A ห้อง 5"
    />

    <!-- คดีที่เกี่ยวข้อง -->
    <div class="flex flex-col mt-2">
      <label class="text-[15px]">คดีที่เกี่ยวข้อง</label>
      <base-dropdown-multi-select
        :model-value="appointmentForm.case_id"
        @update:model-value="
          (v: string | number | (string | number)[] | null) =>
            (appointmentForm.case_id = v ? Number(v) : null)
        "
        :options="caseOptions"
        placeholder="เลือกคดีที่เกี่ยวข้อง"
      />
    </div>

    <!-- รายละเอียด -->
    <base-textarea v-model="appointmentForm.remark" label="รายละเอียด" placeholder="กรอกหากมี" />
  </base-modal>

  <!-- View Appointment Detail Modal -->
  <base-modal
    v-if="openViewAppointment && !isLoadingViewAppointment"
    open
    title="รายละเอียดการนัดหมาย"
    @close="openViewAppointment = 0"
  >
    <div class="px-1 pb-2 space-y-4 mx-4">
      <hr class="border-grey-highlight" />

      <p class="text-[18px]">{{ viewAppointmentData?.topic }}</p>

      <!-- Date + Time -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconCalendarSmall class="size-[15px] shrink-0" />
            วันที่นัดหมาย
          </p>
          <p class="text-[16px] text-[#3b4854] mt-1">
            {{
              moment(viewAppointmentData?.date).isValid()
                ? moment(viewAppointmentData?.date).locale('th').format('DD MMMM YYYY')
                : '-'
            }}
          </p>
        </div>
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconClockSmall class="size-[15px] shrink-0" />
            เวลานัดหมาย
          </p>
          <p class="text-[16px] text-[#3b4854] mt-1">
            {{ viewAppointmentData?.start_time?.slice(0, 5) || '-' }} -
            {{ viewAppointmentData?.end_time?.slice(0, 5) || '-' }} น.
          </p>
        </div>
      </div>

      <!-- Location -->
      <div>
        <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
          <IconMapSmall class="size-[15px] shrink-0" />
          สถานที่นัดหมาย
        </p>
        <p
          class="text-[16px] mt-1"
          :class="viewAppointmentData?.location ? 'text-[#3b4854]' : 'text-[#aeb3b9]'"
        >
          {{ viewAppointmentData?.location || 'ไม่ได้ระบุ' }}
        </p>
      </div>

      <hr class="border-grey-highlight" />

      <!-- Creator + Case -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconUserV3 class="size-[15px] shrink-0" />
            ผู้สร้างนัดหมาย
          </p>
          <p class="text-[16px] text-[#3b4854] mt-1">
            {{ viewAppointmentData?.insert_username || '-' }}
          </p>
        </div>
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconCopy class="size-[15px] shrink-0" />
            คดีที่เกี่ยวข้อง
          </p>
          <p
            class="text-[16px] mt-1"
            :class="viewAppointmentData?.case_id ? 'text-[#3b4854]' : 'text-[#aeb3b9]'"
          >
            {{
              viewAppointmentData?.case_id
                ? viewAppointmentData?.case?.name || String(viewAppointmentData?.case_id)
                : 'ไม่มีคดีที่เกี่ยว'
            }}
          </p>
        </div>
      </div>

      <hr class="border-grey-highlight" />

      <!-- Action buttons -->
      <div
        v-if="p.is_edit_appointment || p.is_delete_appointment"
        class="flex justify-between gap-3"
      >
        <button
          v-if="p.is_edit_appointment"
          class="flex items-center gap-2 justify-center bg-[#0f182a] text-white rounded-lg px-4 max-w-[190px] w-full py-3 text-[15px] font-medium hover:bg-gray-800 transition-colors"
          @click="openEditFromView()"
        >
          <IconPencil class="size-[18px]" />
          แก้ไขข้อมูล
        </button>
        <button
          v-if="p.is_delete_appointment"
          class="size-[50px] flex items-center justify-center bg-[#ffe3e0] rounded-lg hover:bg-red-200 transition-colors shrink-0"
          @click="
            () => {
              openDeleteAppointment = openViewAppointment
              openViewAppointment = 0
            }
          "
        >
          <IconTrash class="size-[20px] text-[#ff725d]" />
        </button>
      </div>
    </div>
  </base-modal>

  <!-- Delete Appointment Modal -->
  <base-modal
    v-if="openDeleteAppointment"
    open
    title="ลบนัดหมาย"
    subtitle="การลบนัดหมายจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบนัดหมายนี้?"
    action-button
    action-text="ลบ"
    variant="danger"
    @close="openDeleteAppointment = 0"
    @primary="handleDeleteAppointment()"
  />

  <!-- Add / Edit Note Modal -->
  <base-modal
    v-if="openAddNote || openEditNote"
    open
    :title="openAddNote ? 'เพิ่มโน้ต' : 'แก้ไขโน้ต'"
    action-button
    :action-text="openAddNote ? 'เพิ่ม' : 'แก้ไข'"
    @close="clearNoteForm()"
    @primary="handleSubmitNote()"
  >
    <base-text-input
      v-model="noteForm.date"
      type="date"
      label="วันที่"
      labelWidth="120px"
      required
      :error="noteErrors.date"
    />
    <base-textarea
      v-model="noteForm.note"
      label="รายละเอียด"
      labelWidth="120px"
      placeholder="กรอกหากมี"
      required
      :error="noteErrors.note"
    />
  </base-modal>

  <!-- Delete Note Modal -->
  <base-modal
    v-if="openDeleteNote"
    open
    title="ลบโน้ต"
    subtitle="การลบโน้ตจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบโน้ตนี้?"
    action-button
    action-text="ลบ"
    variant="danger"
    @close="clearNoteForm()"
    @primary="handleDeleteNote()"
  />
</template>
