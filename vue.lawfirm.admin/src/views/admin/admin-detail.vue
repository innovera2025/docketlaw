<script setup lang="ts">
import BaseShowData from '@/components/base/base-show-data.vue'
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
const activeTab = ref<'การทำงาน' | 'ความปลอดภัย'>('ความปลอดภัย')
const openBlock = ref(false)
const openUnblock = ref(false)
const openEditModal = ref(false)
const loginLogs = ref([] as any[])
const isLoadingLogs = ref(false)
const showPasswordHint = ref(true)

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
    //ipwho
    const res3 = await fetch(`https://ipwho.is/${ip}`)
    const data3 = await res3.json()

    if (data3.city && data3.country) {
      return `${data3.city}, ${data3.country}`
    }

    //freegeoip
    const res4 = await fetch(`https://freegeoip.app/json/${ip}`)
    const data4 = await res4.json()

    if (data4.city && data4.country) {
      return `${data4.city}, ${data4.country}`
    }

    //ininfo
    const res2 = await fetch(`https://ipinfo.io/${ip}/json`)
    const data2 = await res2.json()

    if (data2.region && data2.country) {
      return `${data2.region}, ${data2.country}`
    }

    return 'Unknown Location'
  } catch (error) {
    console.error('Error fetching location:', error)
    return 'Unknown Location'
  }
}

const handleUpdatePassword = async () => {
  // Reset errors
  newPasswordErrors.value = {
    password: '',
    confirmPassword: '',
  }

  // Validate
  if (!newPasswordForm.value.password) {
    newPasswordErrors.value.password = 'กรุณากรอกรหัสผ่าน'
    return
  }

  // Check password length (at least 8 characters)
  if (newPasswordForm.value.password.length < 8) {
    newPasswordErrors.value.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
    return
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(newPasswordForm.value.password)) {
    newPasswordErrors.value.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    return
  }

  // Check for special character
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
    // Reset form
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
    const res = await API(
      'amstx5\\User',
      'getByID',
      {
        id: +route.params.id,
      },
      '',
    )

    data.value = res.response_data
  } catch (error: any) {
    push.error('เกิดข้อผิดพลาด: ' + error.message)
  }
}

const handleOpenEditModal = () => {
  // Populate form with current data
  editFormData.value = {
    full_name: data.value?.details?.full_name || '',
    email: data.value?.details?.email || '',
    tel: data.value?.details?.tel || '',
    position: data.value?.details?.position || '',
    remark: data.value?.details?.remark || '',
  }
  openEditModal.value = true
}

const handleCloseEditModal = () => {
  openEditModal.value = false
  // Reset errors
  editFormErrors.value = {
    full_name: '',
    email: '',
    tel: '',
    position: '',
    remark: '',
  }
}

