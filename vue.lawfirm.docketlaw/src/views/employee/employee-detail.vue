<script setup lang="ts">
import { md5 } from 'js-md5'
import { API } from '@/api'
import { onMounted, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const route = useRoute()
const router = useRouter()

const activeTab = ref<'การทำงาน' | 'ความปลอดภัย'>('การทำงาน')

const data = ref({} as any)
const timeline = ref([] as any[])
const loginLogs = ref([] as any[])
const isLoadingLogs = ref(false)
const newPasswordForm = ref({
  password: '',
  confirmPassword: '',
})
const newPasswordErrors = ref({
  password: '',
  confirmPassword: '',
})

const permissions = ref({
  is_sec_calendar: 1 as number,
  is_add_appointment: 0 as number,
  is_edit_appointment: 0 as number,
  is_delete_appointment: 0 as number,
  is_change_appointment_status: 0 as number,
  is_sec_cases: 1 as number,
  is_add_case: 0 as number,
  is_add_case_step: 0 as number,
  is_delete_case: 0 as number,
  is_edit_case: 0 as number,
  is_edit_case_step: 0 as number,
  is_delete_case_step: 0 as number,
  is_sec_documents: 1 as number,
  is_upload_document: 0 as number,
  is_download_document: 0 as number,
  is_delete_document: 0 as number,
  is_preview_file: 0 as number,
  is_sec_ocr: 1 as number,
  is_request_ocr: 0 as number,
  is_search_ocr: 0 as number,
  is_sec_employee: 1 as number,
  is_delete_employee: 0 as number,
  is_view_employee_detail: 0 as number,
  is_manage_access: 0 as number,
  is_add_employee: 0 as number,
  is_view_history: 0 as number,
  is_edit_employee: 0 as number,
  is_sec_report: 0 as number,
  is_export_report: 0 as number,
  is_financial_report: 0 as number,
  is_sec_package: 1 as number,
  is_subscribe_package: 0 as number,
  is_update_payment_info: 0 as number,
  is_payment_history: 0 as number,
})

watch(
  () => permissions.value.is_sec_calendar,
  (val) => {
    if (!val) {
      permissions.value.is_add_appointment = 0
      permissions.value.is_edit_appointment = 0
      permissions.value.is_delete_appointment = 0
      permissions.value.is_change_appointment_status = 0
    }
  },
)
watch(
  () => permissions.value.is_sec_cases,
  (val) => {
    if (!val) {
      permissions.value.is_add_case = 0
      permissions.value.is_add_case_step = 0
      permissions.value.is_delete_case = 0
      permissions.value.is_edit_case = 0
      permissions.value.is_edit_case_step = 0
      permissions.value.is_delete_case_step = 0
    }
  },
)
watch(
  () => permissions.value.is_sec_documents,
  (val) => {
    if (!val) {
      permissions.value.is_upload_document = 0
      permissions.value.is_download_document = 0
      permissions.value.is_delete_document = 0
      permissions.value.is_preview_file = 0
    }
  },
)
watch(
  () => permissions.value.is_sec_ocr,
  (val) => {
    if (!val) {
      permissions.value.is_request_ocr = 0
      permissions.value.is_search_ocr = 0
    }
  },
)
watch(
  () => permissions.value.is_sec_employee,
  (val) => {
    if (!val) {
      permissions.value.is_delete_employee = 0
      permissions.value.is_view_employee_detail = 0
      permissions.value.is_manage_access = 0
      permissions.value.is_add_employee = 0
      permissions.value.is_view_history = 0
      permissions.value.is_edit_employee = 0
    }
  },
)
watch(
  () => permissions.value.is_sec_package,
  (val) => {
    if (!val) {
      permissions.value.is_subscribe_package = 0
      permissions.value.is_update_payment_info = 0
      permissions.value.is_payment_history = 0
    }
  },
)
const showAllPermissions = ref(true)

const isEditing = ref(false)
const openDelete = ref(false)
const editForm = ref({
  full_name: '',
  email: '',
  tel: '',
  type: 'lawyer' as 'lawyer' | 'employee',
  license_no: '',
  specialization: [] as string[],
  department: '',
  remark: '',
})

const handleEditStart = () => {
  editForm.value = {
    full_name: data.value?.details?.full_name || '',
    email: data.value?.details?.email || '',
    tel: data.value?.details?.tel || '',
    type: data.value?.details?.type || 'lawyer',
    license_no: data.value?.details?.license_no || '',
    specialization: data.value?.details?.specialization || [],
    department: data.value?.details?.department || '',
    remark: data.value?.details?.remark || '',
  }
  isEditing.value = true
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const openBlock = ref(false)
const openUnblock = ref(false)

const handleBlock = async () => {
  if (!route.params.id) return

  await API('specific\\lawfirm\\lawyer_user', 'update', {
    user_id: +route.params.id,
    details: {
      full_name: data.value?.details?.full_name || '',
      email: data.value?.details?.email || '',
      tel: data.value?.details?.tel || '',
      type: data.value?.details?.type || '',
      license_no: data.value?.details?.license_no || '',
      specialization: data.value?.details?.specialization || [],
      department: data.value?.details?.department || '',
      remark: data.value?.details?.remark || '',
      is_login: 0,
      permissions: {
        is_sec_calendar: permissions.value.is_sec_calendar ? 1 : 0,
        is_add_appointment: permissions.value.is_add_appointment ? 1 : 0,
        is_edit_appointment: permissions.value.is_edit_appointment ? 1 : 0,
        is_delete_appointment: permissions.value.is_delete_appointment ? 1 : 0,
        is_change_appointment_status: permissions.value.is_change_appointment_status ? 1 : 0,

        is_sec_cases: permissions.value.is_sec_cases ? 1 : 0,

        is_add_case: permissions.value.is_add_case ? 1 : 0,
        is_add_case_step: permissions.value.is_add_case_step ? 1 : 0,
        is_delete_case: permissions.value.is_delete_case ? 1 : 0,
        is_edit_case: permissions.value.is_edit_case ? 1 : 0,
        is_edit_case_step: permissions.value.is_edit_case_step ? 1 : 0,
        is_delete_case_step: permissions.value.is_delete_case_step ? 1 : 0,

        is_sec_documents: permissions.value.is_sec_documents ? 1 : 0,
        is_upload_document: permissions.value.is_upload_document ? 1 : 0,
        is_download_document: permissions.value.is_download_document ? 1 : 0,
        is_delete_document: permissions.value.is_delete_document ? 1 : 0,
        is_preview_file: permissions.value.is_preview_file ? 1 : 0,

        is_sec_ocr: permissions.value.is_sec_ocr ? 1 : 0,
        is_request_ocr: permissions.value.is_request_ocr ? 1 : 0,
        is_search_ocr: permissions.value.is_search_ocr ? 1 : 0,

        is_sec_employee: permissions.value.is_sec_employee ? 1 : 0,
        is_delete_employee: permissions.value.is_delete_employee ? 1 : 0,
        is_view_employee_detail: permissions.value.is_view_employee_detail ? 1 : 0,
        is_manage_access: permissions.value.is_manage_access ? 1 : 0,
        is_add_employee: permissions.value.is_add_employee ? 1 : 0,
        is_view_history: permissions.value.is_view_history ? 1 : 0,
        is_edit_employee: permissions.value.is_edit_employee ? 1 : 0,

        is_sec_report: permissions.value.is_sec_report ? 1 : 0,
        is_export_report: permissions.value.is_export_report ? 1 : 0,
        is_financial_report: permissions.value.is_financial_report ? 1 : 0,

        is_sec_package: permissions.value.is_sec_package ? 1 : 0,
        is_subscribe_package: permissions.value.is_subscribe_package ? 1 : 0,
        is_update_payment_info: permissions.value.is_update_payment_info ? 1 : 0,
        is_payment_history: permissions.value.is_payment_history ? 1 : 0,
      },
    },
  })

  const res = await API(
    'amstx5\\User',
    'ban',
    {
      id: +route.params.id,
    },
    true,
  )

  if (res.response_status) {
    push.success('บล็อคผู้ใช้สำเร็จ!')
    openBlock.value = false
    await handleSelect()
  } else {
    push.error('บล็อคผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleUnblock = async () => {
  if (!route.params.id) return

  await API('specific\\lawfirm\\lawyer_user', 'update', {
    user_id: +route.params.id,
    details: {
      full_name: data.value?.details?.full_name || '',
      email: data.value?.details?.email || '',
      tel: data.value?.details?.tel || '',
      type: data.value?.details?.type || '',
      license_no: data.value?.details?.license_no || '',
      specialization: data.value?.details?.specialization || [],
      department: data.value?.details?.department || '',
      remark: data.value?.details?.remark || '',
      is_login: 1,
      permissions: {
        is_sec_calendar: permissions.value.is_sec_calendar ? 1 : 0,
        is_add_appointment: permissions.value.is_add_appointment ? 1 : 0,
        is_edit_appointment: permissions.value.is_edit_appointment ? 1 : 0,
        is_delete_appointment: permissions.value.is_delete_appointment ? 1 : 0,
        is_change_appointment_status: permissions.value.is_change_appointment_status ? 1 : 0,

        is_sec_cases: permissions.value.is_sec_cases ? 1 : 0,

        is_add_case: permissions.value.is_add_case ? 1 : 0,
        is_add_case_step: permissions.value.is_add_case_step ? 1 : 0,
        is_delete_case: permissions.value.is_delete_case ? 1 : 0,
        is_edit_case: permissions.value.is_edit_case ? 1 : 0,
        is_edit_case_step: permissions.value.is_edit_case_step ? 1 : 0,
        is_delete_case_step: permissions.value.is_delete_case_step ? 1 : 0,

        is_sec_documents: permissions.value.is_sec_documents ? 1 : 0,
        is_upload_document: permissions.value.is_upload_document ? 1 : 0,
        is_download_document: permissions.value.is_download_document ? 1 : 0,
        is_delete_document: permissions.value.is_delete_document ? 1 : 0,
        is_preview_file: permissions.value.is_preview_file ? 1 : 0,

        is_sec_ocr: permissions.value.is_sec_ocr ? 1 : 0,
        is_request_ocr: permissions.value.is_request_ocr ? 1 : 0,
        is_search_ocr: permissions.value.is_search_ocr ? 1 : 0,

        is_sec_employee: permissions.value.is_sec_employee ? 1 : 0,
        is_delete_employee: permissions.value.is_delete_employee ? 1 : 0,
        is_view_employee_detail: permissions.value.is_view_employee_detail ? 1 : 0,
        is_manage_access: permissions.value.is_manage_access ? 1 : 0,
        is_add_employee: permissions.value.is_add_employee ? 1 : 0,
        is_view_history: permissions.value.is_view_history ? 1 : 0,
        is_edit_employee: permissions.value.is_edit_employee ? 1 : 0,

        is_sec_report: permissions.value.is_sec_report ? 1 : 0,
        is_export_report: permissions.value.is_export_report ? 1 : 0,
        is_financial_report: permissions.value.is_financial_report ? 1 : 0,

        is_sec_package: permissions.value.is_sec_package ? 1 : 0,
        is_subscribe_package: permissions.value.is_subscribe_package ? 1 : 0,
        is_update_payment_info: permissions.value.is_update_payment_info ? 1 : 0,
        is_payment_history: permissions.value.is_payment_history ? 1 : 0,
      },
    },
  })

  const res = await API(
    'amstx5\\User',
    'unBan',
    {
      id: +route.params.id,
    },
    true,
  )

  if (res.response_status) {
    push.success('ปลดบล็อคผู้ใช้สำเร็จ!')
    openUnblock.value = false
    await handleSelect()
  } else {
    push.error('ปลดบล็อคผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
  }
}

watch(
  () => editForm.value.type,
  (val) => {
    if (val === 'employee') {
      editForm.value.license_no = ''
      editForm.value.specialization = []
      editForm.value.department = ''
    }
  },
)

const handleSaveProfile = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'update', {
    user_id: +route.params.id,
    details: {
      full_name: editForm.value.full_name,
      email: editForm.value.email,
      tel: editForm.value.tel,
      type: editForm.value.type,
      license_no: editForm.value.license_no,
      specialization: editForm.value.specialization,
      department: editForm.value.department,
      remark: editForm.value.remark,
      is_login: data.value?.details?.is_login || 0,
      permissions: {
        is_sec_calendar: permissions.value.is_sec_calendar ? 1 : 0,
        is_add_appointment: permissions.value.is_add_appointment ? 1 : 0,
        is_edit_appointment: permissions.value.is_edit_appointment ? 1 : 0,
        is_delete_appointment: permissions.value.is_delete_appointment ? 1 : 0,
        is_change_appointment_status: permissions.value.is_change_appointment_status ? 1 : 0,
        is_sec_cases: permissions.value.is_sec_cases ? 1 : 0,

        is_add_case: permissions.value.is_add_case ? 1 : 0,
        is_add_case_step: permissions.value.is_add_case_step ? 1 : 0,
        is_delete_case: permissions.value.is_delete_case ? 1 : 0,
        is_edit_case: permissions.value.is_edit_case ? 1 : 0,
        is_edit_case_step: permissions.value.is_edit_case_step ? 1 : 0,
        is_delete_case_step: permissions.value.is_delete_case_step ? 1 : 0,
        is_sec_documents: permissions.value.is_sec_documents ? 1 : 0,
        is_upload_document: permissions.value.is_upload_document ? 1 : 0,
        is_download_document: permissions.value.is_download_document ? 1 : 0,
        is_delete_document: permissions.value.is_delete_document ? 1 : 0,
        is_preview_file: permissions.value.is_preview_file ? 1 : 0,
        is_sec_ocr: permissions.value.is_sec_ocr ? 1 : 0,
        is_request_ocr: permissions.value.is_request_ocr ? 1 : 0,
        is_search_ocr: permissions.value.is_search_ocr ? 1 : 0,
        is_sec_employee: permissions.value.is_sec_employee ? 1 : 0,
        is_delete_employee: permissions.value.is_delete_employee ? 1 : 0,
        is_view_employee_detail: permissions.value.is_view_employee_detail ? 1 : 0,
        is_manage_access: permissions.value.is_manage_access ? 1 : 0,
        is_add_employee: permissions.value.is_add_employee ? 1 : 0,
        is_view_history: permissions.value.is_view_history ? 1 : 0,
        is_edit_employee: permissions.value.is_edit_employee ? 1 : 0,
        is_sec_report: permissions.value.is_sec_report ? 1 : 0,
        is_export_report: permissions.value.is_export_report ? 1 : 0,
        is_financial_report: permissions.value.is_financial_report ? 1 : 0,

        is_sec_package: permissions.value.is_sec_package ? 1 : 0,
        is_subscribe_package: permissions.value.is_subscribe_package ? 1 : 0,
        is_update_payment_info: permissions.value.is_update_payment_info ? 1 : 0,
        is_payment_history: permissions.value.is_payment_history ? 1 : 0,
      },
    },
  })
  if (res.response_status) {
    data.value.details.full_name = editForm.value.full_name
    data.value.details.email = editForm.value.email
    data.value.details.tel = editForm.value.tel
    data.value.details.type = editForm.value.type
    data.value.details.license_no = editForm.value.license_no
    data.value.details.specialization = editForm.value.specialization
    data.value.details.department = editForm.value.department
    data.value.details.remark = editForm.value.remark
    push.success('บันทึกข้อมูลสำเร็จ!')
    isEditing.value = false
  } else {
    push.error('บันทึกข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleDelete = async () => {
  if (!route.params.id) return

  const res = await API('specific\\lawfirm\\lawyer_user', 'delete', { user_id: +route.params.id })
  if (res.response_status) {
    push.success('ลบข้อมูลสำเร็จ!')
    openDelete.value = false
    await router.push('/employee')
  } else {
    push.error('ลบข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

watch(
  () => permissions.value.is_sec_report,
  (val) => {
    if (!val) {
      permissions.value.is_export_report = 0
      permissions.value.is_financial_report = 0
    }
  },
)

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

const handleSelect = async () => {
  // TODO: call API to get employee data by route.params.id
  const res = await API(
    'amstx5\\User',
    'getByID',
    {
      id: route.params.id,
    },
    true,
  )
  if (res.response_status) {
    data.value = res.response_data
    const rawPerms = res?.response_data?.details?.permissions || {}
    const parsedPerms = Object.fromEntries(
      Object.entries(rawPerms).map(([k, v]) => [k, Number(v as string | number)]),
    )
    permissions.value = { ...permissions.value, ...parsedPerms }
    setTimeout(() => {
      watch(
        permissions,
        () => {
          handleUpdatePermissions()
        },
        { deep: true },
      )
    }, 200)
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }

  const typeStyle: Record<string, { color: string; bg: string }> = {
    login: { color: 'bg-[#74de3d]', bg: 'bg-[#e9fae2]' },
    logout: { color: 'bg-[#74de3d]', bg: 'bg-[#e9fae2]' },
    cases: { color: 'bg-[#ffab00]', bg: 'bg-[#fff2db]' },
    calendar: { color: 'bg-[#ff725d]', bg: 'bg-[#ffe3e0]' },
    file: { color: 'bg-[#16b1ff]', bg: 'bg-[#e7f5ff]' },
  }
  const timelineRes = await API('specific\\lawfirm\\timeline', 'select', {
    user_id: +route.params.id,
  })
  if (timelineRes?.response_status) {
    timeline.value = timelineRes.response_data.slice(0, 10).map((item: any) => ({
      action: item.name,
      detail: item.description,
      time: item.time,
      ...(typeStyle[item.type] ?? { color: 'bg-[#16b1ff]', bg: 'bg-[#e7f5ff]' }),
    }))
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
      true,
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
    isLoadingLogs.value = true
  }
}

const handleUpdatePermissions = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'update', {
    user_id: +route.params.id,
    details: {
      full_name: data.value?.details?.full_name || '',
      email: data.value?.details?.email || '',
      tel: data.value?.details?.tel || '',
      type: data.value?.details?.type || '',
      license_no: data.value?.details?.license_no || '',
      specialization: data.value?.details?.specialization || [],
      department: data.value?.details?.department || '',
      remark: data.value?.details?.remark || '',
      is_login: data.value?.details?.is_login || 0,
      permissions: {
        is_sec_calendar: permissions.value.is_sec_calendar ? 1 : 0,
        is_add_appointment: permissions.value.is_add_appointment ? 1 : 0,
        is_edit_appointment: permissions.value.is_edit_appointment ? 1 : 0,
        is_delete_appointment: permissions.value.is_delete_appointment ? 1 : 0,
        is_change_appointment_status: permissions.value.is_change_appointment_status ? 1 : 0,

        is_sec_cases: permissions.value.is_sec_cases ? 1 : 0,

        is_add_case: permissions.value.is_add_case ? 1 : 0,
        is_add_case_step: permissions.value.is_add_case_step ? 1 : 0,
        is_delete_case: permissions.value.is_delete_case ? 1 : 0,
        is_edit_case: permissions.value.is_edit_case ? 1 : 0,
        is_edit_case_step: permissions.value.is_edit_case_step ? 1 : 0,
        is_delete_case_step: permissions.value.is_delete_case_step ? 1 : 0,

        is_sec_documents: permissions.value.is_sec_documents ? 1 : 0,
        is_upload_document: permissions.value.is_upload_document ? 1 : 0,
        is_download_document: permissions.value.is_download_document ? 1 : 0,
        is_delete_document: permissions.value.is_delete_document ? 1 : 0,
        is_preview_file: permissions.value.is_preview_file ? 1 : 0,

        is_sec_ocr: permissions.value.is_sec_ocr ? 1 : 0,
        is_request_ocr: permissions.value.is_request_ocr ? 1 : 0,
        is_search_ocr: permissions.value.is_search_ocr ? 1 : 0,

        is_sec_employee: permissions.value.is_sec_employee ? 1 : 0,
        is_delete_employee: permissions.value.is_delete_employee ? 1 : 0,
        is_view_employee_detail: permissions.value.is_view_employee_detail ? 1 : 0,
        is_manage_access: permissions.value.is_manage_access ? 1 : 0,
        is_add_employee: permissions.value.is_add_employee ? 1 : 0,
        is_view_history: permissions.value.is_view_history ? 1 : 0,
        is_edit_employee: permissions.value.is_edit_employee ? 1 : 0,

        is_sec_report: permissions.value.is_sec_report ? 1 : 0,
        is_export_report: permissions.value.is_export_report ? 1 : 0,
        is_financial_report: permissions.value.is_financial_report ? 1 : 0,

        is_sec_package: permissions.value.is_sec_package ? 1 : 0,
        is_subscribe_package: permissions.value.is_subscribe_package ? 1 : 0,
        is_update_payment_info: permissions.value.is_update_payment_info ? 1 : 0,
        is_payment_history: permissions.value.is_payment_history ? 1 : 0,
      },
    },
  })
  if (res.response_status) {
    push.success('บันทึกสิทธิสำเร็จ!')
  } else {
    push.error('บันทึกสิทธิไม่สำเร็จ!\n' + res.response_message)
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
    true,
  )

  if (res.response_status) {
    push.success('เปลี่ยนรหัสผ่านสําเร็จ!')
    // Reset form
    newPasswordForm.value = {
      password: '',
      confirmPassword: '',
    }
    return
  } else {
    push.error('เปลี่ยนรหัสผ่านไม่สําเร็จ!\n' + res.response_message)
    return
  }
}

onMounted(async () => {
  await handleSelect()
  await handleLoginLog()
  if (!p.value.is_view_history) {
    activeTab.value = 'ความปลอดภัย'
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Body -->
    <div class="flex gap-[25px] items-start max-[1400px]:flex-col">
      <!-- Left: Profile Card -->
      <div
        class="relative flex flex-col border border-[#E7E8E9] rounded-[8px] overflow-hidden w-[520px] max-[1400px]:w-full"
      >
        <!-- Header -->
        <div class="flex gap-4 flex-wrap items-center justify-between p-6">
          <div>
            <p class="text-[22px] text-[#3B4854]">ข้อมูลพนักงาน</p>
            <p class="text-[16px] text-[#777F87]">
              จัดการข้อมูลพนักงาน, ทนายความ และสิทธิในการเข้าใช้งานระบบ
            </p>
          </div>
        </div>

        <!-- Profile Section -->
        <div class="flex flex-col items-center pt-10 pb-6 px-6">
          <!-- Avatar -->
          <div
            class="size-[120px] rounded-[10px] bg-[#3b4854] flex items-center justify-center overflow-hidden"
          >
            <span class="text-[48px] font-bold text-white uppercase">
              {{ data?.details?.full_name?.[0] || 'U' }}
            </span>
          </div>

          <!-- Name -->
          <p class="mt-4 text-[20px] font-semibold text-[#3b4854]">
            {{ data?.details?.full_name || '-' }}
          </p>

          <!-- Type badge -->
          <div class="mt-2 px-4 py-2 bg-[#EDEFF1] rounded-[6px]">
            <span class="text-[16px] text-[#8e9aaa]">{{
              data?.details?.type === 'lawyer' ? 'ทนายความ' : 'พนักงาน'
            }}</span>
          </div>
        </div>

        <p class="text-[20px] px-6 text-[#3b4854] mb-[20px]">ข้อมูลส่วนบุคคล</p>
        <!-- Divider -->
        <div class="h-px bg-[#E7E8E9] mx-6" />

        <!-- Info Section -->
        <div class="flex-1 px-6 pt-6 pb-4 space-y-[20px]">
          <!-- View mode -->
          <template v-if="!isEditing">
            <base-show-data label="อีเมล" label-width="180px">
              <span class="text-[16px] text-[#202125]">{{ data?.details?.email || '-' }}</span>
            </base-show-data>

            <base-show-data label="เบอร์ติดต่อ" label-width="180px">
              <span class="text-[16px] text-[#202125]">{{ data?.details?.tel || '-' }}</span>
            </base-show-data>

            <base-show-data label="ประเภทพนักงาน" label-width="180px">
              <span class="text-[16px] text-[#202125]">{{
                data?.details?.type === 'lawyer' ? 'ทนายความ' : 'พนักงาน'
              }}</span>
            </base-show-data>

            <base-show-data
              v-if="data?.details?.type === 'lawyer'"
              label="เลขใบประกอบวิชาชีพ"
              label-width="180px"
            >
              <span class="text-[16px] text-[#202125]">{{ data?.details?.license_no || '-' }}</span>
            </base-show-data>

            <base-show-data
              v-if="data?.details?.type === 'lawyer'"
              label="ความเชี่ยวชาญเฉพาะ"
              label-width="180px"
            >
              <div class="flex flex-wrap gap-2">
                <template v-if="data?.details?.specialization?.length">
                  <div
                    v-for="spec in data?.details?.specialization"
                    :key="spec"
                    class="px-3 py-[6px] bg-[#def3ff] rounded-[6px]"
                  >
                    <span class="text-[16px] text-[#16b1ff]">{{ spec }}</span>
                  </div>
                </template>
                <span v-else>-</span>
              </div>
            </base-show-data>

            <base-show-data
              v-if="data?.details?.type === 'lawyer'"
              label="สังกัด"
              label-width="180px"
            >
              <span class="text-[16px] text-[#202125]">{{ data?.details?.department || '-' }}</span>
            </base-show-data>

            <base-show-data label="หมายเหตุ" label-width="180px">
              {{ data?.details?.remark || '-' }}
            </base-show-data>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <base-text-input
              v-model="editForm.full_name"
              label="ชื่อ"
              label-type="vertical"
              placeholder="กรอก"
              required
            />

            <base-text-input
              v-model="editForm.email"
              label="อีเมล"
              label-type="vertical"
              placeholder="example@email.com"
            />

            <base-text-input
              v-model="editForm.tel"
              label="เบอร์ติดต่อ"
              label-type="vertical"
              placeholder="กรอก"
            />

            <!-- ประเภทพนักงาน -->
            <div class="space-y-2">
              <p class="text-[15px] text-[#3B4854]">ประเภทพนักงาน</p>
              <div class="flex gap-3">
                <button
                  class="w-[130px] flex flex-col items-center justify-between pt-5 pb-4 px-4 rounded-[10px] border-2 transition-all"
                  :class="
                    editForm.type === 'lawyer'
                      ? 'border-dashed border-[#C29F5F] bg-[#FFF2DB]'
                      : 'border-[#E7E8E9] bg-white'
                  "
                  style="min-height: 140px"
                  @click="editForm.type = 'lawyer'"
                >
                  <IconLawScales
                    width="26"
                    height="26"
                    :class="editForm.type === 'lawyer' ? 'text-[#C29F5F]' : 'text-[#8E9AAB]'"
                  />
                  <span
                    class="text-[15px] mt-2"
                    :class="editForm.type === 'lawyer' ? 'text-[#C29F5F]' : 'text-[#3B4854]'"
                    >ทนายความ</span
                  >
                  <div
                    class="mt-3 size-[20px] rounded-full border-2 flex items-center justify-center transition-all"
                    :class="
                      editForm.type === 'lawyer'
                        ? 'border-[#C29F5F] bg-[#C29F5F]'
                        : 'border-[#91969C] bg-white'
                    "
                  >
                    <div
                      v-if="editForm.type === 'lawyer'"
                      class="size-[8px] rounded-full bg-white"
                    />
                  </div>
                </button>
                <button
                  class="w-[130px] flex flex-col items-center justify-between pt-5 pb-4 px-4 rounded-[10px] border-2 transition-all"
                  :class="
                    editForm.type === 'employee'
                      ? 'border-dashed border-[#C29F5F] bg-[#FFF2DB]'
                      : 'border-[#E7E8E9] bg-white'
                  "
                  style="min-height: 140px"
                  @click="editForm.type = 'employee'"
                >
                  <IconEmployeeCard
                    width="28"
                    height="25"
                    :class="editForm.type === 'employee' ? 'text-[#C29F5F]' : 'text-[#777F87]'"
                  />
                  <span
                    class="text-[15px] mt-2"
                    :class="editForm.type === 'employee' ? 'text-[#C29F5F]' : 'text-[#3B4854]'"
                    >พนักงานทั่วไป</span
                  >
                  <div
                    class="mt-3 size-[20px] rounded-full border-2 flex items-center justify-center transition-all"
                    :class="
                      editForm.type === 'employee'
                        ? 'border-[#C29F5F] bg-[#C29F5F]'
                        : 'border-[#91969C] bg-white'
                    "
                  >
                    <div
                      v-if="editForm.type === 'employee'"
                      class="size-[8px] rounded-full bg-white"
                    />
                  </div>
                </button>
              </div>
            </div>

            <!-- รายละเอียดทนายความ -->
            <div v-if="editForm.type === 'lawyer'" class="rounded-[8px] bg-[#F3F3F4] p-4 space-y-4">
              <p class="text-[15px] font-semibold text-[#3B4854]">รายละเอียดทนายความ</p>
              <base-text-input
                v-model="editForm.license_no"
                label="เลขใบประกอบวิชาชีพ"
                label-type="vertical"
                placeholder="กรอก"
                inputClass="bg-white"
              />
              <base-data-dropdown-multi-select
                v-model="editForm.specialization"
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
                v-model="editForm.department"
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
              v-model="editForm.remark"
              label="หมายเหตุ"
              label-type="vertical"
              placeholder="กรอก"
              :rows="4"
            />
          </template>
        </div>

        <!-- Bottom Buttons -->
        <div class="sticky bottom-0 bg-white px-6 py-4 flex justify-start gap-3">
          <template v-if="!isEditing">
            <button
              v-if="p.is_edit_employee"
              class="h-[50px] px-[24px] rounded-[6px] text-[16px] font-medium text-white bg-[#0F182A] hover:bg-[#0F182A]/80 transition-all flex items-center gap-2"
              @click="handleEditStart"
            >
              <IconPencil class="text-white" />
              แก้ไข
            </button>

            <button
              v-if="p.is_delete_employee"
              class="h-[50px] px-[24px] rounded-[6px] text-[16px] font-medium text-white bg-[#E74C3C] hover:bg-[#C0392B] transition-all flex items-center gap-2"
              @click="openDelete = true"
            >
              <IconTrash class="text-white" />
              ลบ
            </button>

            <base-button
              v-if="p.is_manage_access"
              class="!h-[50px]"
              :class="{
                '!bg-[#EDEFF1] !text-[#8E9AAB]': data?.is_ban === 0,
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
          </template>
          <template v-else>
            <button
              class="h-[50px] px-[24px] rounded-[6px] text-[16px] font-medium text-white bg-[#0F182A] hover:bg-[#0F182A]/80 transition-all"
              @click="handleSaveProfile"
            >
              บันทึก
            </button>
            <button
              class="h-[50px] px-[20px] rounded-[6px] text-[16px] font-medium text-[#8E9AAB] bg-[#EDEFF1] hover:bg-[#E0E2E5] transition-all"
              @click="handleCancelEdit"
            >
              ยกเลิก
            </button>
          </template>
        </div>
      </div>

      <!-- Right: Tabs + Content -->
      <div class="flex-1 min-w-0 space-y-[25px] max-[1400px]:w-full">
        <!-- Tabs -->
        <div class="flex items-center gap-2">
          <button
            v-if="p.is_view_history"
            class="h-[50px] px-[28px] rounded-[6px] text-[16px] font-medium transition-all flex items-center gap-2"
            :class="
              activeTab === 'การทำงาน' ? 'bg-[#0F182A] text-white' : 'bg-transparent text-[#3b4854]'
            "
            @click="activeTab = 'การทำงาน'"
          >
            <IconChecklist />
            การทำงาน
          </button>
          <button
            v-if="+data?.details?.is_login && p.is_manage_access"
            class="h-[50px] px-[28px] rounded-[6px] text-[16px] font-medium transition-all flex items-center gap-2"
            :class="
              activeTab === 'ความปลอดภัย'
                ? 'bg-[#0F182A] text-white'
                : 'bg-transparent text-[#3b4854]'
            "
            @click="activeTab = 'ความปลอดภัย'"
          >
            <IconPadlock />
            ความปลอดภัย
          </button>
        </div>

        <!-- การทำงาน Tab -->
        <template v-if="activeTab === 'การทำงาน' && p.is_view_history">
          <!-- Timeline Box -->
          <div class="border border-[#E7E8E9] rounded-[8px] p-6 space-y-4">
            <p class="text-[20px] text-[#3b4854] mb-[5px]">ไทม์ไลน์การใช้งานระบบ</p>
            <p class="text-[16px] text-[#777f87]">แสดงไทม์ไลน์การใช้งานระบบล่าสุด</p>

            <!-- Timeline Items -->
            <div class="relative space-y-0 mt-2">
              <div
                v-if="!timeline?.length"
                class="flex items-center justify-center py-10 text-[15px] text-[#aeb3b9]"
              >
                ไม่มีรายการ
              </div>
              <div v-for="(item, idx) in timeline" :key="idx" class="flex gap-4 relative">
                <!-- Dot + Line -->
                <div class="flex flex-col items-center">
                  <div
                    :class="[
                      item.bg,
                      'size-[20px] rounded-full flex items-center justify-center flex-shrink-0 mt-[20px]',
                    ]"
                  >
                    <div :class="[item.color, 'size-[10px] rounded-full']" />
                  </div>
                  <div class="w-px flex-1 bg-[#E7E8E9] mt-1 mb-1" style="min-height: 45px" />
                </div>

                <!-- Content -->
                <div class="flex-1 py-[14px] flex items-start justify-between gap-4">
                  <div>
                    <p class="text-[16px] text-[#3b4854]">{{ item.action }}</p>
                    <p class="text-[16px] text-[#777f87]">{{ item.detail }}</p>
                  </div>
                  <span class="text-[13px] text-[#aeb3b9] whitespace-nowrap flex-shrink-0">{{
                    item.time
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ความปลอดภัย Tab -->
        <div
          v-show="activeTab === 'ความปลอดภัย' && +data?.details?.is_login && p.is_manage_access"
          class="space-y-4"
        >
          <!-- เปลี่ยนรหัสผ่าน -->
          <div class="border border-[#E7E8E9] rounded-[8px] p-6 space-y-4">
            <p class="text-[20px] text-[#3b4854]">เปลี่ยนรหัสผ่าน</p>

            <!-- Warning box -->
            <div
              class="bg-[#FFF2DB] rounded-[10px] px-5 py-4 flex items-start justify-between gap-3"
            >
              <div>
                <p class="text-[18px] text-[#FFAB00]">
                  ตรวจสอบให้แน่ใจว่าเป็นไปตามข้อกำหนดเหล่านี้
                </p>
                <p class="text-[15px] text-[#FFAB00]">
                  ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์
                </p>
              </div>
              <!-- <IconX class="text-[#FFAB00]" /> -->
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="">
                <baseTextInput
                  v-model="newPasswordForm.password"
                  type="password"
                  label="รหัสผ่านใหม่"
                  labelType="vertical"
                  placeholder="••••••••"
                  :error="newPasswordErrors.password"
                />
              </div>
              <div class="">
                <baseTextInput
                  v-model="newPasswordForm.confirmPassword"
                  type="password"
                  label="ยืนยันรหัสผ่าน"
                  labelType="vertical"
                  placeholder="••••••••"
                  :error="newPasswordErrors.confirmPassword"
                />
              </div>
            </div>

            <base-button
              variant="primary"
              class="!text-white rounded-[6px] !bg-[#0F182A]"
              @click="handleUpdatePassword"
            >
              เปลี่ยนรหัสผ่าน
            </base-button>
          </div>

          <!-- สิทธิการเข้าใช้งานระบบ -->
          <div class="border border-[#E7E8E9] rounded-[8px] p-6">
            <div class="flex items-center justify-between">
              <p class="text-[20px] text-[#3b4854]">สิทธิการเข้าใช้งานระบบ</p>
              <button
                class="text-[15px] text-[#3b4854] underline"
                @click="showAllPermissions = !showAllPermissions"
              >
                {{ showAllPermissions ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม' }}
              </button>
            </div>

            <div v-show="showAllPermissions" class="grid grid-cols-2 gap-3 mt-[25px]">
              <!-- ปฎิทินนัดหมาย -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconCalendar class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">ปฎิทินนัดหมาย</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดการนัดหมาย วันขึ้นศาล และกำหนดการต่างๆ
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_calendar" />
                </div>
                <template v-if="permissions.is_sec_calendar">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [
                          permissions.is_add_appointment,
                          permissions.is_edit_appointment,
                          permissions.is_delete_appointment,
                        ].filter((v) => v).length
                      }}/3 สิทธิ</span
                    >
                    <button
                      v-if="
                        [
                          permissions.is_add_appointment,
                          permissions.is_edit_appointment,
                          permissions.is_delete_appointment,
                        ].filter((v) => v).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_add_appointment = 1
                          permissions.is_edit_appointment = 1
                          permissions.is_delete_appointment = 1
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
                          permissions.is_add_appointment = 0
                          permissions.is_edit_appointment = 0
                          permissions.is_delete_appointment = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_add_appointment" label="เพิ่มนัดหมาย" />
                    <base-checkbox v-model="permissions.is_edit_appointment" label="แก้ไขนัดหมาย" />
                    <base-checkbox v-model="permissions.is_delete_appointment" label="ลบนัดหมาย" />
                  </div>
                </template>
              </div>

              <!-- แฟ้มคดี -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconCaseFile class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">แฟ้มคดี</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดการข้อมูลคดี ลูกความ และเอกสารที่เกี่ยวข้อง
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_cases" />
                </div>
                <template v-if="permissions.is_sec_cases">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [
                          permissions.is_add_case,
                          permissions.is_add_case_step,
                          permissions.is_delete_case,
                          permissions.is_edit_case,
                          permissions.is_edit_case_step,
                          permissions.is_delete_case_step,
                        ].filter((v) => v).length
                      }}/6 สิทธิ</span
                    >
                    <button
                      v-if="
                        [
                          permissions.is_add_case,
                          permissions.is_add_case_step,
                          permissions.is_delete_case,
                          permissions.is_edit_case,
                          permissions.is_edit_case_step,
                          permissions.is_delete_case_step,
                        ].filter((v) => v).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_add_case = 1
                          permissions.is_add_case_step = 1
                          permissions.is_delete_case = 1
                          permissions.is_edit_case = 1
                          permissions.is_edit_case_step = 1
                          permissions.is_delete_case_step = 1
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
                          permissions.is_add_case = 0
                          permissions.is_add_case_step = 0
                          permissions.is_delete_case = 0
                          permissions.is_edit_case = 0
                          permissions.is_edit_case_step = 0
                          permissions.is_delete_case_step = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_add_case" label="เพิ่มคดีใหม่" />
                    <base-checkbox
                      v-model="permissions.is_add_case_step"
                      label="เพิ่มขั้นตอนของคดี"
                    />
                    <base-checkbox v-model="permissions.is_edit_case" label="แก้ไขข้อมูลคดี" />
                    <base-checkbox
                      v-model="permissions.is_edit_case_step"
                      label="แก้ไขขั้นตอนของคดี"
                    />
                    <base-checkbox v-model="permissions.is_delete_case" label="ลบคดี" />

                    <base-checkbox
                      v-model="permissions.is_delete_case_step"
                      label="ลบขั้นตอนของคดี"
                    />
                  </div>
                </template>
              </div>

              <!-- ระบบจัดเก็บข้อมูล -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconFile class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">ระบบจัดเก็บข้อมูล</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดเก็บและจัดการเอกสาร รูปภาพ และวิดีโอ
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_documents" />
                </div>
                <template v-if="permissions.is_sec_documents">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [
                          permissions.is_upload_document,
                          permissions.is_download_document,
                          permissions.is_delete_document,
                          permissions.is_preview_file,
                        ].filter((v) => v).length
                      }}/4 สิทธิ</span
                    >
                    <button
                      v-if="
                        [
                          permissions.is_upload_document,
                          permissions.is_download_document,
                          permissions.is_delete_document,
                          permissions.is_preview_file,
                        ].filter((v) => v).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_upload_document = 1
                          permissions.is_download_document = 1
                          permissions.is_delete_document = 1
                          permissions.is_preview_file = 1
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
                          permissions.is_upload_document = 0
                          permissions.is_download_document = 0
                          permissions.is_delete_document = 0
                          permissions.is_preview_file = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_upload_document" label="อัปโหลดเอกสาร" />
                    <base-checkbox
                      v-model="permissions.is_download_document"
                      label="ดาวน์โหลดเอกสาร"
                    />
                    <base-checkbox v-model="permissions.is_delete_document" label="ลบเอกสาร" />
                    <base-checkbox v-model="permissions.is_preview_file" label="ดูตัวอย่างไฟล์" />
                  </div>
                </template>
              </div>

              <!-- ระบบ OCR -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconOcr class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">ระบบค้นหาและอ่านเอกสาร OCR</p>
                    <p class="text-[13px] text-[#777f87]">สแกนและค้นหาข้อความจากเอกสาร</p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_ocr" />
                </div>
                <template v-if="permissions.is_sec_ocr">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [permissions.is_request_ocr, permissions.is_search_ocr].filter((v) => v)
                          .length
                      }}/2 สิทธิ</span
                    >
                    <button
                      v-if="
                        [permissions.is_request_ocr, permissions.is_search_ocr].filter((v) => v)
                          .length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_request_ocr = 1
                          permissions.is_search_ocr = 1
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
                          permissions.is_request_ocr = 0
                          permissions.is_search_ocr = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_request_ocr" label="ขอสแกน OCR" />
                    <base-checkbox v-model="permissions.is_search_ocr" label="ค้นหาเนื้อหา OCR" />
                  </div>
                </template>
              </div>

              <!-- ข้อมูลพนักงาน -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconProfile class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">ข้อมูลพนักงาน, ทนาย</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดการข้อมูลพนักงาน บทบาท และสิทธิการเข้าถึง
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_employee" />
                </div>
                <template v-if="permissions.is_sec_employee">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [
                          permissions.is_delete_employee,
                          permissions.is_view_employee_detail,
                          permissions.is_manage_access,
                          permissions.is_add_employee,
                          permissions.is_view_history,
                          permissions.is_edit_employee,
                        ].filter((v) => v).length
                      }}/6 สิทธิ</span
                    >
                    <button
                      v-if="
                        [
                          permissions.is_delete_employee,
                          permissions.is_view_employee_detail,
                          permissions.is_manage_access,
                          permissions.is_add_employee,
                          permissions.is_view_history,
                          permissions.is_edit_employee,
                        ].filter((v) => v).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_delete_employee = 1
                          permissions.is_view_employee_detail = 1
                          permissions.is_manage_access = 1
                          permissions.is_add_employee = 1
                          permissions.is_view_history = 1
                          permissions.is_edit_employee = 1
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
                          permissions.is_delete_employee = 0
                          permissions.is_view_employee_detail = 0
                          permissions.is_manage_access = 0
                          permissions.is_add_employee = 0
                          permissions.is_view_history = 0
                          permissions.is_edit_employee = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_add_employee" label="เพิ่มพนักงานใหม่" />

                    <base-checkbox
                      v-model="permissions.is_manage_access"
                      label="จัดการสิทธิเข้าถึง"
                    />

                    <base-checkbox
                      v-model="permissions.is_edit_employee"
                      label="แก้ไขข้อมูลพนักงาน"
                    />

                    <base-checkbox
                      v-model="permissions.is_view_history"
                      label="ดูประวัติการใช้งาน"
                    />

                    <base-checkbox
                      v-model="permissions.is_view_employee_detail"
                      label="ดูรายละเอียดพนักงาน"
                    />

                    <base-checkbox v-model="permissions.is_delete_employee" label="ลบพนักงาน" />
                  </div>
                </template>
              </div>

              <!-- ภาพรวมและรายงาน -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconGraph class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">ภาพรวมและรายงาน</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดเก็บและจัดการเอกสาร รูปภาพ และวิดีโอ
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_report" />
                </div>
                <template v-if="permissions.is_sec_report">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [permissions.is_export_report, permissions.is_financial_report].filter(
                          (v) => v,
                        ).length
                      }}/2 สิทธิ</span
                    >
                    <button
                      v-if="
                        [permissions.is_export_report, permissions.is_financial_report].filter(
                          (v) => v,
                        ).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_export_report = 1
                          permissions.is_financial_report = 1
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
                          permissions.is_export_report = 0
                          permissions.is_financial_report = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox v-model="permissions.is_export_report" label="ส่งออกรายงาน" />
                    <base-checkbox
                      v-model="permissions.is_financial_report"
                      label="รายงานการเงิน"
                    />
                  </div>
                </template>
              </div>

              <!-- แพ็กเกจและการชำระเงิน -->
              <div class="rounded-[15px] bg-[#F3F3F4] overflow-hidden">
                <div class="px-4 pt-4 pb-3 flex items-center gap-3">
                  <IconPackage class="flex-shrink-0 text-[#8E9AAB]" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] text-[#3b4854]">แพ็กเกจและการชำระเงิน</p>
                    <p class="text-[13px] text-[#777f87]">
                      จัดการแพ็กเกจ ข้อมูลการชำระเงิน และประวัติการชำระเงิน
                    </p>
                  </div>
                  <base-toggle v-model="permissions.is_sec_package" />
                </div>
                <template v-if="permissions.is_sec_package">
                  <div class="border-t border-[#E7E8E9] mx-4" />
                  <div class="px-4 py-2 flex justify-between items-center">
                    <span class="text-[14px] text-[#777f87]"
                      >{{
                        [
                          permissions.is_subscribe_package,
                          permissions.is_update_payment_info,
                          permissions.is_payment_history,
                        ].filter((v) => v).length
                      }}/3 สิทธิ</span
                    >
                    <button
                      v-if="
                        [
                          permissions.is_subscribe_package,
                          permissions.is_update_payment_info,
                          permissions.is_payment_history,
                        ].filter((v) => v).length === 0
                      "
                      class="text-[14px] text-[#22C55E]"
                      @click="
                        () => {
                          permissions.is_subscribe_package = 1
                          permissions.is_update_payment_info = 1
                          permissions.is_payment_history = 1
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
                          permissions.is_subscribe_package = 0
                          permissions.is_update_payment_info = 0
                          permissions.is_payment_history = 0
                        }
                      "
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div class="px-4 pb-4 grid grid-cols-2 gap-y-1">
                    <base-checkbox
                      v-model="permissions.is_subscribe_package"
                      label="สมัคร Package"
                    />
                    <base-checkbox
                      v-model="permissions.is_update_payment_info"
                      label="อัปเดตข้อมูล"
                    />
                    <base-checkbox
                      v-model="permissions.is_payment_history"
                      label="ประวัติการชำระเงิน"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- ประวัติการเข้าสู่ระบบ -->
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
        </div>
      </div>
    </div>

    <!-- Block Confirm Modal -->
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
      v-if="openDelete"
      open
      title="ลบข้อมูลพนักงาน"
      subtitle="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ใช้นี้? การลบจะไม่สามารถย้อนกลับได้"
      action-button
      action-text="ลบ"
      :showBody="false"
      danger
      @primary="handleDelete()"
      @close="
        () => {
          openDelete = false
        }
      "
    >
    </base-modal>
  </div>
</template>
