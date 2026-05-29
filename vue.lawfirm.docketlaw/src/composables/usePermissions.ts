import { computed } from 'vue'
import { useUserStore } from '@/stores'

export function usePermissions() {
  const userStore = useUserStore()

  const isAdmin = computed(() => {
    const user = userStore.currentUser as any
    if (!user?.id) return false
    const apiMainLawyerId = (user as any).main_lawyer_id
    if (apiMainLawyerId) {
      return String(user.id) === String(apiMainLawyerId)
    }
    const storedMainId = localStorage.getItem('main_lawyer_id') ?? ''
    return storedMainId !== '' && String(user.id) === storedMainId
  })

  const can = (key: string): boolean => {
    const perms = userStore.currentUser?.details?.permissions as Record<string, any> | undefined
    if (!perms) return false
    return !!Number(perms[key])
  }

  const p = computed(() => ({
    // Calendar
    is_sec_calendar:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_calendar),
    is_add_appointment:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_add_appointment),
    is_edit_appointment:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_edit_appointment),
    is_delete_appointment:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_delete_appointment),
    is_change_appointment_status:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_change_appointment_status),

    // Cases
    is_sec_cases:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_cases),
    is_view_case_steps:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_view_case_steps),
    is_add_case:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_add_case),
    is_add_case_step:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_add_case_step),
    is_delete_case:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_delete_case),
    is_edit_case:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_edit_case),
    is_edit_case_step:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_edit_case_step),
    is_delete_case_step:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_delete_case_step),

    // Documents / Storage
    is_sec_documents:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_documents),
    is_upload_document:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_upload_document),
    is_download_document:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_download_document),
    is_delete_document:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_delete_document),
    is_preview_file:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_preview_file),

    // OCR
    is_sec_ocr:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_ocr),
    is_request_ocr:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_request_ocr),
    is_search_ocr:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_search_ocr),

    // Employee
    is_sec_employee:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_employee),
    is_delete_employee:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_delete_employee),
    is_view_employee_detail:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_view_employee_detail),
    is_manage_access:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_manage_access),
    is_add_employee:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_add_employee),
    is_view_history:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_view_history),
    is_edit_employee:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_edit_employee),

    // Report
    is_sec_report:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_report),
    is_export_report:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_export_report),
    is_financial_report:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_financial_report),

    // Package & Payment
    is_sec_package:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_sec_package),
    is_subscribe_package:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_subscribe_package),
    is_update_payment_info:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_update_payment_info),
    is_payment_history:
      !!Number((userStore.currentUser?.details?.permissions as any)?.is_payment_history),
  }))

  return { p, can, isAdmin }
}
