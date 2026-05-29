<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseDataTable from '@/components/base/base-data-table.vue'
import { API } from '@/api'
import { push } from 'notivue'
import IconX from '@/components/icons/IconX.vue'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const route = useRoute()
const package_data = ref({} as any)
const { p } = usePermissions()

const isEditMode = computed(() => !!route.params.id)

onMounted(async() => {
  if (isEditMode.value && !p.value.is_edit_case) {
    push.error('ไม่มีสิทธิ์แก้ไขข้อมูลคดี')
    router.replace('/cases')
  } else if (!isEditMode.value && !p.value.is_add_case) {
    push.error('ไม่มีสิทธิ์เพิ่มข้อมูลคดี')
    router.replace('/cases')
  }
})

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


const form = ref({
  case_type_id: '',
  code: '',
  name: '',
  description: '',
  case_lawyer_id: '',
  court: '',
  date_filling: '',
  status: 'draft',
  client_name: '',
  client_id: '',
  client_tel: '',
  client_email: '',
  client_address: '',
})

const showContacts = ref(true)
const showNotes = ref(true)
const showAppointments = ref(true)
const showFiles = ref(true)

const contacts = ref<
  { prefix: string; name: string; tel: string; email: string; remark: string }[]
>([])
const notes = ref<{ details: string }[]>([])
const appointments = ref<
  {
    date: string
    start_time: string
    end_time: string
    type: string
    topic: string
    location: string
    remark: string
  }[]
>([])

const addContact = () =>
  contacts.value.push({ prefix: '', name: '', tel: '', email: '', remark: '' })
const removeContact = (i: number) => contacts.value.splice(i, 1)

const addNote = () => notes.value.push({ details: '' })
const removeNote = (i: number) => notes.value.splice(i, 1)

const addAppointment = () =>
  appointments.value.push({
    date: '',
    start_time: '',
    end_time: '',
    type: '',
    topic: '',
    location: '',
    remark: '',
  })
const removeAppointment = (i: number) => appointments.value.splice(i, 1)

const errors = ref({
  case_type_id: '',
  code: '',
  name: '',
  case_lawyer_id: '',
  client_name: '',
})

const validate = () => {
  errors.value.case_type_id = form.value.case_type_id ? '' : 'กรุณาเลือกประเภทคดี'
  errors.value.code = form.value.code ? '' : 'กรุณากรอกเลขคดี'
  errors.value.name = form.value.name ? '' : 'กรุณากรอกชื่อคดี'
  errors.value.case_lawyer_id = form.value.case_lawyer_id ? '' : 'กรุณาเลือกทนายความผู้รับผิดชอบ'
  errors.value.client_name = form.value.client_name ? '' : 'กรุณากรอกชื่อลูกความ'

  return Object.values(errors.value).every((e) => !e)
}

const formatIdCard = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  const parts = [
    digits.slice(0, 1),
    digits.slice(1, 5),
    digits.slice(5, 10),
    digits.slice(10, 12),
    digits.slice(12, 13),
  ]
  return parts.filter(Boolean).join('-')
}

watch(
  () => form.value.client_id,
  (val) => {
    const formatted = formatIdCard(val)
    if (formatted !== val) form.value.client_id = formatted
  },
)

const isDragOver = ref(false)
const selectedFiles = ref<File[]>([])
const lawyerOptions = ref<{ name: string; value: string }[]>([])

const onDrop = (e: DragEvent) => {
  isDragOver.value = false
  selectedFiles.value.push(...Array.from(e.dataTransfer?.files ?? []))
}

const onFileSelect = (e: Event) => {
  selectedFiles.value.push(...Array.from((e.target as HTMLInputElement).files ?? []))
  ;(e.target as HTMLInputElement).value = ''
}

const isLoading = ref(isEditMode.value)

const parsePhpDetails = (str: string) => {
  const match = str?.match(/s:\d+:"details";s:\d+:"([\s\S]*)";/)
  return match ? match[1] : (str ?? '')
}