const handleUpdate = async () => {
  // Reset errors
  editFormErrors.value = {
    full_name: '',
    email: '',
    tel: '',
    position: '',
    remark: '',
  }

  // Validate
  if (!editFormData.value.full_name) {
    editFormErrors.value.full_name = 'กรุณากรอกชื่อ'
    return
  }

  if (!route.params.id) return

  try {
    const res = await API(
      'amstx5\\User',
      'updateDetailByID',
      {
        id: +route.params.id,
        details: {
          full_name: editFormData.value.full_name,
          email: editFormData.value.email,
          tel: editFormData.value.tel,
          position: editFormData.value.position,
          remark: editFormData.value.remark,
        },
      },
      '',
    )

    if (res.response_status) {
      push.success('อัปเดตข้อมูลสำเร็จ!')
      handleCloseEditModal()
      handleGetData()
    } else {
      push.error('อัปเดตข้อมูลไม่สำเร็จ!\n' + res.response_message)
    }
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

onMounted(async () => {
  await handleGetData()
  await handleLoginLog()
})
</script>

<template>
  <div class="grid grid-cols-3 gap-[25px]">
    <section class="space-y-4 mb-[15px] p-[20px] h-fit">
      <div class="mb-[30px]">
        <p class="title text-[#3B4854]">ผู้ดูแลระบบ</p>
        <p class="subtitle">จัดการข้อมูลผู้ดูแลระบบ และสิทธิในการเข้าใช้งานระบบ</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="mb-[10px]">
          <div
            v-if="!data?.details?.image"
            class="size-[120px] flex items-center text-7xl mx-auto justify-center text-white bg-primary rounded-[10px]"
          >
            <p class="pb-4 uppercase">
              {{ data?.details?.full_name ? data?.details?.full_name?.charAt(0) : 'U' }}
            </p>
          </div>
          <img
            v-else
            :src="data?.details?.image"
            class="size-[120px] rounded-[10px] mx-auto object-cover"
          />
        </div>

        <div class="text-[20px] font-medium mb-[8px]">{{ data?.details?.full_name || '-' }}</div>
        <div class="px-[25px] py-[8px] rounded-[6px] bg-[#EDEFF1] text-[#8E9AAA] mb-[25px]">
          {{ data?.role ? data?.role.charAt(0).toUpperCase() + (data?.role.slice(1) || '') : '' }}
        </div>

        <div
          class="text-[20px] text-[#3B4854] font-regular w-full pb-[20px] mb-[25px] border-b-1 border-[#E7E8E9]"
        >
          ข้อมูลส่วนบุคคล
        </div>

        <base-show-data
          label="ชื่อ - นามสกุล"
          labelWidth="150px"
          :dataCheck="data?.details?.full_name"
          :class="{ 'text-[#AEB3B9]': !data?.details?.full_name }"
        >
          {{ data?.details?.full_name || 'ไม่ได้ระบุ' }}
        </base-show-data>
        <base-show-data
          label="บัญชีผู้ใช้"
          labelWidth="150px"
          :dataCheck="data?.username"
          :class="{ 'text-[#AEB3B9]': !data?.username }"
        >
          {{ data?.username || 'ไม่ได้ระบุ' }}
        </base-show-data>
        <base-show-data
          label="อีเมล"
          labelWidth="150px"
          :dataCheck="data?.details?.email"
          :class="{ 'text-[#AEB3B9]': !data?.details?.email }"
        >
          {{ data?.details?.email || 'ไม่ได้ระบุ' }}
        </base-show-data>
        <base-show-data
          label="เบอร์ติดต่อ"
          labelWidth="150px"
          :dataCheck="data?.details?.tel"
          :class="{ 'text-[#AEB3B9]': !data?.details?.tel }"
        >
          {{ data?.details?.tel || 'ไม่ได้ระบุ' }}
        </base-show-data>
        <base-show-data
          label="หมายเหตุ"
          labelWidth="150px"
          :dataCheck="data?.details?.remark"
          :class="{ 'text-[#AEB3B9]': !data?.details?.remark }"
        >
          {{ data?.details?.remark || 'ไม่ได้ระบุ' }}
        </base-show-data>

        <div class="flex items-center gap-[20px] w-full mt-[30px]">
          <base-button
            variant="primary"
            class="!text-white rounded-[6px] !bg-[#0F182A]"
            @click="handleOpenEditModal"
          >
            <iconPencil /> แก้ไข
          </base-button>
          <base-button
            :class="{
              '!bg-[#FFE3E0] !text-[#FF725D]': data?.is_ban === 0,
              '!bg-[#E9FAE2] !text-[#78DF42]': data?.is_ban === 1,
            }"
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
            {{ data?.is_ban === 1 ? 'เริ่มใช้งาน' : 'หยุดใช้งาน' }}
          </base-button>
        </div>
      </div>
    </section>
    <div class="col-span-2">
      <base-button
        variant="primary"
        class="!text-white rounded-[6px] !bg-[#0F182A] mb-[25px]"
        @click=""
      >
        <iconLock /> ความปลอดภัย
      </base-button>

      <section class="space-y-4 mb-[15px] p-[20px]">
        <div class="text-[20px] text-[#3B4854] font-regular w-full mb-[20px]">เปลี่ยนรหัสผ่าน</div>

        <div class="bg-[#FFF2DB] rounded-[10px] px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <p class="text-[18px] text-[#FFAB00]">ตรวจสอบให้แน่ใจว่าเป็นไปตามข้อกำหนดเหล่านี้</p>
            <p class="text-[15px] text-[#FFAB00]">
              ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์
            </p>
          </div>
          <!-- <IconX class="text-[#FFAB00]" /> -->
        </div>

        <div class="flex items-start gap-[25px]">
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

      <!-- <section class="mb-[15px]">
        <div
          class="text-[20px] text-[#3B4854] font-regular w-full pb-[20px] border-b-1 border-[#E7E8E9] p-[20px]"
        >
          ประวัติการเข้าสู่ระบบ
        </div>
        <div class="overflow-auto max-h-[700px]">
          <table class="w-full min-w-[900px]">
            <thead>
              <tr class="text-[14px] text-[#3B4854] border-b-1 border-[#E7E8E9]">
                <th class="font-medium pl-[25px] px-[15px] py-[20px] text-left">บราวเซอร์</th>
                <th class="font-medium px-[15px] py-[20px] text-left">เครื่อง</th>
                <th class="font-medium px-[15px] py-[20px] text-left">จุดเข้าใช้งาน</th>
                <th class="font-medium pr-[25px] px-[15px] pr-[15px] py-[20px] text-left">
                  วันเวลาที่เข้าใช้งาน
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="text-[16px] text-[#3B4854] border-b-1 border-[#E7E8E9]">
                <td class="pl-[25px] pr-[15px] py-[15px] w-[250px]">
                  <div class="flex items-center gap-[10px]">
                    <IconWindows class="text-[#00BCD4]" />
                    <div class="">Chrome on Windows</div>
                  </div>
                </td>
                <td class="px-[15px] py-[15px]">Windows 11 PC</td>
                <td class="px-[15px] py-[15px]">กรุงเทพฯ, ประเทศไทย</td>
                <td class="pr-[25px] px-[15px] py-[15px]">10, ตุลาคม 2025 10:10</td>
              </tr>
              <tr class="text-[16px] text-[#3B4854]">
                <td class="pl-[25px] pr-[15px] w-[250px]">
                  <div class="flex items-center gap-[10px]">
                    <IconMac class="text-[#000000]" />
                    <div class="">Chrome on macOS</div>
                  </div>
                </td>
                <td class="px-[15px] py-[15px]">Windows 11 PC</td>
                <td class="px-[15px] py-[15px]">กรุงเทพฯ, ประเทศไทย</td>
                <td class="pr-[25px] px-[15px] py-[15px]">10, ตุลาคม 2025 10:10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section> -->
    </div>
  </div>

  <base-modal
    v-if="openBlock"
    open
    title="หยุดใช้งาน"
    subtitle="ผู้ใช้จะไม่สามารถเข้าใช้งานระบบได้"
    action-button
    action-text="หยุด"
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
    title="เริ่มใช้งาน"
    subtitle="ผู้ใช้จะสามารถเข้าใช้งานระบบได้"
    action-button
    action-text="เริ่ม"
    :showBody="false"
    @primary="handleUnblock()"
    @close="
      () => {
        openUnblock = false
      }
    "
  >
  </base-modal>

  <base-modal
    v-if="openEditModal"
    open
    title="แก้ไขข้อมูลผู้ดูแลระบบ"
    subtitle="อัปเดตรายละเอียดเบื้องต้นของผู้ดูแลระบบ"
    size="lg"
    action-button
    action-text="บันทึก"
    @primary="handleUpdate()"
    @close="handleCloseEditModal"
  >
    <div class="grid grid-cols-2 gap-[15px] mb-[25px]">
      <baseTextInput
        v-model="editFormData.full_name"
        label="ชื่อ"
        labelType="vertical"
        placeholder="กรอก"
        :error="editFormErrors.full_name"
        required
      />

      <baseTextInput
        v-model="editFormData.email"
        label="อีเมล"
        labelType="vertical"
        placeholder="example@email.com"
        :error="editFormErrors.email"
      />

      <baseTextInput
        v-model="editFormData.tel"
        label="เบอร์ติดต่อ"
        labelType="vertical"
        placeholder="กรอก"
        :error="editFormErrors.tel"
      />

      <baseTextInput
        v-model="editFormData.position"
        label="ตำแหน่ง"
        labelType="vertical"
        placeholder="กรอก"
        :error="editFormErrors.position"
      />
    </div>

    <baseTextarea
      v-model="editFormData.remark"
      label="หมายเหตุ"
      labelType="vertical"
      placeholder="กรอกหากมี"
      :error="editFormErrors.remark"
    />
  </base-modal>
</template>
