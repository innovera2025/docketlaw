<script setup lang="ts">
import BaseDataTable from '@/components/base/base-data-table.vue'
import BaseIconButtontable from '@/components/base/base-icon-button-table.vue'
import BaseModal from '@/components/base/base-modal.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import moment from 'moment/min/moment-with-locales'

const router = useRouter()

const data = ref([] as any[])
const dataPreFill = ref<any>({})
const openDelete = ref(false)
const deleteUserId = ref<number | null>(null)

const getRelativeTime = (date: string) => {
  if (!date || !moment(date).isValid()) return ''

  const now = moment().startOf('day')
  const targetDate = moment(date).startOf('day')
  const daysAgo = now.diff(targetDate, 'days')

  if (daysAgo === 0) {
    return 'วันนี้'
  } else if (daysAgo === 1) {
    return '1 วันที่แล้ว'
  } else {
    return `${daysAgo} วันที่แล้ว`
  }
}

const handleDelete = async () => {
  if (!deleteUserId.value) return

  const res = await API(
    'amstx5\\User',
    'deleteByID',
    {
      id: deleteUserId.value,
    },
    '',
  )

  if (res.response_status) {
    push.success('ลบผู้ใช้สำเร็จ!')
    openDelete.value = false
    deleteUserId.value = null
    // Reload data
    await handleSelect()
  } else {
    push.error('ลบผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
    return
  }
}

const handleSelect = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'selectMain')

  if (res.response_status) {
    data.value = res.response_data
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleDataPreFill = async () => {
  const res = await API('specific\\lawfirm\\lawyer_user', 'preFill')

  if (res.response_status) {
    dataPreFill.value = res.response_data
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

onMounted(async () => {
  await handleSelect()
  await handleDataPreFill()
})
</script>

<template>
  <section class="space-y-4 gap-4">
    <div class="flex gap-4 flex-wrap items-center justify-between px-[20px] pt-[15px]">
      <div>
        <p class="title">ข้อมูลสมาชิก</p>
        <p class="subtitle">จัดการข้อมูลและรายละเอียดของสมาชิก</p>
      </div>
    </div>
    <div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'name',
              field_search: 'name',
              header: 'สมาชิก',
              search: 'text',
              sort: true,
            },
            {
              field: 'is_ban',
              field_search: 'is_ban',
              header: 'สิทธิการเข้าสู่ระบบ',
              search: 'select',
              sort: true,
              options: [
                { value: '0', name: 'Active' },
                { value: '1', name: 'Inactive' },
              ],
              width: '1%',
            },
            {
              field: 'package',
              field_search: 'package',
              header: 'แพ็กเกจปัจจุบัน',
              search: 'select',
              sort: true,
              options: dataPreFill?.package?.map((item: any) => {
                return {
                  value: item.name,
                  name: item.name,
                }
              }),
              width: '1%',
            },
            {
              field: 'expire_date',
              field_search: 'expire_date',
              header: 'วันหมดอายุ',
              search: 'date',
              sort: true,
              width: '1%',
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
          data.map((item) => {
            return {
              ...item,
              id: item.id,
              data_name: item.details?.full_name + ', ' + item.tel,
              full_name: item.details?.full_name || '-',
              name: item.details?.full_name || '',
              email: item.details?.email || '-',
              tel: item.details?.tel || '',
              expire_date: item?.payment_info?.expire_date,
              package: item?.payment_info?.current_package?.name || 'ไม่มี',
              size: item?.payment_info?.current_package
                ? `พื้นที่ ${Number(
                    (item?.payment_info?.current_package?.storage_size || 0).toString(),
                  ).toLocaleString('en', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} ${item?.payment_info?.current_package?.storage_unit || ''}`
                : '',
              remark: item?.details?.remark || '-',
            }
          })
        "
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @download=""
        @edit=""
        @delete=""
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-[10px]">
            <div
              class="size-[40px] min-w-[40px] rounded-full overflow-hidden bg-primary flex items-center justify-center"
            >
              <p class="mb-1 text-[25px] font-bold capitalize text-white">
                {{ row.full_name[0] || 'U' }}
              </p>
            </div>
            <div class="">
              <div class="text-[16px]">{{ row.name || row.username }}</div>
              <div class="text-[14px] text-[#777F87]">{{ row.email }}</div>
            </div>
          </div>
        </template>
        <template #cell-is_ban="{ row }">
          <div
            class="py-[8px] px-[15px] w-fit rounded-[6px] text-[16px] font-regular"
            :class="{
              'bg-[#E9FAE2] text-[#78DF42]': row.is_ban === 0,
              'bg-[#EDEFF1] text-[#8E9AAA]': row.is_ban === 1,
            }"
          >
            {{ row.is_ban === 1 ? 'Inactive' : 'Active' }}
          </div>
        </template>
        <template #cell-package="{ row }">
          <div>
            <p class="uppercase">{{ row.package }}</p>
            <p class="text-[14px] text-[#777F87]">{{ row.size }}</p>
          </div>
        </template>
        <template #cell-expire_date="{ row }">
          <div class="text-[#777F87]">
            {{
              row.expire_date && row.expire_date !== '0000-00-00'
                ? moment(row.expire_date).format('DD.MM.YYYY')
                : '-'
            }}
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1 items-center justify-center">
            <base-icon-button-table
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
              iconName="Share"
              class="!rounded-full"
              @click="router.push(`/customer/${row.id}`)"
            />
            <!-- <baseIconDropdown>
              <div class="px-[20px] text-[#AEB3B9]">กำลังพัฒนา...</div>
              <button
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]"
              >
                <IconLock class="w-[20px] h-[20px" />
                <span class="text-[16px]">หยุดใช้งาน</span>
              </button>
            </baseIconDropdown> -->
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Delete Modal -->
    <base-modal
      v-if="openDelete"
      open
      title="ลบผู้ใช้"
      subtitle="การลบผู้ใช้งานระบบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานระบบนี้ออกจากระบบ?"
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
