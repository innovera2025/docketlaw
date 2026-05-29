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
