<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import moment from 'moment/min/moment-with-locales'
import { API } from '@/api'
import { push } from 'notivue'
import IconFilePdf from '@/components/icons/IconFilePdf.vue'
import IconFilePng from '@/components/icons/IconFilePng.vue'
import IconFileXls from '@/components/icons/IconFileXls.vue'
import IconFileDoc from '@/components/icons/IconFileDoc.vue'
import { usePermissions } from '@/composables/usePermissions'
moment.locale('th')

const { p } = usePermissions()

const emit = defineEmits<{ refresh: [] }>()

const props = defineProps<{
  caseId: number
  files: {
    id: number
    name: string
    size: string
    type: string
    file_url: string
    insert_date_time: string
    insert_username: string
  }[]
}>()

type CaseFile = {
  id: number
  name: string
  type: string
  size: string
  fileType: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
}

const formatBytes = (bytes: string | number) => {
  const b = parseFloat(String(bytes))
  if (!b || b <= 0) return '-'
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB'
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const resolveFileType = (mimeType: string, name: string) => {
  if (mimeType?.startsWith('image/')) return 'png'
  if (mimeType === 'application/pdf' || name?.toLowerCase().endsWith('.pdf')) return 'pdf'
  if (
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('excel') ||
    name?.toLowerCase().endsWith('.xls') ||
    name?.toLowerCase().endsWith('.xlsx')
  )
    return 'xls'
  if (
    mimeType?.includes('word') ||
    mimeType?.includes('document') ||
    name?.toLowerCase().endsWith('.doc') ||
    name?.toLowerCase().endsWith('.docx')
  )
    return 'doc'
  return 'other'
}

const mapFile = (f: (typeof props.files)[0]): CaseFile => ({
  id: f.id,
  name: f.name,
  type: f.type?.split('/').pop()?.toUpperCase() || 'FILE',
  size: formatBytes(f.size),
  fileType: resolveFileType(f.type, f.name),
  fileUrl: f.file_url,
  uploadedAt: moment(f.insert_date_time).isValid()
    ? moment(f.insert_date_time).format('DD MMM YYYY')
    : '-',
  uploadedBy: f.insert_username || '-',
})

const caseFiles = ref<CaseFile[]>([])

watch(
  () => props.files,
  (val) => {
    caseFiles.value = val.map(mapFile)
  },
  { immediate: true },
)

const openUploadModal = ref(false)
const formSubmitted = ref(false)
const isSubmitting = ref(false)

const uploadForm = reactive({
  fileName: '',
  description: '',
  ocrEnabled: false,
  selectedFile: null as File | null,
})

const resetUploadForm = () => {
  uploadForm.fileName = ''
  uploadForm.description = ''
  uploadForm.ocrEnabled = false
  uploadForm.selectedFile = null
}

const onDropZoneFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadForm.selectedFile = file
  if (!uploadForm.fileName) uploadForm.fileName = file.name.replace(/\.[^.]+$/, '')
  ;(e.target as HTMLInputElement).value = ''
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  uploadForm.selectedFile = file
  if (!uploadForm.fileName) uploadForm.fileName = file.name.replace(/\.[^.]+$/, '')
}

