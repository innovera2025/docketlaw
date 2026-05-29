<script setup lang="ts">
import { useUserStore } from '@/stores'
import type { userAdminType } from '@/type/userType'
import { push } from 'notivue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API } from '@/api'
import { md5 } from 'js-md5'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const openBlock = ref(false)
const openUnblock = ref(false)
const openEditModal = ref(false)
const loginLogs = ref([] as any[])
const isLoadingLogs = ref(false)
const renewHistory = ref([] as any[])

const newPasswordForm = ref({
  password: '',
  confirmPassword: '',
})

const newPasswordErrors = ref({
  password: '',
  confirmPassword: '',
})

const editFormData = ref({
  full_name: '',
  email: '',
  tel: '',
  position: '',
  remark: '',
})

const editFormErrors = ref({
  full_name: '',
  email: '',
  tel: '',
  position: '',
  remark: '',
})

const data = ref({} as any)

const storageUsedBytes = computed(() => Number(data.value?.payment_info?.storage_in_use_byte ?? 0))
const storageTotalBytes = computed(() =>
  Number(data.value?.payment_info?.current_package?.storage_size_in_byte ?? 0),
)
const storagePercent = computed(() => {
  if (!storageTotalBytes.value) return 0
  return Math.min((storageUsedBytes.value / storageTotalBytes.value) * 100, 100)
})
const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024 * 1024)).toLocaleString('en', { maximumFractionDigits: 2 })} GB`
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toLocaleString('en', { maximumFractionDigits: 2 })} MB`
  if (bytes >= 1024)
    return `${(bytes / 1024).toLocaleString('en', { maximumFractionDigits: 2 })} KB`
  return `${bytes} B`
}

const parseBrowser = (userAgent: string) => {
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge'
  }

  // Detect OS
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows'
  } else if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
    os = 'macOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS'
  }

  return `${browser} on ${os}`
}

const parseDevice = (userAgent: string, isMobile: boolean) => {
  if (isMobile) {
    if (userAgent.includes('iPhone')) return 'iPhone'
    if (userAgent.includes('iPad')) return 'iPad'
    if (userAgent.includes('Android')) return 'Android Mobile'
    return 'Mobile Device'
  }

  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11 PC'
  if (userAgent.includes('Windows')) return 'Windows PC'
  if (userAgent.includes('Macintosh')) {
    if (userAgent.includes('MacBook')) return 'MacBook'
    return 'Apple Mac'
  }
  if (userAgent.includes('Linux')) return 'Linux PC'

  return 'Desktop Computer'
}

