<script setup lang="ts">
import { md5 } from 'js-md5'
import { useUserStore } from '@/stores'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import moment from 'moment/min/moment-with-locales'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const route = useRoute()
const router = useRouter()
const data = ref({} as any)
const openDelete = ref(false)
const deleteUserId = ref<number | null>(null)
const verify = ref({} as any)
const main_lawyer_id = ref(0)
const package_data = ref({} as any)

const currentUserId = localStorage.getItem('lawyer_user_id')

const openCreate = ref(false)
const formError = ref({} as any)

const defaultCreateForm = () => ({
  name: '',
  email: '',
  tel: '',
  type: 'lawyer' as 'lawyer' | 'employee',
  license_no: '',
  specialization: '',
  department: '',
  remark: '',
  is_ban: 1 as number,
  username: '',
  password: '',
  is_add_appointment: 0 as number,
  is_edit_appointment: 0 as number,
  is_delete_appointment: 0 as number,
  is_change_appointment_status: 0 as number,
  is_add_case: 0 as number,
  is_add_case_step: 0 as number,
  is_delete_case: 0 as number,
  is_edit_case: 0 as number,
  is_edit_case_step: 0 as number,
  is_delete_case_step: 0 as number,
  is_upload_document: 0 as number,
  is_download_document: 0 as number,
  is_delete_document: 0 as number,
  is_preview_file: 0 as number,
  is_request_ocr: 0 as number,
  is_search_ocr: 0 as number,
  is_delete_employee: 0 as number,
  is_view_employee_detail: 0 as number,
  is_manage_access: 0 as number,
  is_add_employee: 0 as number,
  is_view_history: 0 as number,
  is_edit_employee: 0 as number,
  is_export_report: 0 as number,
  is_financial_report: 0 as number,
  is_sec_calendar: 1 as number,
  is_sec_cases: 1 as number,
  is_sec_documents: 1 as number,
  is_sec_ocr: 1 as number,
  is_sec_employee: 1 as number,
  is_sec_report: 1 as number,
  is_export_report: 0 as number,
  is_financial_report: 0 as number,
  is_sec_package: 1 as number,
  is_subscribe_package: 0 as number,
  is_update_payment_info: 0 as number,
  is_payment_history: 0 as number,
})

const createForm = ref(defaultCreateForm())

watch(openCreate, () => {
  createForm.value = defaultCreateForm()
})

watch(
  () => createForm.value.type,
  (val) => {
    if (val === 'employee') {
      createForm.value.license_no = ''
      createForm.value.specialization = ''
      createForm.value.department = ''
    }
  },
)