const handleSaveUpload = async () => {
  formSubmitted.value = true
  if (!uploadForm.selectedFile || !uploadForm.fileName) return
  isSubmitting.value = true
  const f = uploadForm.selectedFile
  const ext = f!.name.split('.').pop()?.toLowerCase() ?? ''
  await API('specific\\lawfirm\\cases', 'insertFile', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    case_id: props.caseId,
    name: uploadForm.fileName.trim() + (ext ? `.${ext}` : ''),
    description: uploadForm.description,
    file: f,
  })
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `เพิ่มไฟล์ : ${uploadForm.fileName}`,
          type: 'cases',
        })
        push.success('อัปโหลดไฟล์สำเร็จ!')
        resetUploadForm()
        openUploadModal.value = false
        emit('refresh')
      } else {
        push.error('อัปโหลดไฟล์ไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const openDeleteFileModal = ref(false)
const deletingFileId = ref<number | null>(null)

const confirmDeleteFile = (id: number) => {
  deletingFileId.value = id
  openDeleteFileModal.value = true
}

const removeFile = async () => {
  isSubmitting.value = true
  await API('specific\\lawfirm\\cases', 'deleteFile', { file_id: deletingFileId.value })
    .then(async (res) => {
      if (res.response_status) {
        const fileName = caseFiles.value.find((f) => f.id === deletingFileId.value)?.name || ''
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: 'แก้ไขข้อมูลคดี',
          description: `ลบไฟล์ : ${fileName}`,
          type: 'cases',
        })
        push.success('ลบไฟล์สำเร็จ!')
        openDeleteFileModal.value = false
        deletingFileId.value = null
        emit('refresh')
      } else {
        push.error('ลบไฟล์ไม่สำเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      push.error('เกิดข้อผิดพลาด: ' + err.message)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const fileTypeLabel = (f: File | null) =>
  f
    ? f.type.startsWith('image/')
      ? 'รูปภาพ'
      : (f.name.split('.').pop()?.toUpperCase() ?? 'FILE')
    : 'ยังไม่ได้อัปโหลด'

const fileSizeLabel = (f: File | null) => (f ? formatBytes(f.size) : 'ยังไม่ได้อัปโหลด')
</script>

<template>
  <div class="space-y-[20px]">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[22px] text-[#3b4854]">ไฟล์ประกอบคดี / เอกสารแนบ</p>
        <p class="text-[16px] text-[#777f87]">
          บันทึกรายละเอียดเคส และรายละเอียดผู้ติดต่อหรือผู้เกี่ยวข้อง
        </p>
      </div>
      <button
        v-if="p.is_edit_case"
        class="flex cursor-pointer items-center gap-[10px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
        @click="
          () => {
            resetUploadForm()
            formSubmitted = false
            openUploadModal = true
          }
        "
      >
        <IconUploadV2 class="w-[20px]" />
        อัปโหลดไฟล์
      </button>
    </div>

    <div class="space-y-[10px]">
      <div
        v-for="file in caseFiles"
        :key="file.id"
        class="flex items-center gap-[20px] rounded-[20px] border border-[#e7e8e9] bg-white px-[20px] py-[20px]"
      >
        <!-- File icon -->
        <div
          class="flex size-[70px] shrink-0 items-center justify-center rounded-[10px]"
          :class="{
            'bg-[#ffe3e0]': file.fileType === 'pdf',
            'bg-[#e5f9f8]': file.fileType === 'png',
            'bg-[#ddfaec]': file.fileType === 'xls',
            'bg-[#e3f0ff]': file.fileType === 'doc',
            'bg-[#E0DFE3]': file.fileType === 'other',
          }"
        >
          <IconFilePdf v-if="file.fileType === 'pdf'" class="w-[32px]" />
          <IconFilePng v-else-if="file.fileType === 'png'" class="w-[32px]" />
          <IconFileXls v-else-if="file.fileType === 'xls'" class="w-[32px]" />
          <IconFileDoc v-else-if="file.fileType === 'doc'" class="w-[32px]" />
          <IconOtherFile v-else class="w-[32px]" />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <p class="text-[16px] text-[#3b4854] mb-[4px]">{{ file.name }}</p>
          <div class="flex items-center gap-[6px] text-[14px] text-[#b2b6bb]">
            <span class="uppercase">{{ file.name.split('.').pop() }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block"></span>
            <span>{{ file.size }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block"></span>
            <span>{{ file.uploadedAt }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block"></span>
            <span>โดย : {{ file.uploadedBy }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-[8px] shrink-0">
          <a
            v-if="file.fileUrl && p.is_edit_case"
            :href="file.fileUrl.replace(/^http:\/\//, 'https://')"
            :download="file.name"
            target="_blank"
            class="flex size-[40px] items-center justify-center rounded-full bg-white hover:bg-[#f4f4f4] transition-colors"
          >
            <IconUploadV2 class="w-[20px] text-[#777F87] rotate-180" />
          </a>
          <button
            v-if="p.is_edit_case"
            @click="confirmDeleteFile(file.id)"
            class="flex size-[40px] items-center justify-center rounded-full bg-white hover:bg-[#fff0f0] transition-colors"
          >
            <svg width="18" height="20" viewBox="0 0 20 22" fill="none">
              <path
                d="M18.831 4.971H15.808V3.808A2.557 2.557 0 0 0 13.25 1.25H9.529A2.557 2.557 0 0 0 6.971 3.808V4.971H3.948a.7.7 0 1 0 0 1.4H4.18v11.4A3.49 3.49 0 0 0 7.669 21.25H15.11A3.49 3.49 0 0 0 18.6 17.762V6.366h.233a.7.7 0 0 0 0-1.4ZM8.366 3.808A1.163 1.163 0 0 1 9.529 2.645H13.25a1.163 1.163 0 0 1 1.163 1.163V4.971H8.366ZM17.2 17.762a2.1 2.1 0 0 1-2.093 2.093H7.669a2.1 2.1 0 0 1-2.093-2.093V6.366H17.2ZM10.227 9.39v7.442a.7.7 0 0 1-1.4 0V9.39a.7.7 0 1 1 1.4 0Zm3.721 0v7.442a.7.7 0 0 1-1.4 0V9.39a.7.7 0 0 1 1.4 0Z"
                fill="#777f87"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="caseFiles.length === 0"
        class="flex items-center justify-center rounded-[20px] border border-dashed border-[#e7e8e9] py-[60px] text-[16px] text-[#8e9aab]"
      >
        ยังไม่มีไฟล์แนบ
      </div>
    </div>
  </div>

  <base-modal
    v-if="openDeleteFileModal"
    open
    title="ลบไฟล์"
    subtitle="คุณต้องการลบไฟล์นี้ใช่หรือไม่?"
    size="sm"
    action-button
    action-text="ลบ"
    variant="danger"
    :showBody="false"
    :disabled="isSubmitting"
    @primary="removeFile"
    @close="openDeleteFileModal = false"
  />

  <base-modal
    v-if="openUploadModal"
    open
    title="อัปโหลดไฟล์"
    subtitle="เพิ่มรายละเอียดไฟล์เพื่อให้การค้นหาไฟล์ของคุณง่ายขึ้น"
    size="smm"
    action-button
    positionAction="left"
    action-text="บันทึก"
    variant="black"
    :disabled="isSubmitting"
    @primary="handleSaveUpload"
    @close="
      () => {
        resetUploadForm()
        formSubmitted = false
        openUploadModal = false
      }
    "
  >
    <!-- Drop zone -->
    <div
      class="mb-[4px] flex flex-col items-center justify-center gap-[10px] rounded-[6px] border border-dashed py-[30px]"
      :class="formSubmitted && !uploadForm.selectedFile ? 'border-danger' : 'border-[#e7e8e9]'"
      @dragover.prevent
      @drop="onDrop"
    >
      <p class="text-[16px] text-[#3b4854]">
        {{ uploadForm.selectedFile ? uploadForm.selectedFile.name : 'ลากและวางไฟล์ประกอบที่นี่' }}
      </p>
      <p class="text-[14px] text-[#aeb3b9]">หรือ</p>
      <label
        class="cursor-pointer rounded-[8px] bg-[#edeef0] px-[20px] py-[10px] text-[14px] text-[#777f87] hover:bg-[#e0e1e3]"
      >
        เลือกไฟล์
        <input type="file" class="hidden" @change="onDropZoneFile" />
      </label>
    </div>
    <p v-if="formSubmitted && !uploadForm.selectedFile" class="mb-[16px] text-[12px] text-danger">
      กรุณาเลือกไฟล์
    </p>
    <div v-else class="mb-[20px]"></div>

    <!-- File name -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="uploadForm.fileName"
        label="ชื่อไฟล์"
        labelType="vertical"
        placeholder="เช่น สัญญาซื้อขาย"
        required
        :error="formSubmitted && !uploadForm.fileName ? 'กรุณากรอกชื่อไฟล์' : null"
      />
    </div>

    <!-- Description -->
    <div class="mb-[20px]">
      <base-textarea
        v-model="uploadForm.description"
        label="คำอธิบาย"
        labelType="vertical"
        placeholder="รายละเอียดของเอกสาร"
      />
    </div>

    <!-- OCR toggle -->
    <div
      class="mb-[20px] flex items-center gap-[15px] rounded-[10px] bg-[#f3f3f4] px-[20px] py-[16px]"
    >
      <button
        type="button"
        disabled
        class="relative flex h-[30px] w-[55px] shrink-0 items-center rounded-full transition-colors"
        :class="uploadForm.ocrEnabled ? 'bg-[#0f182a]' : 'bg-[#e7e8e9]'"
        @click="uploadForm.ocrEnabled = !uploadForm.ocrEnabled"
      >
        <span
          class="absolute size-[26px] rounded-full bg-white shadow transition-transform"
          :class="uploadForm.ocrEnabled ? 'translate-x-[27px]' : 'translate-x-[2px]'"
        />
      </button>
      <div>
        <p class="text-[16px] text-[#3b4854]">แสกน OCR</p>
        <p class="text-[14px] text-[#777f87]">สแกนข้อความจากไฟล์เอกสารโดยอัตโนมัติ</p>
      </div>
    </div>

    <!-- Additional details -->
    <div>
      <p class="mb-[15px] text-[18px] text-[#3b4854]">รายละเอียดเพิ่มเติม</p>
      <div class="flex items-center py-[10px]">
        <span class="text-[16px] text-[#777f87] w-[170px]">ประเภทไฟล์</span>
        <span class="text-[16px] text-[#aeb3b9]">{{ fileTypeLabel(uploadForm.selectedFile) }}</span>
      </div>

      <div class="flex items-center py-[10px]">
        <span class="text-[16px] text-[#777f87] w-[170px]">ขนาดไฟล์</span>
        <span class="text-[16px] text-[#aeb3b9]">{{ fileSizeLabel(uploadForm.selectedFile) }}</span>
      </div>
      <div class="border-t border-dashed border-[#e7e8e9]" />
    </div>
  </base-modal>
</template>
