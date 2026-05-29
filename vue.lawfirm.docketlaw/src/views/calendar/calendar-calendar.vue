<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
// @ts-expect-error TODO
import Calendar from '@toast-ui/calendar'
import '@toast-ui/calendar/dist/toastui-calendar.min.css'
import moment from 'moment/min/moment-with-locales'
import { API } from '@/api'
import { push } from 'notivue'
import IconCalendarSmall from '@/components/icons/IconCalendarSmall.vue'
import IconClockSmall from '@/components/icons/IconClockSmall.vue'
import IconMapSmall from '@/components/icons/IconMapSmall.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import IconUserV3 from '@/components/icons/IconUserV3.vue'
import IconCopy from '@/components/icons/IconCopy.vue'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const calendarRef = ref<HTMLElement | null>(null)
const calendarInstance = ref()

const openAppointment = ref(0)
const openNote = ref(0)
const isLoading = ref(false)

const appointmentData = ref<any>()
const noteData = ref<any>()

const props = withDefaults(
  defineProps<{
    data: any[]
    options: {
      currentDay: number
      currentMonth: number
      currentYear: number
      defaultView: string
    }
    appointments: Record<number, any>
    notes: Record<number, any>
  }>(),
  {},
)

const emits = defineEmits(['editNote', 'deleteNote', 'refresh', 'editAppointment'])

const isDeleting = ref(false)
const openConfirmDelete = ref(false)
const deletingAppointmentId = ref(0)

const deleteAppointment = async () => {
  isDeleting.value = true
  await API('specific\\lawfirm\\lawyer_calendar', 'delete', { id: deletingAppointmentId.value })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'ลบนัดหมาย',
          description: `หัวข้อ : ${appointmentData.value?.topic || ''}`,
          type: 'calendar',
        })
        openConfirmDelete.value = false
        openAppointment.value = 0
        push.success('ลบข้อมูลนัดหมายสําเร็จ!')
        emits('refresh')
      }
    })
    .catch(() => {})
    .finally(() => {
      isDeleting.value = false
    })
}


const createCalendar = () => {
  const currentDate = `${props.options.currentYear.toString().padStart(4, '0')}-${props.options.currentMonth.toString().padStart(2, '0')}-${props.options.currentDay.toString().padStart(2, '0')}`
  if (calendarRef.value) {
    calendarInstance.value = new Calendar(calendarRef.value, {
      defaultView: props.options.defaultView,
      taskView: false,
      scheduleView: ['allday', 'time'],
      useFormPopup: false,
      useDetailPopup: false,
      isReadOnly: true,
      calendars: [{ id: '1', name: 'Default' }],
      week: {
        dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
        startDayOfWeek: 1,
      },
      month: {
        dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
        startDayOfWeek: 1,
      },
      template: {
        monthGridHeader: function (model: any) {
          const isToday = model.date === currentDate
          return `<span style="${isToday ? 'color:#ffffff;background-color:#3872e1;' : 'color:black;'} text-align:center;padding:2px 6px;margin:8px;border-radius:999px;">${+model.date.split('-')[2]}</span>`
        },
      },
    })

    calendarInstance.value.setDate(new Date(currentDate))

    calendarInstance.value.createEvents(
      props.data.map((event: any) => ({
        ...event,
        start: moment(event.start).isValid() ? moment(event.start) : null,
        end: moment(event.end).isValid() ? moment(event.end) : null,
      })),
    )

    // @ts-expect-error TODO
    calendarInstance.value.on('clickEvent', ({ event }) => {
      const parts = event.id.split('-')
      const prefix = parts[0]
      const id = parts[parts.length - 1]
      if (prefix === 'appointment' || prefix === 'schedule') openAppointment.value = +id
      if (prefix === 'note') openNote.value = +id
    })
  }
}

watch(openAppointment, async () => {
  if (openAppointment.value) {
    isLoading.value = true
    await API('specific\\lawfirm\\lawyer_calendar', 'getByID', { id: openAppointment.value })
      .then((res) => {
        if (res.response_status) {
          appointmentData.value = res.response_data
        }
      })
      .catch(() => {})
      .finally(() => {
        isLoading.value = false
      })
  }
})

watch(openNote, async () => {
  if (openNote.value) {
    isLoading.value = true
    await new Promise((r) => setTimeout(r, 200))
    noteData.value = props.notes[openNote.value]
    isLoading.value = false
  }
})

onMounted(() => createCalendar())

onBeforeUnmount(() => {
  if (calendarInstance.value) calendarInstance.value.destroy()
})