onMounted(async () => {
  await handlePackage()
  await API('specific\\lawfirm\\cases', 'preFill', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  }).then((res) => {
    if (res?.response_status) {
      lawyerOptions.value = (res.response_data?.lawyers ?? []).map(
        (l: { id: number; details: { full_name: string } }) => ({
          name: l.details.full_name,
          value: String(l.id),
        }),
      )
    }
  })

  if (!isEditMode.value) return
  await API('specific\\lawfirm\\cases', 'getByID', { id: route.params.id })
    .then((res) => {
      if (res.response_status) {
        const d = res.response_data
        form.value = {
          case_type_id: String(d.case_type_id),
          code: d.code,
          name: d.name,
          description: d.description,
          case_lawyer_id: String(d.case_lawyer_id),
          court: d.court,
          date_filling: d.date_filling,
          status: d.status || d.status_case || 'draft',
          client_name: d.client_name,
          client_id: String(d.client_id),
          client_tel: d.client_tel,
          client_email: d.client_email,
          client_address: d.client_address,
        }
        contacts.value = Array.isArray(d.contacts) ? d.contacts : []
        notes.value = Array.isArray(d.details)
          ? d.details.map((item: any) => ({ details: parsePhpDetails(item.description) }))
          : []
        appointments.value = Array.isArray(d.schedules) ? d.schedules : []
      }
    })
    .finally(() => {
      isLoading.value = false
    })
})

const handleSave = async () => {
  const operation = isEditMode.value ? 'update' : 'insert'
  if (operation === 'insert' && (!package_data.value.current_package || new Date(package_data.value.expire_date) < new Date())) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  if (!validate()) {
    push.warning('กรุณากรอกข้อมูลให้ครบทุกช่อง')
    return
  }

  isLoading.value = true
  const payload = {
    lawyer_id: localStorage.getItem('lawyer_user_id'),
    data: { ...form.value },
    contacts: contacts.value,
    details: notes.value,
    schedules: appointments.value,
    files: selectedFiles.value,
  }

  const requestPayload = isEditMode.value
    ? {
        id: route.params.id,
        data: payload.data,
        contacts: payload.contacts,
        details: payload.details,
        schedules: payload.schedules,
      }
    : payload

  await API('specific\\lawfirm\\cases', operation, requestPayload)
    .then(async (res) => {
      if (res.response_status) {
        await API('specific\\lawfirm\\timeline', 'insert', {
          name: isEditMode.value ? 'แก้ไขข้อมูลคดี' : 'เพิ่มข้อมูลคดี',
          description: `เลขคดี : ${form.value.code}`,
          type: 'cases',
        })

        if (isEditMode.value) {
          push.success('แก้ไขข้อมูลคดีสำเร็จ!')
          router.push('/cases/' + route.params.id)
        } else {
          push.success('เพิ่มข้อมูลคดีสำเร็จ!')
          router.push('/cases/' + res.response_data)
        }
      } else {
        push.error(
          (isEditMode.value ? 'แก้ไข' : 'เพิ่ม') + 'ข้อมูลคดีไม่สำเร็จ!\n' + res.response_message,
        )
      }
    })
    .catch((error) => {
      push.error('เกิดข้อผิดพลาด: ' + error.message)
    })
    .finally(() => {
      isLoading.value = false
    })
}
</script>

