<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import IconStorageSearch from '@/components/icons/IconStorageSearch.vue'
import IconCaretDown from '@/components/icons/IconCaretDown.vue'
import IconUploadDoc from '@/components/icons/IconUploadDoc.vue'
import IconFolderCreate from '@/components/icons/IconFolderCreate.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import StorageFileGrid from '@/components/storage/StorageFileGrid.vue'
import type { StorageItem } from '@/components/storage/StorageFileGrid.vue'
import StorageFileDetailPanel from '@/components/storage/StorageFileDetailPanel.vue'
import { API } from '@/api'
import { push } from 'notivue'
import router from '@/router'
import { useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const route = useRoute()

const search = ref('')
const searchFilter = ref('ทั้งหมด')
const filterOpen = ref(false)
const filterOptions = ['ทั้งหมด', 'โฟลเดอร์', 'ไฟล์']
const items = ref<StorageItem[]>([])
const folderPath = ref<
  { id: number; name: string; username: string; fullname: string; description: string }[]
>([])
const currentFolderId = computed(() => folderPath.value[folderPath.value.length - 1]?.id ?? 0)
const currentFolder = computed(() => folderPath.value[folderPath.value.length - 1] ?? null)
const package_data = ref({} as any)

const filteredItems = computed(() => {
  return items.value
    .filter((item) => {
      const matchSearch =
        item.name.includes(search.value) || item.description.includes(search.value)
      const matchFilter =
        searchFilter.value === 'ทั้งหมด' ||
        (searchFilter.value === 'โฟลเดอร์' && item.type === 'folder') ||
        (searchFilter.value === 'ไฟล์' && item.type !== 'folder')
      return matchSearch && matchFilter
    })
    .sort((a, b) => (a.type === 'folder' ? -1 : 1) - (b.type === 'folder' ? -1 : 1))
})

// --- Add Folder Modal ---
const openAddFolderModal = ref(false)

const folderForm = reactive({
  name: '',
  description: '',
})

const folderFormErrors = reactive({ name: '' })

const resetFolderForm = () => {
  folderForm.name = ''
  folderForm.description = ''
  folderFormErrors.name = ''
}

const savingFolder = ref(false)

const handleSaveFolder = async () => {
  if (!package_data.value.current_package || new Date(package_data.value.expire_date) < new Date()) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  folderFormErrors.name = folderForm.name.trim() ? '' : 'กรุณากรอกชื่อโฟลเดอร์'
  if (folderFormErrors.name) return
  savingFolder.value = true
  const res = await API('specific\\lawfirm\\file', 'insertFolder', {
    main_lawyer_id: localStorage.getItem('main_lawyer_id'),
    folder_id: currentFolderId.value,
    name: folderForm.name,
    description: folderForm.description,
  })
  savingFolder.value = false
  if (res?.response_status) {
    push.success('เพิ่มโฟลเดอร์สำเร็จ!')
    await resetFolderForm()
    openAddFolderModal.value = false
    await handleSelect()
  } else {
    push.error('เพิ่มโฟลเดอร์ไม่สำเร็จ!\n' + res?.response_message)
  }
}

// --- Folder navigation ---
const encodePath = (path: { id: number; name: string }[]) =>
  path.map((f) => `${f.id}:${encodeURIComponent(f.name)}`).join(',')

const decodePath = (
  str: string,
): { id: number; name: string; username: string; fullname: string; description: string }[] =>
  str.split(',').map((seg) => {
    const col = seg.indexOf(':')
    return {
      id: Number(seg.slice(0, col)),
      name: decodeURIComponent(seg.slice(col + 1)),
      username: '',
      fullname: '',
      description: '',
    }
  })

const syncUrl = () => {
  const q = folderPath.value.length ? { path: encodePath(folderPath.value) } : {}
  router.replace({ query: q })
}

const navigateTo = (index: number) => {
  folderPath.value = index < 0 ? [] : folderPath.value.slice(0, index + 1)
  syncUrl()
  handleSelect()
}

// --- File Detail Panel ---
const selectedItem = ref<StorageItem | null>(null)

const handleItemSelect = (item: StorageItem) => {
  if (item.type === 'folder') {
    folderPath.value.push({
      id: item.id,
      name: item.name,
      username: item.username ?? '',
      fullname: item.fullname ?? '',
      description: item.description,
    })
    syncUrl()
    handleSelect()
  } else if (p.value.is_preview_file) {
    selectedItem.value = item
  }
}

// --- Delete ---
const openDeleteModal = ref(false)
const deletingItem = ref<StorageItem | null>(null)
const deletingLoad = ref(false)

const handleActionClick = (item: StorageItem) => {
  if (!p.value.is_delete_document) {
    push.error('ไม่มีสิทธิ์ลบเอกสาร')
    return
  }
  deletingItem.value = item
  openDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingItem.value) return
  deletingLoad.value = true
  const fn = deletingItem.value.type === 'folder' ? 'deleteFolder' : 'delete'
  const res = await API('specific\\lawfirm\\file', fn, {
    id: deletingItem.value.id,
  })
  deletingLoad.value = false
  if (res?.response_status) {
    push.success('ลบสำเร็จ!')
    if (selectedItem.value?.id === deletingItem.value.id) selectedItem.value = null
    deletingItem.value = null
    openDeleteModal.value = false
    handleSelect()
  } else {
    push.error('ลบไม่สำเร็จ!\n' + res?.response_message)
  }
}