watch(
  () => props.options,
  () => {
    if (calendarInstance.value) calendarInstance.value.destroy()
    createCalendar()
  },
  { deep: true },
)
</script>

<template>
  <div id="calendarId" ref="calendarRef"></div>

  <!-- Appointment Detail Modal -->
  <base-modal
    v-if="openAppointment && !isLoading"
    open
    title="รายละเอียดการนัดหมาย"
    @close="openAppointment = 0"
  >
    <div class="px-1 pb-2 space-y-4 mx-4">
      <hr class="border-grey-highlight" />

      <p class="text-[18px]">{{ appointmentData?.topic }}</p>

      <!-- Date + Time -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconCalendarSmall class="size-[15px] shrink-0" />
            วันที่นัดหมาย
          </p>
          <p class="text-[16px] text-[#3b4854] mt-1">
            {{
              moment(appointmentData?.date).isValid()
                ? moment(appointmentData?.date).locale('th').format('DD MMMM YYYY')
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
            {{ appointmentData?.start_time?.slice(0, 5) || '-' }} -
            {{ appointmentData?.end_time?.slice(0, 5) || '-' }} น.
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
          :class="appointmentData?.location ? 'text-[#3b4854]' : 'text-[#aeb3b9]'"
        >
          {{ appointmentData?.location || 'ไม่ได้ระบุ' }}
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
            {{ appointmentData?.insert_username || '-' }}
          </p>
        </div>
        <div>
          <p class="text-[14px] text-[#777f87] flex items-center gap-1.5">
            <IconCopy class="size-[15px] shrink-0" />
            คดีที่เกี่ยวข้อง
          </p>
          <p
            class="text-[16px] mt-1"
            :class="appointmentData?.case_id ? 'text-[#3b4854]' : 'text-[#aeb3b9]'"
          >
            {{
              appointmentData?.case_id
                ? appointmentData?.case?.name || String(appointmentData?.case_id)
                : 'ไม่มีคดีที่เกี่ยว'
            }}
          </p>
        </div>
      </div>

      <hr class="border-grey-highlight" />

      <!-- Action buttons -->
      <div v-if="p.is_edit_appointment || p.is_delete_appointment" class="flex justify-between gap-3">
        <button
          v-if="p.is_edit_appointment"
          class="flex items-center gap-2 justify-center bg-[#0f182a] text-white rounded-lg px-4 max-w-[190px] w-full py-3 text-[15px] font-medium hover:bg-gray-800 transition-colors"
          @click="emits('editAppointment', appointmentData); openAppointment = 0"
        >
          <IconPencil class="size-[18px]" />
          แก้ไขข้อมูล
        </button>
        <button
          v-if="p.is_delete_appointment"
          class="size-[50px] flex items-center justify-center bg-[#ffe3e0] rounded-lg hover:bg-red-200 transition-colors shrink-0"
          @click="() => { deletingAppointmentId = openAppointment; openConfirmDelete = true; openAppointment = 0 }"
        >
          <IconTrash class="size-[20px] text-[#ff725d]" />
        </button>
      </div>
    </div>
  </base-modal>

  <!-- Confirm Delete Modal -->
  <base-modal
    v-if="openConfirmDelete"
    open
    title="ลบนัดหมาย"
    subtitle="คุณต้องการลบนัดหมายนี้ใช่หรือไม่?"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isDeleting"
    @primary="deleteAppointment"
    @close="openConfirmDelete = false"
  />

  <!-- Note Detail Modal -->
  <base-modal
    v-if="openNote"
    open
    title="รายละเอียดโน้ต"
    size="lg"
    :action-button="p.is_edit_appointment"
    :button-delete="p.is_delete_appointment"
    action-text="แก้ไข"
    @close="openNote = 0"
    @primary="
      () => {
        emits('editNote', openNote)
        openNote = 0
      }
    "
    @delete="
      () => {
        emits('deleteNote', openNote)
        openNote = 0
      }
    "
  >
    <baseShowData label="วันที่" labelWidth="120px">
      {{ moment(noteData?.date).format('DD MMM YYYY') }}
    </baseShowData>
    <baseShowData label="โน้ต" labelWidth="120px">
      <p class="!whitespace-normal !break-words">{{ noteData?.note }}</p>
    </baseShowData>
    <baseShowData label="ผู้โน้ต" labelWidth="120px">
      {{ noteData?.insert_username }}
    </baseShowData>
  </base-modal>
</template>

<style scoped>
#calendarId {
  width: 100%;
  min-height: 800px;
  box-sizing: border-box;
}
</style>
