<script setup lang="ts">
import { ref, watch } from 'vue'
import { API } from '@/api'
import { push } from 'notivue'
import moment from 'moment/min/moment-with-locales'
import { usePermissions } from '@/composables/usePermissions'
moment.locale('th')

const { p } = usePermissions()

const props = defineProps<{
  caseId: number
  details: {
    id: number
    case_id: number
    description: string
    insert_date_time: string
    insert_username: string
    update_date_time: string
    update_user_id: number
    update_username: string
  }[]
}>()
const emit = defineEmits<{ refresh: [] }>()

const parseDescription = (raw: string): string => {
  const match = raw?.match(/s:\d+:"details";s:\d+:"([\s\S]*?)";/)
  return match ? match[1] : raw || ''
}

const notes = ref<{ id: number; text: string; date: string; by: string }[]>([])

watch(
  () => props.details,
  (val) => {
    notes.value = val.map((d) => ({
      id: d.id,
      text: parseDescription(d.description),
      date: moment(d.insert_date_time).isValid()
        ? moment(d.insert_date_time).format('DD MMM YYYY')
        : '-',
      by: d.insert_username || '-',
    }))
  },
  { immediate: true },
)

const isSubmitting = ref(false)
const newNote = ref('')

const addNote = async () => {
  if (!newNote.value.trim()) return
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'insertDetail', {
    case_id: props.caseId,
    detail: newNote.value.trim(),
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `เพิ่มบันทึก : ${newNote.value.trim()}`,
          type: 'cases',
        })
        push.success('เพิ่มบันทึกสำเร็จ!')
        newNote.value = ''
        emit('refresh')
      } else {
        push.error('เพิ่มบันทึกไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openDeleteNoteModal = ref(false)
const editingNoteId = ref<number | null>(null)

const confirmDeleteNote = (id: number) => {
  editingNoteId.value = id
  openDeleteNoteModal.value = true
}

const removeNote = async () => {
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'deleteDetail', {
    id: editingNoteId.value,
  })
    .then(async (res) => {
      if (res.response_status) {
        const noteText = notes.value.find((n) => n.id === editingNoteId.value)?.text || ''
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `ลบบันทึก : ${noteText}`,
          type: 'cases',
        })
        push.success('ลบบันทึกสำเร็จ!')
        openDeleteNoteModal.value = false
        editingNoteId.value = null
        emit('refresh')
      } else {
        push.error('ลบบันทึกไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openEditNoteModal = ref(false)
const editNoteText = ref('')

const openEditNote = (note: (typeof notes.value)[number]) => {
  editingNoteId.value = note.id
  editNoteText.value = note.text
  openEditNoteModal.value = true
}

const handleSaveNote = async () => {
  if (!editNoteText.value.trim()) return
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'updateDetail', {
    case_details: editingNoteId.value,
    detail: editNoteText.value.trim(),
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `แก้ไขบันทึก : ${editNoteText.value.trim()}`,
          type: 'cases',
        })
        push.success('แก้ไขบันทึกสำเร็จ!')
        openEditNoteModal.value = false
        editingNoteId.value = null
        emit('refresh')
      } else {
        push.error('แก้ไขบันทึกไม่สำเร็จ!\n' + res.response_message)
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
    <!-- Input section -->
    <div class="rounded-[20px] bg-[#f4f4f4] p-[25px] space-y-[15px]">
      <p class="text-[20px] text-[#3b4854]">บันทึกเพิ่มเติม</p>
      <textarea
        v-model="newNote"
        class="w-full h-[100px] rounded-[10px] border border-[#e7e8e9] bg-white px-[15px] py-[15px] text-[16px] text-[#3b4854] placeholder-[#aeb3b9] resize-none focus:outline-none"
        placeholder="เขียนบันทึกที่เกี่ยวข้องกับคดี..."
      ></textarea>
      <div class="flex justify-end">
        <button
          v-if="p.is_edit_case"
          @click="addNote"
          :disabled="!newNote.trim() || isSubmitting"
          class="rounded-[8px] bg-[#0f182a] px-[25px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          บันทึก
        </button>
      </div>
    </div>

    <!-- Note cards -->
    <div class="space-y-[10px]">
      <div
        v-for="note in notes"
        :key="note.id"
        class="flex items-center gap-[16px] rounded-[20px] border border-[#e7e8e9] bg-white px-[20px] py-[18px]"
      >
        <!-- Note content -->
        <div class="flex-1 min-w-0">
          <p class="text-[16px] text-[#3b4854] mb-[6px]">{{ note.text }}</p>
          <div class="flex items-center gap-[8px] text-[14px] text-[#b2b6bb]">
            <span>{{ note.date }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block"></span>
            <span>โดย : {{ note.by }}</span>
          </div>
        </div>

        <!-- Edit button -->
        <button
          v-if="p.is_edit_case"
          class="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-white hover:bg-[#f4f4f4] transition-colors"
          @click="openEditNote(note)"
        >
          <IconPencil class="w-[18px] text-[#777F87]" />
        </button>

        <!-- Delete button -->
        <button
          v-if="p.is_edit_case"
          @click="confirmDeleteNote(note.id)"
          class="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-white hover:bg-[#fff0f0] transition-colors"
        >
          <IconTrash class="w-[16px] text-[#777F87]" />
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="notes.length === 0"
        class="flex items-center justify-center rounded-[20px] border border-dashed border-[#e7e8e9] py-[60px] text-[16px] text-[#8e9aab]"
      >
        ยังไม่มีบันทึก
      </div>
    </div>
  </div>

  <base-modal
    v-if="openDeleteNoteModal"
    open
    title="ลบบันทึก"
    subtitle="คุณต้องการลบบันทึกนี้ใช่หรือไม่?"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isSubmitting"
    @primary="removeNote"
    @close="openDeleteNoteModal = false"
  />

  <base-modal
    v-if="openEditNoteModal"
    open
    title="แก้ไขบันทึกเพิ่มเติม"
    subtitle="บันทึกข้อมูลทั่วไปที่เกี่ยวข้องกับคดี"
    size="smm"
    action-button
    action-text="บันทึก"
    variant="black"
    :disabled="!editNoteText.trim() || isSubmitting"
    @primary="handleSaveNote"
    @close="openEditNoteModal = false"
  >
    <base-textarea v-model="editNoteText" label="บันทึกเพิ่มเติม" labelType="vertical" :rows="8" />
  </base-modal>
</template>