// --- Edit Folder Modal ---
const openEditFolderModal = ref(false)
const editFolderForm = reactive({ name: '', description: '' })
const editFolderFormErrors = reactive({ name: '' })
const savingEditFolder = ref(false)

const openEditFolder = () => {
  editFolderForm.name = currentFolder.value?.name ?? ''
  editFolderForm.description = currentFolder.value?.description ?? ''
  editFolderFormErrors.name = ''
  openEditFolderModal.value = true
}

const handleEditFolder = async () => {
  editFolderFormErrors.name = editFolderForm.name.trim() ? '' : 'กรุณากรอกชื่อโฟลเดอร์'
  if (editFolderFormErrors.name || !currentFolder.value) return
  savingEditFolder.value = true
  const res = await API('specific\\lawfirm\\file', 'updateFolder', {
    id: currentFolder.value.id,
    name: editFolderForm.name,
    description: editFolderForm.description,
  })
  savingEditFolder.value = false
  if (res?.response_status) {
    push.success('แก้ไขโฟลเดอร์สำเร็จ!')
    const last = folderPath.value.length - 1
    folderPath.value[last] = {
      ...folderPath.value[last],
      name: editFolderForm.name,
      description: editFolderForm.description,
    }
    syncUrl()
    openEditFolderModal.value = false
  } else {
    push.error('แก้ไขโฟลเดอร์ไม่สำเร็จ!\n' + res?.response_message)
  }
}

// --- Upload Modal ---
const openUploadModal = ref(false)

const uploadForm = reactive({
  fileName: '',
  description: '',
  ocrEnabled: false,
  selectedFile: null as File | null,
})

const uploadFormErrors = reactive({
  file: '',
  fileName: '',
})

const resetUploadForm = () => {
  uploadForm.fileName = ''
  uploadForm.description = ''
  uploadForm.ocrEnabled = false
  uploadForm.selectedFile = null
  uploadFormErrors.file = ''
  uploadFormErrors.fileName = ''
}

const onDropZoneFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadForm.selectedFile = file
  uploadFormErrors.file = ''
  uploadForm.fileName = file.name.replace(/\.[^.]+$/, '')
  ;(e.target as HTMLInputElement).value = ''
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  uploadForm.selectedFile = file
  uploadFormErrors.file = ''
  uploadForm.fileName = file.name.replace(/\.[^.]+$/, '')
}

const savingUpload = ref(false)

watch(
  () => uploadForm.fileName,
  (val) => {
    const stripped = val.replace(/\./g, '')
    if (stripped !== val) uploadForm.fileName = stripped
  },
)

const uploadFileExt = computed(() => {
  const ext = uploadForm.selectedFile?.name.split('.').pop()?.toLowerCase() ?? ''
  return ext ? `.${ext}` : ''
})