const getLocationFromIP = async (ip: string) => {
  if (!ip) return 'Unknown Location'
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`)
    const data = await response.json()

    if (data.city && data.country) {
      return `${data.city}, ${data.country}`
    }
    return 'Unknown Location'
  } catch (error) {
    console.error('Error fetching location:', error)
    return 'Unknown Location'
  }
}

const handleUpdatePassword = async () => {
  newPasswordErrors.value = {
    password: '',
    confirmPassword: '',
  }

  if (!newPasswordForm.value.password) {
    newPasswordErrors.value.password = 'กรุณากรอกรหัสผ่าน'
    return
  }

  if (newPasswordForm.value.password.length < 8) {
    newPasswordErrors.value.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
    return
  }

  if (!/[A-Z]/.test(newPasswordForm.value.password)) {
    newPasswordErrors.value.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    return
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordForm.value.password)) {
    newPasswordErrors.value.password = 'รหัสผ่านต้องมีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว'
    return
  }

  if (!newPasswordForm.value.confirmPassword) {
    newPasswordErrors.value.confirmPassword = 'กรุณากรอกยืนยันรหัสผ่าน'
    return
  }

  if (newPasswordForm.value.password !== newPasswordForm.value.confirmPassword) {
    newPasswordErrors.value.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  if (!route.params.id) return

  const res = await API(
    'amstx5\\User',
    'updatePasswordByID',
    {
      id: +route.params.id,
      new_password: md5(newPasswordForm.value.password),
    },
    '',
  )

  if (res.response_status) {
    push.success('เปลี่ยนรหัสผ่านสําเร็จ!')
    newPasswordForm.value = {
      password: '',
      confirmPassword: '',
    }
    handleGetData()
    return
  } else {
    push.error('เปลี่ยนรหัสผ่านไม่สําเร็จ!\n' + res.response_message)
    return
  }
}

const handleBlock = async () => {
  if (!route.params.id) return

  const res = await API(
    'amstx5\\User',
    'ban',
    {
      id: +route.params.id,
    },
    '',
  )

  if (res.response_status) {
    push.success('บล็อคผู้ใช้สำเร็จ!')
    openBlock.value = false
    handleGetData()
    await store.verify()
    return
  } else {
    push.error('บล็อคผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
    return
  }
}

const handleUnblock = async () => {
  if (!route.params.id) return

  const res = await API(
    'amstx5\\User',
    'unBan',
    {
      id: +route.params.id,
    },
    '',
  )

  if (res.response_status) {
    push.success('ปลดบล็อคผู้ใช้สำเร็จ!')
    openUnblock.value = false
    handleGetData()
    await store.verify()
    return
  } else {
    push.error('ปลดบล็อคผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
    return
  }
}

const handleGetData = async () => {
  try {
    const res = await API('specific\\lawfirm\\lawyer_user', 'getMainByID', {
      main_lawyer_id: +route.params.id,
    })

    data.value = res.response_data
  } catch (error: any) {
    push.error('เกิดข้อผิดพลาด: ' + error.message)
  }
}

const handleLoginLog = async () => {
  try {
    const res = await API(
      'amstx5\\User_Log',
      'select',
      {
        start_date: '',
        end_date: '',
        where: {
          type: 'login',
          user_id: +route.params.id,
        },
        order_by: 'datetime DESC',
      },
      '',
    )

    const logsWithDetails = await Promise.all(
      res.response_data.map(async (item: any) => {
        const details = JSON.parse(item.insert_detail)
        // const location = await getLocationFromIP(details.ip)

        return {
          ...item,
          browser: parseBrowser(details.user_agent),
          device: parseDevice(details.user_agent, details.is_mobile),
          location: details.ip,
          icon_name: details.user_agent.includes('Windows')
            ? 'windows'
            : details.user_agent.includes('Macintosh')
              ? 'mac'
              : 'other',
        }
      }),
    )

    loginLogs.value = logsWithDetails
    isLoadingLogs.value = true
  } catch (error: any) {
    push.error('เกิดข้อผิดพลาด: ' + error.message)
    isLoadingLogs.value = false
  } finally {
    isLoadingLogs.value = false
  }
}

const handleRenewHistory = async () => {
  try {
    const res = await API('specific\\lawfirm\\lawyer_package', 'selectPaymentHistory', {
      main_lawyer_id: +route.params.id,
    })
    renewHistory.value = (res.response_data || []).map((item: any) => ({
      ...item,
      package: item.package_detail?.name || '-',
      renew_cost: item.price,
    }))
  } catch (error: any) {
    push.error('เกิดข้อผิดพลาด: ' + error.message)
  }
}

onMounted(async () => {
  await handleGetData()
  await handleRenewHistory()
  await handleLoginLog()
})
</script>

<template>
  <div class="space-y-[30px] max-w-[1065px] mx-auto">
    <section class="space-y-4 !border-0">
      <div class="flex items-center justify-between gap-[20px] mb-[35px]">
        <div class="">
          <p class="title text-[#3B4854]">รายละเอียดสมาชิก</p>
          <p class="subtitle">
            บันทึกรายละเอียดสมาชิก เช็คประวัติการเข้าสู่ระบบ และประวัติการต่ออายุแพ็กเกจ
          </p>
        </div>
        <base-button
          :class="{
            '!bg-[#FFE3E0] !text-[#FF725D]': data?.is_ban == 0,
            '!bg-[#E9FAE2] !text-[#78DF42]': data?.is_ban == 1,
          }"
          class="bg-[#FFE3E0] text-[#FF725D]"
          @click="
            () => {
              if (data?.is_ban === 1) {
                openUnblock = true
              } else {
                openBlock = true
              }
            }
          "
        >
          {{ data?.is_ban === 1 ? 'เปิดใช้งาน' : 'ระงับบัญชี' }}
        </base-button>
      </div>

      <div class="flex flex-col items-center">
        <div class="mb-[10px]">
          <div
            class="size-[120px] flex items-center text-7xl mx-auto justify-center text-white bg-primary rounded-full"
          >
            <p class="pb-2 uppercase">
              {{ data?.details?.name ? data?.details?.full_name?.charAt(0) : 'U' }}
            </p>
          </div>
        </div>

        <div class="text-[20px] font-medium">{{ data?.details?.full_name }}</div>
        <div class="text-[16px] text-[#777F87]">{{ data?.details?.email }}</div>
      </div>
    </section>

    <div class="grid grid-cols-3 gap-[20px] mb-[20px] max-[800px]:grid-cols-1">
      <section class="overflow-hidden py-[20px] px-[25px]">
        <div class="text-[20px] mb-[5px]">การใช้งานพื้นที่จัดเก็บ</div>
        <div class="text-[20px] font-bold">
          {{ data?.payment_info?.current_package?.name || '-' }}
        </div>
        <div v-if="data?.payment_info?.current_package" class="mt-[8px]">
          <div class="flex justify-between text-[13px] text-[#3b4854] mb-[6px]">
            <span>ใช้แล้ว {{ formatBytes(storageUsedBytes) }}</span>
            <span
              >จาก
              {{
                Number(data?.payment_info?.current_package?.storage_size || 0).toLocaleString(
                  'en',
                  { maximumFractionDigits: 0 },
                )
              }}{{ data?.payment_info?.current_package?.storage_unit || '' }}</span
            >
          </div>
          <div class="w-full h-[8px] bg-[#e7e8e9] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#78df42] rounded-full"
              :style="{ width: storagePercent + '%' }"
            ></div>
          </div>
        </div>
      </section>
      <section class="overflow-hidden py-[20px] px-[25px]">
        <div class="text-[20px] mb-[5px]">เครดิต OCR</div>
        <div class="text-[20px] font-bold">STANDARD</div>
        <div class="mt-[8px]">
          <div class="flex justify-between text-[13px] text-[#3b4854] mb-[6px]">
            <span>ใช้แล้ว 100 เครดิต</span>
            <span>จาก 1 เครดิต</span>
          </div>
          <div class="w-full h-[8px] bg-[#e7e8e9] rounded-full overflow-hidden">
            <div class="h-full bg-[#78df42] rounded-full" :style="{ width: '15%' }"></div>
          </div>
        </div>
      </section>
      <section class="overflow-hidden py-[20px] px-[25px]">
        <div class="text-[20px] mb-[15px]">จำนวนทนายและพนักงานที่บันทึก</div>
        <div class="grid grid-cols-2">
          <div class="border-r border-[#E7E8E9]">
            <div class="text-[13px]">พนักงาน</div>
            <div class="text-[40px] font-semibold">
              {{
                Number((data?.employee_count || 0).toString()).toLocaleString('en', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </div>
          </div>
          <div class="pl-[25px]">
            <div class="text-[13px]">ทนายความ</div>
            <div class="text-[40px] font-semibold">
              {{
                Number((data?.lawyer_count || 0).toString()).toLocaleString('en', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="mb-[15px] overflow-hidden py-[20px] px-[25px]">
      <div class="text-[20px] mb-[20px]">ข้อมูลการเรียกเก็บเงิน</div>
      <hr class="my-[20px] border-[#E7E8E9] border-dashed" />
      <div class="grid grid-cols-2">
        <base-show-data label="ชื่อ-นามสกุล" labelWidth="150px">
          {{ data?.payment_info?.name || '-' }} {{ data?.payment_info?.surname || '' }}
        </base-show-data>
        <base-show-data label="อีเมล" labelWidth="150px">
          {{ data?.payment_info?.email || '-' }}
        </base-show-data>
        <base-show-data label="ที่อยู่" labelWidth="150px">
          {{
            [
              data?.payment_info?.address,
              data?.payment_info?.province ? 'จ.' + data.payment_info.province : '',
              data?.payment_info?.country ? 'ประเทศ' + data.payment_info.country : '',
              data?.payment_info?.postcode,
            ]
              .filter(Boolean)
              .join(' ') || '-'
          }}
        </base-show-data>
      </div>
    </section>

    <section class="mb-[15px] overflow-hidden py-[20px] px-[25px]">
      <div class="text-[20px] mb-[20px]">แพ็กเกจปัจจุบัน</div>
      <div v-if="!data?.payment_info?.current_package" class="space-y-[6px]">
        <p class="text-[18px] font-semibold text-[#3b4854]">ยังไม่มี Package</p>
        <p class="text-[15px] text-[#777f87]">กรุณาสมัคร Package</p>
      </div>
      <template v-else>
        <div class="text-[18px] font-bold">{{ data.payment_info.current_package.name }}</div>
        <div class="text-[16px] mt-[4px]">
          {{ (+data.payment_info.current_package.price).toLocaleString('th-TH') }} บาท/{{
            data.payment_info.current_package.type
          }}
        </div>
        <div
          v-if="data.payment_info.current_package.description"
          class="text-[14px] text-[#777F87] mt-[2px]"
        >
          {{ data.payment_info.current_package.description }}
        </div>
        <div class="text-[14px] text-[#777F87] mt-[8px]">
          วันหมดอายุ:
          {{
            data.payment_info.expire_date
              ? new Date(data.payment_info.expire_date).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '-'
          }}
        </div>
      </template>
    </section>

    <section class="mb-[15px] overflow-hidden py-[20px] px-[25px]">
      <div class="text-[20px] mb-[20px]">เปลี่ยนรหัสผ่าน</div>

      <div class="bg-[#FFF2DB] rounded-[10px] px-5 py-4 flex items-start gap-3 mb-[20px]">
        <div>
          <p class="text-[18px] text-[#FFAB00]">ตรวจสอบให้แน่ใจว่าเป็นไปตามข้อกำหนดเหล่านี้</p>
          <p class="text-[15px] text-[#FFAB00]">
            ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์
          </p>
        </div>
      </div>

      <div class="flex items-start gap-[25px] mb-[20px]">
        <baseTextInput
          v-model="newPasswordForm.password"
          type="password"
          label="รหัสผ่านใหม่"
          labelType="vertical"
          placeholder="••••••••"
          :error="newPasswordErrors.password"
        />
        <baseTextInput
          v-model="newPasswordForm.confirmPassword"
          type="password"
          label="ยืนยันรหัสผ่าน"
          labelType="vertical"
          placeholder="••••••••"
          :error="newPasswordErrors.confirmPassword"
        />
      </div>

      <base-button
        variant="primary"
        class="!text-white rounded-[6px] !bg-[#0F182A]"
        @click="handleUpdatePassword"
      >
        เปลี่ยนรหัสผ่าน
      </base-button>
    </section>

    <section class="mb-[15px] overflow-hidden !border-b-0">
      <div class="text-[20px] text-[#3B4854] font-regular w-full pb-[20px] p-[20px]">
        ประวัติการเข้าสู่ระบบ
      </div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'browser',
              header: 'บราวเซอร์',
              // field_search: 'browser',
              // search: 'text',
              // sort: true,
            },
            {
              field: 'device',
              header: 'เครื่อง',
              // field_search: 'device',
              // search: 'text',
              // sort: true,
            },
            {
              field: 'location',
              header: 'จุดเข้าใช้งาน',
              // field_search: 'location',
              // search: 'text',
              // sort: true,
            },
            {
              field: 'insert_date_time',
              header: 'วันเวลาที่เข้าใช้งาน',
              // field_search: 'datetime',
              search: 'date-show-time',
              // sort: true,
            },
          ],
        }"
        :data="loginLogs"
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        :text_no_data="!isLoadingLogs ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีข้อมูล'"
      >
        <template #cell-browser="{ row }">
          <div class="flex items-center gap-[10px]">
            <IconWindows v-if="row.icon_name === 'windows'" class="text-[#00BCD4]" />
            <IconMac v-else-if="row.icon_name === 'mac'" class="text-[#000000]" />
            <div class="">{{ row.browser }}</div>
          </div>
        </template>
        <template #cell-location="{ row }">
          <a
            v-if="row.location"
            :href="`https://ipinfo.io/${row.location}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#007AE8] underline hover:opacity-70"
          >
            <IconMapPin class="inline-block mr-1 text-[#007AE8] min-w-[20px]" />
            {{ row.location }}
          </a>
          <span v-else class="text-[#AEB3B9]">-</span>
        </template>
      </BaseDataTable>
    </section>

    <section class="”mb-[15px]" overflow-hidden !border-b-0”>
      <div class="”text-[20px]" text-[#3B4854] font-regular w-full pb-[20px] p-[20px]”>
        ประวัติการต่ออายุสมาชิก
      </div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'insert_date_time',
              header: 'เมื่อ',
              search: 'date-show-time',
            },
            {
              field: 'ref_code',
              header: 'เลขที่อ้างอิง',
            },
            {
              field: 'package',
              header: 'แพ็กเกจ',
            },
            {
              field: 'renew_cost',
              header: 'ยอดชำระ',
              search: 'decimal',
            },
            {
              field: 'status',
              header: 'สถานะ',
            },
          ],
        }"
        :data="renewHistory"
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        text_no_data="ยังไม่มีข้อมูล"
      >
        <template #cell-status="{ row }">
          <div
            class="py-[6px] px-[12px] w-fit rounded-[8px] text-[15px]"
            :class="{
              'bg-[#FFF2DB] text-[#FFAB00]': row.status === 'waiting',
              'bg-[#E9FAE2] text-[#78DF42]': row.status === 'approve',
              'bg-[#FFE3E0] text-[#FF725D]': row.status === 'reject',
            }"
          >
            {{
              row.status === 'waiting'
                ? 'รอตรวจสอบ'
                : row.status === 'approve'
                  ? 'ชำระแล้ว'
                  : row.status === 'reject'
                    ? 'ปฏิเสธ'
                    : row.status
            }}
          </div>
        </template>
        <template #cell-renew_cost="{ row }">
          {{ (+row.renew_cost).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} บาท
        </template>
      </BaseDataTable>
    </section>
  </div>

  <base-modal
    v-if="openBlock"
    open
    title="ระงับบัญชี"
    subtitle="ผู้ใช้จะไม่สามารถเข้าใช้งานระบบได้"
    action-button
    action-text="ระงับบัญชี"
    variant="danger"
    :showBody="false"
    @primary="handleBlock()"
    @close="
      () => {
        openBlock = false
      }
    "
  >
  </base-modal>

  <base-modal
    v-if="openUnblock"
    open
    title="เปิดใช้งานบัญชี"
    subtitle="ผู้ใช้จะสามารถเข้าใช้งานระบบได้"
    action-button
    action-text="เปิดใช้งาน"
    :showBody="false"
    @primary="handleUnblock()"
    @close="
      () => {
        openUnblock = false
      }
    "
  >
  </base-modal>
</template>