watch(
  () => createForm.value.is_sec_calendar,
  (val) => {
    if (!val) {
      createForm.value.is_add_appointment = 0
      createForm.value.is_edit_appointment = 0
      createForm.value.is_delete_appointment = 0
      createForm.value.is_change_appointment_status = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_cases,
  (val) => {
    if (!val) {
      createForm.value.is_add_case = 0
      createForm.value.is_add_case_step = 0
      createForm.value.is_delete_case = 0
      createForm.value.is_edit_case = 0
      createForm.value.is_edit_case_step = 0
      createForm.value.is_delete_case_step = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_documents,
  (val) => {
    if (!val) {
      createForm.value.is_upload_document = 0
      createForm.value.is_download_document = 0
      createForm.value.is_delete_document = 0
      createForm.value.is_preview_file = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_ocr,
  (val) => {
    if (!val) {
      createForm.value.is_request_ocr = 0
      createForm.value.is_search_ocr = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_employee,
  (val) => {
    if (!val) {
      createForm.value.is_delete_employee = 0
      createForm.value.is_view_employee_detail = 0
      createForm.value.is_manage_access = 0
      createForm.value.is_add_employee = 0
      createForm.value.is_view_history = 0
      createForm.value.is_edit_employee = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_report,
  (val) => {
    if (!val) {
      createForm.value.is_export_report = 0
      createForm.value.is_financial_report = 0
    }
  },
)

watch(
  () => createForm.value.is_sec_package,
  (val) => {
    if (!val) {
      createForm.value.is_subscribe_package = 0
      createForm.value.is_update_payment_info = 0
      createForm.value.is_payment_history = 0
    }
  },
)

const handleCreate = async () => {
  if (
    !package_data.value.current_package ||
    new Date(package_data.value.expire_date) < new Date()
  ) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  formError.value = {}
  const is_error = ref(false)
  if (!createForm.value.name.trim()) {
    formError.value.name = 'กรุณากรอกชื่อ'
    is_error.value = true
  }

  if (!createForm.value.email.trim()) {
    formError.value.email = 'กรุณากรอกอีเมล'
    is_error.value = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.value.email.trim())) {
    formError.value.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    is_error.value = true
  }

  if (createForm.value.is_ban) {
    if (!createForm.value.username.trim()) {
      formError.value.username = 'กรุณากรอกชื่อผู้ใช้'
      is_error.value = true
    }
    if (!createForm.value.password.trim()) {
      formError.value.password = 'กรุณากรอกรหัสผ่าน'
      is_error.value = true
    } else if (createForm.value.password.length < 8) {
      formError.value.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
      is_error.value = true
    } else if (!/[A-Z]/.test(createForm.value.password)) {
      formError.value.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
      is_error.value = true
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(createForm.value.password)) {
      formError.value.password = 'รหัสผ่านต้องมีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว'
      is_error.value = true
    }
  }

  if (is_error.value) {
    return
  }

  const { ...d } = createForm.value
  // const userKey = md5(new Date().getTime().toString() + Math.random().toString())

  const res = await API('specific\\lawfirm\\lawyer_user', 'insert', {
    main_lawyer_id: main_lawyer_id.value,
    username: d.username,
    password: md5(d.password),
    details: {
      full_name: d.name,
      email: d.email,
      tel: d.tel,
      type: d.type,
      license_no: d.license_no,
      specialization: d.specialization,
      department: d.department,
      remark: d.remark,
      is_login: d.is_ban ? 1 : 0,
      permissions: {
        is_sec_calendar: d.is_ban ? (d.is_sec_calendar ? 1 : 0) : 0,
        is_add_appointment: d.is_ban ? (d.is_add_appointment ? 1 : 0) : 0,
        is_edit_appointment: d.is_ban ? (d.is_edit_appointment ? 1 : 0) : 0,
        is_delete_appointment: d.is_ban ? (d.is_delete_appointment ? 1 : 0) : 0,
        is_change_appointment_status: d.is_ban ? (d.is_change_appointment_status ? 1 : 0) : 0,

        is_sec_cases: d.is_ban ? (d.is_sec_cases ? 1 : 0) : 0,
        is_add_case: d.is_ban ? (d.is_add_case ? 1 : 0) : 0,
        is_add_case_step: d.is_ban ? (d.is_add_case_step ? 1 : 0) : 0,
        is_delete_case: d.is_ban ? (d.is_delete_case ? 1 : 0) : 0,
        is_edit_case: d.is_ban ? (d.is_edit_case ? 1 : 0) : 0,
        is_edit_case_step: d.is_ban ? (d.is_edit_case_step ? 1 : 0) : 0,
        is_delete_case_step: d.is_ban ? (d.is_delete_case_step ? 1 : 0) : 0,

        is_sec_documents: d.is_ban ? (d.is_sec_documents ? 1 : 0) : 0,
        is_upload_document: d.is_ban ? (d.is_upload_document ? 1 : 0) : 0,
        is_download_document: d.is_ban ? (d.is_download_document ? 1 : 0) : 0,
        is_delete_document: d.is_ban ? (d.is_delete_document ? 1 : 0) : 0,
        is_preview_file: d.is_ban ? (d.is_preview_file ? 1 : 0) : 0,

        is_sec_ocr: d.is_ban ? (d.is_sec_ocr ? 1 : 0) : 0,
        is_request_ocr: d.is_ban ? (d.is_request_ocr ? 1 : 0) : 0,
        is_search_ocr: d.is_ban ? (d.is_search_ocr ? 1 : 0) : 0,

        is_sec_employee: d.is_ban ? (d.is_sec_employee ? 1 : 0) : 0,
        is_delete_employee: d.is_ban ? (d.is_delete_employee ? 1 : 0) : 0,
        is_view_employee_detail: d.is_ban ? (d.is_view_employee_detail ? 1 : 0) : 0,
        is_manage_access: d.is_ban ? (d.is_manage_access ? 1 : 0) : 0,
        is_add_employee: d.is_ban ? (d.is_add_employee ? 1 : 0) : 0,
        is_view_history: d.is_ban ? (d.is_view_history ? 1 : 0) : 0,
        is_edit_employee: d.is_ban ? (d.is_edit_employee ? 1 : 0) : 0,

        is_sec_report: d.is_ban ? (d.is_sec_report ? 1 : 0) : 0,
        is_export_report: d.is_ban ? (d.is_export_report ? 1 : 0) : 0,
        is_financial_report: d.is_ban ? (d.is_financial_report ? 1 : 0) : 0,

        is_sec_package: d.is_ban ? (d.is_sec_package ? 1 : 0) : 0,
        is_subscribe_package: d.is_ban ? (d.is_subscribe_package ? 1 : 0) : 0,
        is_update_payment_info: d.is_ban ? (d.is_update_payment_info ? 1 : 0) : 0,
        is_payment_history: d.is_ban ? (d.is_payment_history ? 1 : 0) : 0,
      },
    },
  })

  if (res.response_status) {
    if (d.is_ban === 0) {
      await API('amstx5\\User', 'ban', { id: res.response_data }, true)
    }
    push.success('เพิ่มข้อมูลสำเร็จ!')
    openCreate.value = false
    await handleSelect()
  } else {
    if (res.response_message.includes('Duplicate entry')) {
      push.warning('บัญชีผู้ใช้นี้ถูกใช้ไปแล้ว!')
    } else if (res.response_message.includes('Email already exists')) {
      push.warning('อีเมลนี้ถูกใช้ไปแล้ว!')
    } else {
      push.error('เพิ่มข้อมูลไม่สำเร็จ!\n' + res.response_message)
    }
  }
}

const handleDelete = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'delete', { user_id: deleteUserId.value })
  if (res.response_status) {
    push.success('ลบข้อมูลสำเร็จ!')
    openDelete.value = false
    deleteUserId.value = null
    await handleSelect()
  } else {
    push.error('ลบข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleVerify = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'verify', {
    user_id: localStorage.getItem('lawyer_user_id'),
    username: localStorage.getItem('lawyer_username'),
    hash: localStorage.getItem('lawyer_hash'),
  })

  if (res.response_status) {
    verify.value = res.response_data
    main_lawyer_id.value =
      res.response_data.main_lawyer_id || localStorage.getItem('lawyer_user_id')
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleSelect = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'select', {
    main_lawyer_id: main_lawyer_id.value,
  })

  if (res.response_status) {
    data.value = res.response_data
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
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
  await handleVerify()
  await handleSelect()
})
</script>

<template>
  <section class="space-y-4 gap-4">
    <div class="flex gap-4 flex-wrap items-center justify-between px-[20px] pt-[15px]">
      <div>
        <p class="title">ข้อมูลพนักงาน, ทนาย</p>
        <p class="subtitle">จัดการข้อมูลพนักงาน, ทนายความ และสิทธิในการเข้าใช้งานระบบ</p>
      </div>

      <div class="flex gap-2">
        <base-button
          v-if="p.is_add_employee"
          class="ml-auto !bg-[#0F182A]"
          @click="openCreate = true"
        >
          เพิ่มข้อมูล
        </base-button>
      </div>
    </div>
    <div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'data_name',
              field_search: 'data_name',
              header: 'ชื่อข้อมูล',
              search: 'text',
              sort: true,
              minWidth: '200px',
            },
            {
              field: 'is_ban',
              field_search: 'is_ban',
              header: 'สิทธิการเข้าสู่ระบบ',
              search: 'select',
              sort: true,
              options: [
                { value: 1, name: 'Active' },
                { value: 0, name: 'Inactive' },
              ],
              width: '1%',
            },
            {
              field: 'type',
              field_search: 'type',
              header: 'ประเภทพนักงาน',
              search: 'select',
              sort: true,
              options: [
                { value: 'employee', name: 'พนักงานทั่วไป' },
                { value: 'lawyer', name: 'ทนายความ' },
              ],
              width: '1%',
            },
            {
              field: 'email',
              field_search: 'email',
              header: 'อีเมล',
              search: 'text',
              sort: true,
              width: '1%',
            },
            {
              field: 'tel',
              field_search: 'tel',
              header: 'เบอร์โทรศัพท์',
              search: 'text',
              sort: true,
              width: '1%',
            },
            {
              field: 'department',
              field_search: 'department',
              header: 'สังกัด',
              search: 'text',
              sort: true,
              minWidth: '150px',
            },
            {
              field: 'remark',
              field_search: 'remark',
              header: 'หมายเหตุ',
              search: 'text',
              sort: true,
              width: '240px',
            },
            {
              field: 'actions',
              header: 'การจัดการ',
              width: '1%',
            },
          ],
        }"
        :data="
          (data?.users || []).map((item: any) => ({
            ...item,
            data_name: item?.details?.full_name || '',
            is_ban: +item?.is_ban || 0,
            type: item?.details?.type || '',
            email: item?.details?.email || '',
            tel: item?.details?.tel || '',
            department: item?.details?.department || '',
            remark: item?.details?.remark || '',
          })) || []
        "
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @download=""
        @edit=""
        @delete=""
      >
        <template #cell-data_name="{ row }">
          <div class="flex items-center gap-[10px]">
            <div
              class="size-[40px] min-w-[40px] rounded-full overflow-hidden bg-primary flex items-center justify-center"
            >
              <p class="mb-1 text-[25px] font-bold capitalize text-white">
                {{ row.data_name[0] || 'U' }}
              </p>
            </div>
            <div class="">
              <div class="text-[16px]">{{ row.data_name }}</div>
              <!-- <div class="text-[14px] text-[#777F87]">{{ row.position }}</div> -->
            </div>
          </div>
        </template>
        <template #cell-is_ban="{ row }">
          <div
            class="py-[8px] px-[15px] w-fit rounded-[6px] text-[16px] font-regular"
            :class="{
              'bg-[#E9FAE2] text-[#78DF42]': !+row.is_ban,
              'bg-[#EDEFF1] text-[#8E9AAA]': +row.is_ban,
            }"
          >
            {{ !+row.is_ban ? 'Active' : 'Inactive' }}
          </div>
        </template>
        <template #cell-type="{ row }">
          {{ row.type === 'employee' ? 'พนักงานทั่วไป' : row.type === 'lawyer' ? 'ทนายความ' : '-' }}
        </template>
        <template #cell-email="{ row }">
          <div class="text-[#777F87]">{{ row.email || '-' }}</div>
        </template>
        <template #cell-tel="{ row }">
          <div class="text-[#777F87]">{{ row.tel || '-' }}</div>
        </template>
        <template #cell-department="{ row }">
          <div :class="!row.department ? 'text-[#777F87]' : ''">
            {{ row.department || 'ไม่สังกัด' }}
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1 items-center justify-end">
            <base-icon-button-table
              v-if="p.is_delete_employee && Number(row.id) !== Number(currentUserId)"
              iconName="Trash"
              class="!rounded-full"
              @click="
                () => {
                  deleteUserId = row.id
                  openDelete = true
                }
              "
            />
            <base-icon-button-table
              v-if="p.is_view_employee_detail"
              iconName="Share"
              class="!rounded-full"
              @click="router.push(`/employee/${row.id}`)"
            />
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Create Modal -->
    <base-modal
      v-if="openCreate"
      :open="openCreate"
      title="เพิ่มข้อมูลพนักงาน"
      variant="black"
      position="right"
      size="xl"
      @primary="handleCreate()"
      @close="openCreate = false"
    >
      <div class="grid grid-cols-2 divide-x divide-[#E7E8E9] h-full">
        <!-- Left: ข้อมูลส่วนบุคคล -->
        <div class="p-5 space-y-4 overflow-y-auto">
          <p class="text-[18px] font-semibold text-[#3B4854]">ข้อมูลส่วนบุคคล</p>

          <base-text-input
            v-model="createForm.name"
            label="ชื่อ"
            label-type="vertical"
            placeholder="กรอก"
            required
            :error="formError.name"
          />

          <base-text-input
            v-model="createForm.email"
            label="อีเมล"
            type="email"
            label-type="vertical"
            placeholder="example@email.com"
            required
            :error="formError.email"
          />

          <base-text-input
            v-model="createForm.tel"
            label="เบอร์ติดต่อ"
            label-type="vertical"
            placeholder="กรอก"
          />

          <!-- ประเภทพนักงาน -->
          <div class="space-y-2">
            <p class="text-[15px] text-[#3B4854]">ประเภทพนักงาน</p>
            <div class="flex gap-3">
              <!-- ทนายความ -->
              <button
                class="w-[130px] flex flex-col items-center justify-between pt-5 pb-4 px-4 rounded-[10px] border-2 transition-all"
                :class="
                  createForm.type === 'lawyer'
                    ? 'border-dashed border-[#C29F5F] bg-[#FFF2DB]'
                    : 'border-[#E7E8E9] bg-white'
                "
                style="min-height: 140px"
                @click="createForm.type = 'lawyer'"
              >
                <IconLawScales
                  width="26"
                  height="26"
                  :class="createForm.type === 'lawyer' ? 'text-[#C29F5F]' : 'text-[#8E9AAB]'"
                />
                <span
                  class="text-[15px] mt-2"
                  :class="createForm.type === 'lawyer' ? 'text-[#C29F5F]' : 'text-[#3B4854]'"
                  >ทนายความ</span
                >
                <div
                  class="mt-3 size-[20px] rounded-full border-2 flex items-center justify-center transition-all"
                  :class="
                    createForm.type === 'lawyer'
                      ? 'border-[#C29F5F] bg-[#C29F5F]'
                      : 'border-[#91969C] bg-white'
                  "
                >
                  <div
                    v-if="createForm.type === 'lawyer'"
                    class="size-[8px] rounded-full bg-white"
                  />
                </div>
              </button>

              <!-- พนักงานทั่วไป -->
              <button
                class="w-[130px] flex flex-col items-center justify-between pt-5 pb-4 px-4 rounded-[10px] border-2 transition-all"
                :class="
                  createForm.type === 'employee'
                    ? 'border-dashed border-[#C29F5F] bg-[#FFF2DB]'
                    : 'border-[#E7E8E9] bg-white'
                "
                style="min-height: 140px"
                @click="createForm.type = 'employee'"
              >
                <IconEmployeeCard
                  width="28"
                  height="25"
                  :class="createForm.type === 'employee' ? 'text-[#C29F5F]' : 'text-[#777F87]'"
                />
                <span
                  class="text-[15px] mt-2"
                  :class="createForm.type === 'employee' ? 'text-[#C29F5F]' : 'text-[#3B4854]'"
                  >พนักงานทั่วไป</span
                >
                <div
                  class="mt-3 size-[20px] rounded-full border-2 flex items-center justify-center transition-all"
                  :class="
                    createForm.type === 'employee'
                      ? 'border-[#C29F5F] bg-[#C29F5F]'
                      : 'border-[#91969C] bg-white'
                  "
                >
                  <div
                    v-if="createForm.type === 'employee'"
                    class="size-[8px] rounded-full bg-white"
                  />
                </div>
              </button>
            </div>
          </div>

          <!-- รายละเอียดทนายความ -->
          <div v-if="createForm.type === 'lawyer'" class="rounded-[8px] bg-[#F3F3F4] p-4 space-y-4">
            <p class="text-[15px] font-semibold text-[#3B4854]">รายละเอียดทนายความ</p>
            <base-text-input
              v-model="createForm.license_no"
              label="เลขใบประกอบวิชาชีพ"
              label-type="vertical"
              placeholder="กรอก"
              inputClass="bg-white"
            />
            <base-data-dropdown-multi-select
              v-model="createForm.specialization"
              label="ความเชี่ยวชาญเฉพาะ"
              label-type="vertical"
              :options="[
                { value: 'คดีแพ่ง', name: 'คดีแพ่ง' },
                { value: 'คดีอาญา', name: 'คดีอาญา' },
                { value: 'คดีครอบครัว', name: 'คดีครอบครัว' },
                { value: 'คดีแรงงาน', name: 'คดีแรงงาน' },
                { value: 'คดีภาษี', name: 'คดีภาษี' },
                { value: 'คดีล้มละลาย', name: 'คดีล้มละลาย' },
                { value: 'คดีปกครอง', name: 'คดีปกครอง' },
                { value: 'คดีสิ่งแวดล้อม', name: 'คดีสิ่งแวดล้อม' },
              ]"
              placeholder="เลือก"
              :multiple="true"
            />
            <base-data-dropdown-multi-select
              v-model="createForm.department"
              label="สังกัด"
              label-type="vertical"
              :options="[
                { value: 'ฝ่ายกฎหมาย', name: 'ฝ่ายกฎหมาย' },
                { value: 'ฝ่ายบริหาร', name: 'ฝ่ายบริหาร' },
                { value: 'ฝ่ายบัญชี', name: 'ฝ่ายบัญชี' },
                { value: 'ฝ่ายบุคคล', name: 'ฝ่ายบุคคล' },
                { value: 'ฝ่ายไอที', name: 'ฝ่ายไอที' },
              ]"
              placeholder="ไม่สังกัด"
            />
          </div>

          <base-textarea
            v-model="createForm.remark"
            label="หมายเหตุ"
            label-type="vertical"
            placeholder="กรอก"
            :rows="4"
          />
        </div>

        <!-- Right: สิทธิการเข้าใช้งานระบบ -->
        <div class="flex flex-col overflow-hidden">
          <!-- scrollable content -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <p class="text-[18px] font-semibold text-[#3B4854] mb-[5px]">สิทธิการเข้าใช้งานระบบ</p>
            <p class="text-[15px] text-[#777F87]">คุณสามารถปรับแต่งสิทธิได้หลังจากบันทึกข้อมูล</p>

            <div class="flex items-center gap-3">
              <base-toggle
                v-model="createForm.is_ban"
                :helper="
                  createForm.is_ban ? 'สามารถเข้าใช้งานระบบได้' : 'ไม่สามารถเข้าใช้งานระบบได้'
                "
              />
            </div>

            <base-text-input
              v-model="createForm.username"
              label="บัญชีผู้ใช้ / Username"
              label-type="vertical"
              placeholder="กรอก"
              required
              :error="formError.username"
            />

            <base-text-input
              v-model="createForm.password"
              type="password"
              label="รหัสผ่านตั้งต้น"
              label-type="vertical"
              placeholder="••••••"
              required
              helper="ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์"
              :error="formError.password"
            />

            <template v-if="createForm.is_ban === 1">
              <!-- Permission Sections -->
              <div class="space-y-3 mt-[25px]">
                <!-- ปฎิทินนัดหมาย -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconCalendar class="flex-shrink-0 text-[#8E9AAB]" />

                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">ปฎิทินนัดหมาย</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดการนัดหมาย วันขึ้นศาล และกำหนดการต่างๆ
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_calendar" />
                  </div>
                  <template v-if="createForm.is_sec_calendar === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [
                            createForm.is_add_appointment,
                            createForm.is_edit_appointment,
                            createForm.is_delete_appointment,
                          ].filter((v) => v).length
                        }}/3 สิทธิ</span
                      >
                      <button
                        v-if="
                          [
                            createForm.is_add_appointment,
                            createForm.is_edit_appointment,
                            createForm.is_delete_appointment,
                          ].filter((v) => v).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_add_appointment = 1
                            createForm.is_edit_appointment = 1
                            createForm.is_delete_appointment = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_add_appointment = 0
                            createForm.is_edit_appointment = 0
                            createForm.is_delete_appointment = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox v-model="createForm.is_add_appointment" label="เพิ่มนัดหมาย" />
                      <base-checkbox
                        v-model="createForm.is_edit_appointment"
                        label="แก้ไขนัดหมาย"
                      />
                      <base-checkbox v-model="createForm.is_delete_appointment" label="ลบนัดหมาย" />
                    </div>
                  </template>
                </div>

                <!-- แฟ้มคดี -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconCaseFile class="flex-shrink-0 text-[#8E9AAB]" />
                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">แฟ้มคดี</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดการข้อมูลคดี ลูกความ และเอกสารที่เกี่ยวข้อง
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_cases" />
                  </div>
                  <template v-if="createForm.is_sec_cases === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [
                            createForm.is_add_case,
                            createForm.is_add_case_step,
                            createForm.is_delete_case,
                            createForm.is_edit_case,
                            createForm.is_edit_case_step,
                            createForm.is_delete_case_step,
                          ].filter((v) => v).length
                        }}/6 สิทธิ</span
                      >
                      <button
                        v-if="
                          [
                            createForm.is_add_case,
                            createForm.is_add_case_step,
                            createForm.is_delete_case,
                            createForm.is_edit_case,
                            createForm.is_edit_case_step,
                            createForm.is_delete_case_step,
                          ].filter((v) => v).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_add_case = 1
                            createForm.is_add_case_step = 1
                            createForm.is_delete_case = 1
                            createForm.is_edit_case = 1
                            createForm.is_edit_case_step = 1
                            createForm.is_delete_case_step = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_add_case = 0
                            createForm.is_add_case_step = 0
                            createForm.is_delete_case = 0
                            createForm.is_edit_case = 0
                            createForm.is_edit_case_step = 0
                            createForm.is_delete_case_step = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox v-model="createForm.is_add_case" label="เพิ่มคดีใหม่" />
                      <base-checkbox
                        v-model="createForm.is_add_case_step"
                        label="เพิ่มขั้นตอนของคดี"
                      />
                      <base-checkbox v-model="createForm.is_edit_case" label="แก้ไขข้อมูลคดี" />
                      <base-checkbox
                        v-model="createForm.is_edit_case_step"
                        label="แก้ไขขั้นตอนของคดี"
                      />
                      <base-checkbox v-model="createForm.is_delete_case" label="ลบคดี" />

                      <base-checkbox
                        v-model="createForm.is_delete_case_step"
                        label="ลบขั้นตอนของคดี"
                      />
                    </div>
                  </template>
                </div>

                <!-- ระบบจัดเก็บข้อมูล -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconFile class="flex-shrink-0 text-[#8E9AAB]" />
                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">ระบบจัดเก็บข้อมูล</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดเก็บและจัดการเอกสาร รูปภาพ และวิดีโอ
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_documents" />
                  </div>
                  <template v-if="createForm.is_sec_documents === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [
                            createForm.is_upload_document,
                            createForm.is_download_document,
                            createForm.is_delete_document,
                            createForm.is_preview_file,
                          ].filter((v) => v).length
                        }}/4 สิทธิ</span
                      >
                      <button
                        v-if="
                          [
                            createForm.is_upload_document,
                            createForm.is_download_document,
                            createForm.is_delete_document,
                            createForm.is_preview_file,
                          ].filter((v) => v).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_upload_document = 1
                            createForm.is_download_document = 1
                            createForm.is_delete_document = 1
                            createForm.is_preview_file = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_upload_document = 0
                            createForm.is_download_document = 0
                            createForm.is_delete_document = 0
                            createForm.is_preview_file = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox
                        v-model="createForm.is_upload_document"
                        label="อัปโหลดเอกสาร"
                      />
                      <base-checkbox
                        v-model="createForm.is_download_document"
                        label="ดาวน์โหลดเอกสาร"
                      />
                      <base-checkbox v-model="createForm.is_delete_document" label="ลบเอกสาร" />
                      <base-checkbox v-model="createForm.is_preview_file" label="ดูตัวอย่างไฟล์" />
                    </div>
                  </template>
                </div>

                <!-- ระบบค้นหาและอ่านเอกสาร OCR -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconOcr class="flex-shrink-0 text-[#8E9AAB]" />

                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">
                        ระบบค้นหาและอ่านเอกสาร OCR
                      </p>
                      <p class="text-[13px] text-[#777F87]">สแกนและค้นหาข้อความจากเอกสาร</p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_ocr" />
                  </div>
                  <template v-if="createForm.is_sec_ocr === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [createForm.is_request_ocr, createForm.is_search_ocr].filter((v) => v)
                            .length
                        }}/2 สิทธิ</span
                      >
                      <button
                        v-if="
                          [createForm.is_request_ocr, createForm.is_search_ocr].filter((v) => v)
                            .length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_request_ocr = 1
                            createForm.is_search_ocr = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_request_ocr = 0
                            createForm.is_search_ocr = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox v-model="createForm.is_request_ocr" label="ขอสแกน OCR" />
                      <base-checkbox v-model="createForm.is_search_ocr" label="ค้นหาเนื้อหา OCR" />
                    </div>
                  </template>
                </div>

                <!-- ข้อมูลพนักงาน, ทนาย -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconProfile class="flex-shrink-0 text-[#8E9AAB]" />
                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">ข้อมูลพนักงาน, ทนาย</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดการข้อมูลพนักงาน บทบาท และสิทธิ์การเข้าถึง
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_employee" />
                  </div>
                  <template v-if="createForm.is_sec_employee === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [
                            createForm.is_delete_employee,
                            createForm.is_view_employee_detail,
                            createForm.is_manage_access,
                            createForm.is_add_employee,
                            createForm.is_view_history,
                            createForm.is_edit_employee,
                          ].filter((v) => v).length
                        }}/6 สิทธิ</span
                      >
                      <button
                        v-if="
                          [
                            createForm.is_delete_employee,
                            createForm.is_view_employee_detail,
                            createForm.is_manage_access,
                            createForm.is_add_employee,
                            createForm.is_view_history,
                            createForm.is_edit_employee,
                          ].filter((v) => v).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_delete_employee = 1
                            createForm.is_view_employee_detail = 1
                            createForm.is_manage_access = 1
                            createForm.is_add_employee = 1
                            createForm.is_view_history = 1
                            createForm.is_edit_employee = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_delete_employee = 0
                            createForm.is_view_employee_detail = 0
                            createForm.is_manage_access = 0
                            createForm.is_add_employee = 0
                            createForm.is_view_history = 0
                            createForm.is_edit_employee = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox
                        v-model="createForm.is_add_employee"
                        label="เพิ่มพนักงานใหม่"
                      />

                      <base-checkbox
                        v-model="createForm.is_manage_access"
                        label="จัดการสิทธิเข้าถึง"
                      />

                      <base-checkbox
                        v-model="createForm.is_edit_employee"
                        label="แก้ไขข้อมูลพนักงาน"
                      />

                      <base-checkbox
                        v-model="createForm.is_view_history"
                        label="ดูประวัติการใช้งาน"
                      />

                      <base-checkbox
                        v-model="createForm.is_view_employee_detail"
                        label="ดูรายละเอียดพนักงาน"
                      />

                      <base-checkbox v-model="createForm.is_delete_employee" label="ลบพนักงาน" />
                    </div>
                  </template>
                </div>

                <!-- ภาพรวมและรายงาน -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconGraph class="flex-shrink-0 text-[#8E9AAB]" />
                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">ภาพรวมและรายงาน</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดเก็บและจัดการเอกสาร รูปภาพ และวิดีโอ
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_report" />
                  </div>
                  <template v-if="createForm.is_sec_report === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [createForm.is_export_report, createForm.is_financial_report].filter(
                            (v) => v,
                          ).length
                        }}/2 สิทธิ</span
                      >
                      <button
                        v-if="
                          [createForm.is_export_report, createForm.is_financial_report].filter(
                            (v) => v,
                          ).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_export_report = 1
                            createForm.is_financial_report = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_export_report = 0
                            createForm.is_financial_report = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox v-model="createForm.is_export_report" label="ส่งออกรายงาน" />
                      <base-checkbox
                        v-model="createForm.is_financial_report"
                        label="รายงานการเงิน"
                      />
                    </div>
                  </template>
                </div>

                <!-- แพ็กเกจและการชำระเงิน -->
                <div class="border border-[#E7E8E9] rounded-[15px] overflow-hidden">
                  <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                    <IconPackage class="flex-shrink-0 text-[#8E9AAB]" />
                    <div class="flex-1 min-w-0">
                      <p class="text-[15px] font-medium text-[#3B4854]">แพ็กเกจและการชำระเงิน</p>
                      <p class="text-[13px] text-[#777F87]">
                        จัดการแพ็กเกจ ข้อมูลการชำระเงิน และประวัติการชำระเงิน
                      </p>
                    </div>
                    <base-toggle v-model="createForm.is_sec_package" />
                  </div>
                  <template v-if="createForm.is_sec_package === 1">
                    <div
                      class="border-t border-[#E7E8E9] px-4 py-2 flex justify-between items-center"
                    >
                      <span class="text-[14px] text-[#777F87]"
                        >{{
                          [
                            createForm.is_subscribe_package,
                            createForm.is_update_payment_info,
                            createForm.is_payment_history,
                          ].filter((v) => v).length
                        }}/3 สิทธิ</span
                      >
                      <button
                        v-if="
                          [
                            createForm.is_subscribe_package,
                            createForm.is_update_payment_info,
                            createForm.is_payment_history,
                          ].filter((v) => v).length === 0
                        "
                        class="text-[14px] text-[#22C55E]"
                        @click="
                          () => {
                            createForm.is_subscribe_package = 1
                            createForm.is_update_payment_info = 1
                            createForm.is_payment_history = 1
                          }
                        "
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        v-else
                        class="text-[14px] text-[#FF725D]"
                        @click="
                          () => {
                            createForm.is_subscribe_package = 0
                            createForm.is_update_payment_info = 0
                            createForm.is_payment_history = 0
                          }
                        "
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                    <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                      <base-checkbox
                        v-model="createForm.is_subscribe_package"
                        label="สมัคร Package"
                      />
                      <base-checkbox
                        v-model="createForm.is_update_payment_info"
                        label="อัปเดตข้อมูล"
                      />
                      <base-checkbox
                        v-model="createForm.is_payment_history"
                        label="ประวัติการชำระเงิน"
                      />
                    </div>
                  </template>
                </div>
              </div> </template
            ><!-- end v-if is_ban -->
          </div>
          <!-- end scrollable -->

          <!-- sticky bottom buttons -->
          <div
            class="sticky bottom-0 bg-white border-t border-[#E7E8E9] px-5 py-4 flex justify-start gap-3"
          >
            <button
              class="h-[50px] px-[30px] rounded-[6px] text-[16px] font-medium text-white bg-[#0F182A] hover:bg-[#0F182A]/80 transition-all"
              @click="handleCreate()"
            >
              บันทึก
            </button>
            <button
              class="h-[50px] w-[85px] rounded-[6px] text-[16px] font-medium text-[#8E9AAB] bg-[#EDEFF1] hover:bg-[#E0E2E5] transition-all"
              @click="openCreate = false"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </base-modal>

    <!-- Delete Modal -->
    <base-modal
      v-if="openDelete"
      open
      title="ลบพนักงาน,ทนาย"
      subtitle="การลบ พนักงาน,ทนาย จะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบ พนักงาน,ทนาย คนนี้ออกจากระบบ?"
      action-button
      action-text="ลบ"
      variant="danger"
      :showBody="false"
      @primary="handleDelete()"
      @close="
        () => {
          openDelete = false
          deleteUserId = null
        }
      "
    >
    </base-modal>
  </section>
</template>
