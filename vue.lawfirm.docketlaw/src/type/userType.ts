export type PermissionsType = {
  is_sec_calendar: number
  is_add_appointment: number
  is_edit_appointment: number
  is_delete_appointment: number
  is_change_appointment_status: number
  is_sec_cases: number
  is_view_case_steps: number
  is_add_case: number
  is_add_case_step: number
  is_delete_case: number
  is_edit_case: number
  is_edit_case_step: number
  is_delete_case_step: number
  is_sec_documents: number
  is_upload_document: number
  is_download_document: number
  is_delete_document: number
  is_preview_file: number
  is_sec_ocr: number
  is_request_ocr: number
  is_search_ocr: number
  is_sec_employee: number
  is_delete_employee: number
  is_view_employee_detail: number
  is_manage_access: number
  is_add_employee: number
  is_view_history: number
  is_edit_employee: number
  is_sec_report: number
  is_export_report: number
  is_financial_report: number
}

export type userAdminType = {
  id: number
  username: string
  password: string
  role: string
  last_online_date_time: string
  last_update_date_time: string
  details: {
    full_name: string
    email: string
    permission_name: string
    permission: string[]
    tel: string
    position: string
    remark: string
    image: string
    permissions?: PermissionsType
    is_login?: number
    type?: string
    license_no?: string
    specialization?: string[]
    department?: string
  }
  permission: string
  is_ban: number
  insert_date_time: string
  insert_user_id: number
  update_date_time: string
  update_user_id: number
  sort_order_id: number
  system_delete: number
  insert_username: string
  update_username: string
}
export type userCustomerType = {
  id: number
  username: string
  password: string
  role: string
  count_contract_available: number
  count_contract: number
  last_online_date_time: string
  last_update_date_time: string
  details: {
    code: string
    full_name: string
    address: string
    remark: string
    contacts: Array<{
      name: string
      position: string
      phone: string
      mail: string
      remark: string
    }>
  }
  permission: string
  is_ban: number
  insert_date_time: string
  insert_user_id: number
  update_date_time: string
  update_user_id: number
  insert_username: string
  update_username: string
}