const handleSaveUpload = async () => {
  if (!package_data.value.current_package || new Date(package_data.value.expire_date) < new Date()) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  uploadFormErrors.file = uploadForm.selectedFile ? '' : 'กรุณาเลือกไฟล์'
  const nameTrimmed = uploadForm.fileName.trim().replace(/^\.+$/, '')
  uploadFormErrors.fileName = nameTrimmed ? '' : 'กรุณากรอกชื่อไฟล์'
  if (uploadFormErrors.file || uploadFormErrors.fileName) return
  savingUpload.value = true
  const res = await API('specific\\lawfirm\\file', 'upload', {
    main_lawyer_id: localStorage.getItem('main_lawyer_id'),
    folder_id: currentFolderId.value,
    name: nameTrimmed + uploadFileExt.value,
    file: uploadForm.selectedFile,
    description: uploadForm.description,
  })
  savingUpload.value = false
  if (res?.response_status) {
    push.success('อัปโหลดไฟล์สำเร็จ!')
    resetUploadForm()
    openUploadModal.value = false
    await handleSelect()
  } else {
    push.error('อัปโหลดไฟล์ไม่สำเร็จ!\n' + res?.response_message)
  }
}

const formatBytes = (bytes: string | number) => {
  const b = parseFloat(String(bytes))
  if (!b || b <= 0) return '-'
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB'
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const fileTypeLabel = (f: File | null) =>
  f ? (f.name.split('.').pop()?.toUpperCase() ?? 'FILE') : 'ยังไม่ได้อัปโหลด'

const fileSizeLabel = (f: File | null) => (f ? formatBytes(f.size) : 'ยังไม่ได้อัปโหลด')

const EXT_TYPE: Record<string, StorageItem['type']> = {
  pdf: 'pdf',
  xls: 'xls',
  xlsx: 'xls',
  csv: 'xls',
  doc: 'doc',
  docx: 'doc',
  png: 'png',
  jpg: 'png',
  jpeg: 'png',
  gif: 'png',
  webp: 'png',
}

const formatDate = (dt: string) =>
  new Date(dt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

const loadingItems = ref(false)

const handleSelect = async () => {
  loadingItems.value = true
  const res = await API('specific\\lawfirm\\file', 'select', {
    main_lawyer_id: localStorage.getItem('main_lawyer_id'),
    folder_id: currentFolderId.value,
  })
  loadingItems.value = false
  if (res?.response_status) {
    const data = res.response_data
    // sync current folder metadata (fixes refresh case)
    if (data.folder && folderPath.value.length > 0) {
      const f = data.folder
      const last = folderPath.value.length - 1
      folderPath.value[last] = {
        ...folderPath.value[last],
        name: f.name,
        description: f.description ?? '',
        username: f.insert_username ?? '',
        fullname: f.insert_user?.details?.full_name ?? '',
      }
    }
    items.value = (data.list ?? []).map((item: any): StorageItem => {
      if (item.type === 'folder') {
        const f = item.folder
        return {
          id: f.id,
          name: f.name,
          description: f.description ?? '',
          type: 'folder',
          typeLabel: 'โฟลเดอร์',
          date: formatDate(f.insert_date_time),
          meta: `${item.count_folder ?? 0} โฟลเดอร์  ${item.count_file ?? 0} ไฟล์ภายใน`,
          hasOcr: false,
          username: f.insert_username ?? '',
          fullname: f.insert_user?.details?.full_name ?? '',
          caseId: f.case_id ?? 0,
        }
      } else {
        const f = item.file
        const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
        const type: StorageItem['type'] = EXT_TYPE[ext] ?? 'other'
        return {
          id: f.id,
          name: f.name,
          description: f.description || '',
          type,
          typeLabel: ext.toUpperCase() || 'FILE',
          date: formatDate(f.insert_date_time),
          meta: formatBytes(f.size),
          hasOcr: false,
          fullname: f.insert_user?.details?.full_name ?? '',
          fileUrl: f.file_url ?? '',
          caseId: f.case_id ?? 0,
        }
      }
    })
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res?.response_message)
  }
}

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
  const pathStr = route.query.path as string
  if (pathStr) folderPath.value = decodePath(pathStr)
  await handleSelect()
})
</script>