<template>
  <section class="px-[20px] pt-[15px] pb-[40px]">
    <base-loading v-if="isLoading" />

    <template v-else>
      <!-- Page Header -->
      <div class="mb-[25px]">
        <p class="text-[22px] text-[#3b4854]">
          {{ isEditMode ? 'แก้ไขข้อมูลคดี' : 'เพิ่มข้อมูลคดีใหม่' }}
        </p>
        <p class="text-[16px] text-[#777f87]">
          บันทึกรายละเอียดคดี และรายละเอียดผู้ติดต่อหรือผู้เกี่ยวข้อง
        </p>
      </div>

      <div class="flex gap-[20px] items-start">
        <!-- ===== LEFT MAIN FORM ===== -->
        <div class="flex-1 min-w-0 space-y-[15px]">
          <!-- รายละเอียดคดี -->
          <div class="rounded-[8px] border border-[#e7e8e9]">
            <div class="p-[25px] space-y-[20px]">
              <p class="text-[20px] text-[#3b4854]">รายละเอียดคดี</p>

              <!-- Row: ประเภทคดี + เลขคดี -->
              <div class="flex gap-[20px]">
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]"
                    >ประเภทคดี <span class="text-[#ff725d]">*</span></label
                  >
                  <base-dropdown-multi-select
                    v-model="form.case_type_id"
                    :error="errors.case_type_id"
                    :options="[
                      {
                        name: 'คดีแพ่ง',
                        value: 1,
                      },
                      {
                        name: 'คดีอาญา',
                        value: 2,
                      },
                    ]"
                    placeholder="เลือกประเภทคดี"
                  />
                </div>
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]"
                    >เลขคดี <span class="text-[#ff725d]">*</span></label
                  >
                  <base-text-input
                    v-model="form.code"
                    :error="errors.code"
                    placeholder="เช่น คดีแพ่ง 1234/2569"
                  />
                </div>
              </div>

              <!-- ชื่อคดี -->
              <div class="space-y-[8px]">
                <label class="text-[15px] text-[#3b4854]"
                  >ชื่อคดี <span class="text-[#ff725d]">*</span></label
                >
                <base-text-input
                  v-model="form.name"
                  :error="errors.name"
                  placeholder="ชื่อเรื่อง หัวข้อของคดี"
                />
              </div>

              <!-- คำอธิบายคดี -->
              <div class="space-y-[8px]">
                <label class="text-[15px] text-[#3b4854]">คำอธิบายคดี</label>

                <base-textarea v-model="form.description" placeholder="รายละเอียดคดี..." />
              </div>

              <!-- Row: ทนายความ + ศาล -->
              <div class="flex gap-[20px]">
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]"
                    >ทนายความผู้รับผิดชอบ <span class="text-[#ff725d]">*</span></label
                  >

                  <base-dropdown-multi-select
                    v-model="form.case_lawyer_id"
                    :error="errors.case_lawyer_id"
                    :options="lawyerOptions"
                    placeholder="เลือกทนายความผู้รับผิดชอบ"
                  />
                </div>
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">ศาล</label>

                  <base-text-input v-model="form.court" placeholder="กรอกชื่อศาล" />
                </div>
              </div>

              <!-- Row: วันที่ยื่นฟ้อง + สถานะคดี -->
              <div class="flex gap-[20px]">
                <div class="w-[calc(50%-10px)] space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">วันที่ยื่นฟ้อง</label>

                  <base-datepicker-label
                    v-model="form.date_filling"
                    type="date"
                    class="max-w-[250px]"
                  />
                </div>
                <div class="w-[calc(50%-10px)] space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">สถานะคดี</label>
                  <base-dropdown-multi-select
                    v-model="form.status"
                    :options="[
                      { name: 'กำลังดำเนินการ', value: 'active' },
                      { name: 'รอนัดพิจารณา', value: 'pending' },
                      { name: 'แบบร่าง', value: 'draft' },
                      { name: 'ดำเนินการเสร็จสิ้น', value: 'done' },
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- ข้อมูลลูกความ -->
            <div class="p-[25px] space-y-[20px]">
              <p class="text-[20px] text-[#3b4854]">ข้อมูลลูกความ</p>

              <div class="flex gap-[20px]">
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]"
                    >ชื่อลูกความ <span class="text-[#ff725d]">*</span></label
                  >

                  <base-text-input
                    v-model="form.client_name"
                    :error="errors.client_name"
                    placeholder="กรอกชื่อลูกความ"
                  />
                </div>
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">เลขบัตรประชาชน</label>

                  <base-text-input
                    v-model="form.client_id"
                    placeholder="x-xxxx-xxxxx-xx-x"
                    @keydown="
                      (e: KeyboardEvent) => {
                        if (e.ctrlKey || e.metaKey) return
                        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                        const digits = form.client_id.replace(/\D/g, '')
                        if (digits.length >= 13 && /^\d$/.test(e.key)) e.preventDefault()
                      }
                    "
                  />
                </div>
              </div>

              <div class="flex gap-[20px]">
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">โทรศัพท์</label>

                  <base-text-input
                    v-model="form.client_tel"
                    placeholder="0xxxxxxxxx"
                    @keydown="
                      (e: KeyboardEvent) => {
                        if (e.ctrlKey || e.metaKey) return
                        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                        if (form.client_tel.length >= 10 && /^\d$/.test(e.key)) e.preventDefault()
                      }
                    "
                  />
                </div>
                <div class="flex-1 space-y-[8px]">
                  <label class="text-[15px] text-[#3b4854]">อีเมล</label>
                  <base-text-input v-model="form.client_email" placeholder="email@example.com" />
                </div>
              </div>

              <div class="space-y-[8px]">
                <label class="text-[15px] text-[#3b4854]">ที่อยู่</label>

                <base-textarea v-model="form.client_address" placeholder="ที่อยู่ลูกความ..." />
              </div>
            </div>
          </div>

          <!-- ผู้ติดต่อที่เกี่ยวข้อง -->
          <div class="rounded-[8px] border border-[#e7e8e9] p-[25px]">
            <div class="flex items-center justify-between mb-[20px]">
              <p class="text-[20px] text-[#3b4854]">ผู้ติดต่อที่เกี่ยวข้อง</p>
              <button
                class="text-[16px] text-[#c29f5f] hover:underline"
                @click="showContacts = !showContacts"
              >
                ซ่อน | แสดง
              </button>
            </div>

            <div v-if="showContacts">
              <BaseDataTable
                :table="{
                  columns: [
                    { field: 'prefix', header: 'ประเภท', width: '160px' },
                    { field: 'name', header: 'ชื่อ' },
                    { field: 'tel', header: 'เบอร์ติดต่อ' },
                    { field: 'email', header: 'อีเมล' },
                    { field: 'remark', header: 'บันทึกเพิ่มเติม' },
                    { field: 'actions', header: '', width: '1%' },
                  ],
                }"
                :data="contacts"
                :disabledPagination="true"
                :disableFilterRow="true"
                rowClass="hover:none"
              >
                <template #cell-prefix="{ row }">
                  <base-dropdown-multi-select
                    v-model="row.prefix"
                    :options="[
                      { name: 'พยาน', value: 'witness' },
                      { name: 'คู่ความ', value: 'opponent' },
                      { name: 'ผู้เชี่ยวชาญ', value: 'expert' },
                    ]"
                    placeholder="ผู้ติดต่อ"
                  />
                </template>

                <template #cell-name="{ row }">
                  <base-text-input v-model="row.name" placeholder="ชื่อ - นามสกุล" />
                </template>

                <template #cell-tel="{ row }">
                  <base-text-input
                    v-model="row.tel"
                    placeholder="0xxxxxxxxx"
                    @keydown="
                      (e: KeyboardEvent) => {
                        if (e.ctrlKey || e.metaKey) return
                        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                        if (row.tel.length >= 10 && /^\d$/.test(e.key)) e.preventDefault()
                      }
                    "
                  />
                </template>

                <template #cell-email="{ row }">
                  <base-text-input v-model="row.email" placeholder="กรอก" />
                </template>

                <template #cell-remark="{ row }">
                  <base-text-input v-model="row.remark" placeholder="บันทึกเพิ่มเติม..." />
                </template>

                <template #cell-actions="{ rowIndex }">
                  <div class="flex items-center justify-center">
                    <button @click="removeContact(rowIndex)" class="mt-1 hover:opacity-70">
                      <IconTrashV3 />
                    </button>
                  </div>
                </template>
              </BaseDataTable>

              <div class="pt-[10px] border-t border-[#e7e8e9] mt-[10px]">
                <button
                  @click="addContact"
                  class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
                >
                  + เพิ่มผู้ติดต่อ
                </button>
              </div>
            </div>
          </div>

          <!-- บันทึกเพิ่มเติมเกี่ยวกับคดี -->
          <div v-if="!isEditMode" class="rounded-[8px] border border-[#e7e8e9] p-[25px]">
            <div class="flex items-center justify-between mb-[20px]">
              <p class="text-[20px] text-[#3b4854]">บันทึกเพิ่มเติมเกี่ยวกับคดี</p>
              <button
                class="text-[16px] text-[#c29f5f] hover:underline"
                @click="showNotes = !showNotes"
              >
                ซ่อน | แสดง
              </button>
            </div>

            <div v-if="showNotes">
              <BaseDataTable
                :table="{
                  columns: [
                    { field: 'details', header: 'รายละเอียดบันทึก / คำอธิบาย' },
                    { field: 'actions', header: '', width: '50px' },
                  ],
                }"
                :data="notes"
                :disabledPagination="true"
                :disableFilterRow="true"
                rowClass="hover:none"
              >
                <template #cell-details="{ row }">
                  <base-text-input v-model="row.details" placeholder="กรอก" />
                </template>

                <template #cell-actions="{ rowIndex }">
                  <div class="flex items-center justify-center">
                    <button @click="removeNote(rowIndex)" class="mt-1 hover:opacity-70">
                      <IconTrashV3 />
                    </button>
                  </div>
                </template>
              </BaseDataTable>

              <div class="pt-[10px] border-t border-[#e7e8e9] mt-[10px]">
                <button
                  @click="addNote"
                  class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
                >
                  + เพิ่มบันทึก
                </button>
              </div>
            </div>
          </div>

          <!-- การนัดหมาย -->
          <div v-if="!isEditMode" class="rounded-[8px] border border-[#e7e8e9] p-[25px]">
            <div class="flex items-center justify-between mb-[20px]">
              <p class="text-[20px] text-[#3b4854]">การนัดหมาย</p>
              <button
                class="text-[16px] text-[#c29f5f] hover:underline"
                @click="showAppointments = !showAppointments"
              >
                ซ่อน | แสดง
              </button>
            </div>

            <div v-if="showAppointments">
              <BaseDataTable
                :table="{
                  columns: [
                    {
                      field: 'date',
                      header: 'วันที่',
                      search: 'text',
                      minWidth: '250px',
                    },
                    {
                      field: 'start_time',
                      header: 'เวลาเริ่ม',
                      search: 'text',
                      minWidth: '200px',
                    },
                    {
                      field: 'end_time',
                      header: 'เวลาสิ้นสุด',
                      search: 'text',
                      minWidth: '200px',
                    },
                    {
                      field: 'type',
                      header: 'ประเภทการนัดหมาย',
                      search: 'select',
                      minWidth: '220px',
                      options: [
                        { value: 'all', name: 'ทั้งหมด' },
                        { value: 'court', name: 'ขึ้นศาล' },
                        { value: 'client', name: 'นัดพบลูกความ' },
                        { value: 'witness', name: 'นัดพบพยาน' },
                        { value: 'document', name: 'ยื่นเอกสาร' },
                        { value: 'meeting', name: 'ประชุม' },
                        { value: 'other', name: 'อื่น ๆ' },
                      ],
                    },
                    {
                      field: 'topic',
                      header: 'หัวข้อนัดหมาย',
                      search: 'text',
                      minWidth: '200px',
                    },
                    {
                      field: 'location',
                      header: 'สถานที่นัดหมาย',
                      search: 'text',
                      minWidth: '200px',
                    },
                    { field: 'remark', header: 'บันทึกเพิ่มเติม', minWidth: '200px' },
                    { field: 'actions', header: '', width: '1%' },
                  ],
                }"
                :data="appointments"
                :disabledPagination="true"
                rowClass="hover:none"
              >
                <template #cell-date="{ row }">
                  <base-datepicker-label v-model="row.date" type="date" />
                </template>

                <template #cell-start_time="{ row }">
                  <base-datepicker-label
                    v-model="row.start_time"
                    type="time"
                    timeOnly
                    placeholder="เวลาเริ่ม"
                  />
                </template>

                <template #cell-end_time="{ row }">
                  <base-datepicker-label
                    v-model="row.end_time"
                    type="time"
                    timeOnly
                    placeholder="เวลาสิ้นสุด"
                  />
                </template>

                <template #cell-type="{ row }">
                  <base-dropdown-multi-select
                    v-model="row.type"
                    :options="[
                      { value: 'court', name: 'ขึ้นศาล' },
                      { value: 'client', name: 'นัดพบลูกความ' },
                      { value: 'witness', name: 'นัดพบพยาน' },
                      { value: 'document', name: 'ยื่นเอกสาร' },
                      { value: 'meeting', name: 'ประชุม' },
                      { value: 'other', name: 'อื่น ๆ' },
                    ]"
                    placeholder="เลือกประเภท"
                  />
                </template>

                <template #cell-topic="{ row }">
                  <base-text-input v-model="row.topic" placeholder="กรอก" />
                </template>

                <template #cell-location="{ row }">
                  <base-text-input v-model="row.location" placeholder="กรอก" />
                </template>

                <template #cell-remark="{ row }">
                  <base-text-input v-model="row.remark" placeholder="บันทึกเพิ่มเติม..." />
                </template>

                <template #cell-actions="{ rowIndex }">
                  <div class="flex items-center justify-center">
                    <button @click="removeAppointment(rowIndex)" class="mt-1 hover:opacity-70">
                      <IconTrashV3 />
                    </button>
                  </div>
                </template>
              </BaseDataTable>

              <div class="pt-[10px] border-t border-[#e7e8e9] mt-[10px]">
                <button
                  @click="addAppointment"
                  class="flex items-center gap-[8px] rounded-[8px] bg-[#0f182a] px-[20px] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
                >
                  + เพิ่มนัดหมาย
                </button>
              </div>
            </div>
          </div>

          <!-- ไฟล์ประกอบเคส / คดี -->
          <div v-if="!isEditMode" class="rounded-[8px] border border-[#e7e8e9] p-[25px]">
            <div class="flex items-center justify-between mb-[20px]">
              <p class="text-[20px] text-[#3b4854]">ไฟล์ประกอบเคส / คดี</p>
              <button
                class="text-[16px] text-[#c29f5f] hover:underline"
                @click="showFiles = !showFiles"
              >
                ซ่อน | แสดง
              </button>
            </div>

            <div v-if="showFiles">
              <div
                class="rounded-[6px] border-2 border-dashed border-[#e7e8e9] p-[40px] text-center transition-colors"
                :class="{ 'border-[#0f182a] bg-[#f8f8f8]': isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @drop.prevent="onDrop"
              >
                <div class="flex flex-col items-center gap-[12px]">
                  <div
                    class="flex size-[40px] items-center justify-center rounded-[8px] bg-[#edeef0]"
                  >
                    <IconArrowTop class="w-[20px] text-[#777F87]" />
                  </div>
                  <p class="text-[18px] font-medium text-[#3b4854]">ลากและวางไฟล์ประกอบที่นี่</p>
                  <p class="text-[16px] text-[#aeb3b9]">หรือ</p>
                  <label
                    class="cursor-pointer rounded-[8px] bg-[#edeef0] px-[20px] py-[13px] text-[16px] font-medium text-[#777f87] hover:bg-[#e0e1e3]"
                  >
                    เลือกไฟล์
                    <input type="file" multiple class="hidden" @change="onFileSelect" />
                  </label>
                </div>
              </div>
              <div v-if="selectedFiles.length > 0" class="mt-[12px] space-y-[6px]">
                <div
                  v-for="(f, i) in selectedFiles"
                  :key="i"
                  class="flex items-center justify-between rounded-[6px] bg-[#f4f4f4] px-[14px] py-[10px]"
                >
                  <span class="text-[15px] text-[#3b4854]">{{ f.name }}</span>
                  <button
                    @click="selectedFiles.splice(i, 1)"
                    class="text-[#b2b6bb] hover:text-[#777f87]"
                  >
                    <IconX class="w-[16px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT SIDEBAR ===== -->
        <div
          class="w-[370px] shrink-0 sticky top-[20px] space-y-[10px] rounded-[10px] border border-[#e7e8e9] bg-white p-[20px]"
        >
          <p class="text-[20px] text-[#3b4854] mb-[20px]">การจัดการ</p>
          <!-- info box -->
          <div class="rounded-[10px] bg-[#e9fae2] p-[20px]">
            <p class="text-[15px] text-[#54bc1e] leading-[1.7]">
              เมื่อบันทึก ข้อมูลคดีจะถูกแบ่งส่วนเป็น รายละเอียดคดี, ไฟล์ประกอบคดี / เอกสารแนบ,
              การดำเนินคดี และบันทึกเพิ่มเติม
            </p>
          </div>

          <!-- actions card -->
          <div class="">
            <div class="space-y-[10px]">
              <button
                @click="handleSave()"
                :disabled="isLoading"
                class="flex w-full items-center justify-center gap-[10px] rounded-[6px] bg-[#0f182a] py-[14px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconVerified class="w-[20px] text-white" />
                บันทึก
              </button>

              <button
                @click="router.back()"
                class="flex w-full items-center justify-center rounded-[6px] bg-[#edeef0] py-[14px] text-[16px] font-medium text-[#8592a3] hover:bg-[#e0e1e3]"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