<template>
  <div class="pt-[15px] pb-[40px] space-y-[20px]">
    <!-- Page Header + Actions -->

    <!-- Root layout -->
    <div v-if="!currentFolder" class="flex flex-wrap items-start justify-between gap-[20px]">
      <div>
        <p class="text-[22px] text-[#3b4854]">คลังจัดเก็บเอกสาร</p>
        <p class="text-[16px] text-[#777f87]">คุณสามารถสร้างโฟลเดอร์เพื่อจัดเก็บไฟล์เป็นกลุ่มได้</p>
      </div>
      <div class="flex flex-wrap items-center gap-[10px]">
        <!-- Search bar -->
        <div
          class="flex items-center rounded-[8px] border border-[#e7e8e9] bg-white min-[620px]:min-w-[580px] max-[620px]:w-full"
        >
          <!-- Filter dropdown -->
          <button
            class="relative flex items-center gap-[10px] px-[20px] py-[14px] text-[16px] text-[#3b4854] shrink-0 hover:bg-[#f4f4f4] transition-colors"
            @click="filterOpen = !filterOpen"
          >
            <IconStorageSearch class="text-[#3b4854]" />
            <span>ค้นหาจาก{{ searchFilter }}</span>
            <IconCaretDown class="text-[#3b4854]" />
            <!-- Dropdown menu -->
            <div
              v-if="filterOpen"
              class="absolute left-0 top-full mt-[4px] z-20 min-w-[160px] rounded-[8px] border border-[#e7e8e9] bg-white shadow-sm overflow-hidden"
            >
              <button
                v-for="opt in filterOptions"
                :key="opt"
                class="block w-full text-left px-[16px] py-[10px] text-[15px] text-[#3b4854] hover:bg-[#f4f4f4]"
                :class="searchFilter === opt ? 'bg-[#f4f4f4] font-medium' : ''"
                @click.stop="
                  () => {
                    searchFilter = opt
                    filterOpen = false
                  }
                "
              >
                {{ opt }}
              </button>
            </div>
          </button>
          <!-- Vertical divider -->
          <div class="w-[1px] h-[50px] bg-[#e7e8e9] shrink-0"></div>
          <!-- Search input -->
          <input
            v-model="search"
            type="text"
            placeholder="พิมพ์คำหรือคีย์เวิร์ดที่ต้องการค้นหา..."
            class="flex-1 px-[20px] py-[14px] text-[16px] text-[#3b4854] placeholder-[#aeb3b9] outline-none"
          />
        </div>

        <!-- Edit folder button (inside folder only) -->
        <button
          v-if="currentFolder"
          class="flex items-center gap-[8px] rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[13px] text-[16px] text-[#777f87] hover:bg-[#f4f4f4] transition-colors whitespace-nowrap"
          @click="openEditFolder"
        >
          <IconPencil class="text-[#777f87]" />
          แก้ไขโฟลเดอร์
        </button>

        <!-- Upload button -->
        <button
          v-if="p.is_upload_document"
          class="flex items-center gap-[8px] rounded-[8px] bg-[#e6efff] px-[20px] py-[13px] text-[16px] font-medium text-[#0f182a] hover:bg-[#d0e3ff] transition-colors whitespace-nowrap"
          @click="openUploadModal = true"
        >
          <IconUploadDoc class="text-[#0f182a] w-[20px]" />
          อัปโหลดไฟล์
        </button>

        <!-- Add folder / subfolder button -->
        <button
          v-if="p.is_upload_document"
          class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 transition-colors whitespace-nowrap"
          @click="openAddFolderModal = true"
        >
          <IconFolderCreate class="text-white" />
          {{ currentFolder ? 'เพิ่มโฟลเดอร์ย่อย' : 'เพิ่มโฟลเดอร์' }}
        </button>
      </div>
    </div>

    <!-- Folder layout -->
    <div v-if="currentFolder" class="flex flex-col items-center gap-[16px]">
      <div class="text-center">
        <p class="text-[22px] text-[#3b4854]">{{ currentFolder.name }}</p>
        <p v-if="currentFolder.description" class="text-[16px] text-[#777f87]">
          {{ currentFolder.description }}
        </p>
        <p class="text-[15px] text-[#8e9aab]">สร้างโดย : {{ currentFolder?.fullname || '-' }}</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-[10px]">
        <!-- Search bar -->
        <div
          class="flex items-center rounded-[8px] border border-[#e7e8e9] bg-white min-[620px]:min-w-[580px] max-[620px]:w-full"
        >
          <button
            class="relative flex items-center gap-[10px] px-[20px] py-[14px] text-[16px] text-[#3b4854] shrink-0 hover:bg-[#f4f4f4] transition-colors"
            @click="filterOpen = !filterOpen"
          >
            <IconStorageSearch class="text-[#3b4854]" />
            <span>ค้นหาจาก{{ searchFilter }}</span>
            <IconCaretDown class="text-[#3b4854]" />
            <div
              v-if="filterOpen"
              class="absolute left-0 top-full mt-[4px] z-20 min-w-[160px] rounded-[8px] border border-[#e7e8e9] bg-white shadow-sm overflow-hidden"
            >
              <button
                v-for="opt in filterOptions"
                :key="opt"
                class="block w-full text-left px-[16px] py-[10px] text-[15px] text-[#3b4854] hover:bg-[#f4f4f4]"
                :class="searchFilter === opt ? 'bg-[#f4f4f4] font-medium' : ''"
                @click.stop="
                  () => {
                    searchFilter = opt
                    filterOpen = false
                  }
                "
              >
                {{ opt }}
              </button>
            </div>
          </button>
          <div class="w-[1px] h-[50px] bg-[#e7e8e9] shrink-0"></div>
          <input
            v-model="search"
            type="text"
            placeholder="พิมพ์คำหรือคีย์เวิร์ดที่ต้องการค้นหา..."
            class="flex-1 px-[20px] py-[14px] text-[16px] text-[#3b4854] placeholder-[#aeb3b9] outline-none"
          />
        </div>
        <button
          class="flex items-center gap-[8px] rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[13px] text-[16px] text-[#777f87] hover:bg-[#f4f4f4] transition-colors whitespace-nowrap"
          @click="openEditFolder"
        >
          <IconPencil class="text-[#777f87]" />
          แก้ไขโฟลเดอร์
        </button>
        <button
          v-if="p.is_upload_document"
          class="flex items-center gap-[8px] rounded-[8px] bg-[#e6efff] px-[20px] py-[13px] text-[16px] font-medium text-[#0f182a] hover:bg-[#d0e3ff] transition-colors whitespace-nowrap"
          @click="openUploadModal = true"
        >
          <IconUploadDoc class="text-[#0f182a]" />
          อัปโหลดไฟล์
        </button>
        <button
          v-if="p.is_upload_document"
          class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 transition-colors whitespace-nowrap"
          @click="openAddFolderModal = true"
        >
          <IconFolderCreate class="text-white" />
          เพิ่มโฟลเดอร์ย่อย
        </button>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div v-if="folderPath.length > 0" class="flex items-center gap-[8px] text-[15px]">
      <button class="text-primary hover:underline" @click="navigateTo(-1)">คลังเอกสาร</button>
      <template v-for="(crumb, i) in folderPath" :key="crumb.id">
        <span class="text-[#aeb3b9]">/</span>
        <button
          v-if="i < folderPath.length - 1"
          class="text-primary hover:underline"
          @click="navigateTo(i)"
        >
          {{ crumb.name }}
        </button>
        <span v-else class="text-[#777f87]">{{ crumb.name }}</span>
      </template>
    </div>

    <!-- File/Folder Grid -->
    <base-loading v-if="loadingItems" />
    <StorageFileGrid
      v-else
      :items="filteredItems"
      @select="handleItemSelect"
      @action="handleActionClick"
    />
  </div>

  <!-- File Detail Panel -->
  <StorageFileDetailPanel
    :item="selectedItem"
    :open="!!selectedItem"
    @close="selectedItem = null"
    @delete="handleActionClick(selectedItem!)"
  />

  <!-- Add Folder Modal -->
  <base-modal
    v-if="openAddFolderModal"
    open
    title="เพิ่มโฟลเดอร์"
    subtitle="จัดการรายละเอียดโฟลเดอร์สำหรับจัดเก็บไฟล์"
    size="smm"
    action-button
    action-text="บันทึก"
    action-text-cancel="ยกเลิก"
    variant="black"
    :disabled="savingFolder"
    :loading="savingFolder"
    @primary="handleSaveFolder"
    @close="
      () => {
        resetFolderForm()
        openAddFolderModal = false
      }
    "
  >
    <!-- ชื่อโฟลเดอร์ -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="folderForm.name"
        label="ชื่อโฟลเดอร์"
        labelType="vertical"
        placeholder="ตัวอย่างชื่อโฟลเดอร์หนึ่ง"
        required
        :error="folderFormErrors.name"
      />
    </div>

    <!-- คำอธิบาย -->
    <div>
      <base-textarea
        v-model="folderForm.description"
        label="คำอธิบาย"
        labelType="vertical"
        placeholder="กรอกหากมี"
        :rows="3"
      />
    </div>
  </base-modal>

  <!-- Upload Modal -->
  <base-modal
    v-if="openUploadModal"
    open
    title="อัปโหลดไฟล์"
    subtitle="เพิ่มรายละเอียดไฟล์เพื่อให้การค้นหาไฟล์ของคุณง่ายขึ้น"
    size="smm"
    action-button
    action-text="บันทึก"
    variant="black"
    :disabled="savingUpload"
    :loading="savingUpload"
    @primary="handleSaveUpload()"
    @close="
      () => {
        resetUploadForm()
        openUploadModal = false
      }
    "
  >
    <!-- Drop zone -->
    <div class="mb-[20px]">
      <div
        class="flex flex-col items-center justify-center gap-[10px] rounded-[6px] border border-dashed py-[30px] transition-colors"
        :class="uploadFormErrors.file ? 'border-[#ff725d] bg-[#fff8f7]' : 'border-[#e7e8e9]'"
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
      <p v-if="uploadFormErrors.file" class="mt-[6px] text-[13px] text-[#ff725d]">
        {{ uploadFormErrors.file }}
      </p>
    </div>

    <!-- File name -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="uploadForm.fileName"
        label="ชื่อไฟล์"
        labelType="vertical"
        placeholder="เช่น สัญญาซื้อขาย"
        required
        :error="uploadFormErrors.fileName"
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
        class="relative flex h-[30px] w-[55px] shrink-0 items-center rounded-full transition-colors"
        :class="uploadForm.ocrEnabled ? 'bg-[#0f182a]' : 'bg-[#e7e8e9]'"
        @click="uploadForm.ocrEnabled = !uploadForm.ocrEnabled"
        disabled
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
    <div class="border-t border-dashed border-[#e7e8e9] mt-5 mb-6" />
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

  <!-- Edit Folder Modal -->
  <base-modal
    v-if="openEditFolderModal"
    open
    title="แก้ไขโฟลเดอร์"
    subtitle="แก้ไขชื่อโฟลเดอร์"
    size="smm"
    action-button
    action-text="บันทึก"
    action-text-cancel="ยกเลิก"
    variant="black"
    :disabled="savingEditFolder"
    :loading="savingEditFolder"
    @primary="handleEditFolder"
    @close="openEditFolderModal = false"
  >
    <div class="mb-[20px]">
      <base-text-input
        v-model="editFolderForm.name"
        label="ชื่อโฟลเดอร์"
        labelType="vertical"
        placeholder="ชื่อโฟลเดอร์"
        required
        :error="editFolderFormErrors.name"
      />
    </div>
    <div>
      <base-textarea
        v-model="editFolderForm.description"
        label="คำอธิบาย"
        labelType="vertical"
        placeholder="กรอกหากมี"
        :rows="3"
      />
    </div>
  </base-modal>

  <!-- Delete Confirm Modal -->
  <base-modal
    v-if="openDeleteModal"
    open
    :title="`ลบ${deletingItem?.type === 'folder' ? 'โฟลเดอร์' : 'ไฟล์'}`"
    :subtitle="`คุณต้องการลบ &quot;${deletingItem?.name}&quot; ใช่หรือไม่? การลบจะไม่สามารถกู้คืนได้`"
    action-button
    action-text="ลบ"
    variant="danger"
    :show-body="false"
    :disabled="deletingLoad"
    :loading="deletingLoad"
    @primary="handleDelete"
    @close="
      () => {
        deletingItem = null
        openDeleteModal = false
      }
    "
  />
</template>
