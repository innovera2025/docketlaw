<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'

const router = useRouter()
const data = ref([] as any[])
const isLoading = ref(false)
const openDelete = ref(false)
const deletePackageId = ref<number | null>(null)

const fetchData = async () => {
  isLoading.value = true
  const res = await API('specific\\lawfirm\\admin_package', 'select', {}, null)
  if (res?.response_status) {
    data.value = res.response_data
  }
  isLoading.value = false
}

const handleDelete = async () => {
  const res = await API(
    'specific\\lawfirm\\admin_package',
    'delete',
    { id: deletePackageId.value },
    null,
  )
  if (res?.response_status) {
    data.value = data.value.filter((item) => item.id !== deletePackageId.value)
    push.success('ลบแพ็กเกจสำเร็จ!')
  } else {
    push.error('ลบแพ็กเกจไม่สำเร็จ!\n' + res?.response_message)
  }
  openDelete.value = false
  deletePackageId.value = null
}

onMounted(fetchData)

const tableColumns = computed(() => [
  {
    field: 'name',
    field_search: 'name',
    header: 'ชื่อแพ็กเกจ',
    search: 'text',
    sort: true,
    minWidth: '240px',
  },
  {
    field: 'is_active',
    field_search: 'is_active',
    header: 'การให้บริการ',
    search: 'select',
    sort: true,
    options: [
      { value: 0, name: 'ไม่เปิดให้บริการ' },
      { value: 1, name: 'เปิดให้บริการ' },
    ],
    minWidth: '200px',
  },
  {
    field: 'price',
    field_search: 'price',
    header: 'ราคาต่อแพ็ก (บาท)',
    search: 'decimal',
    sort: true,
    width: '1%',
  },
  {
    field: 'duration',
    field_search: 'duration',
    header: 'อายุแพ็กเกจ (วัน)',
    search: 'number',
    sort: true,
    width: '1%',
  },
  {
    field: 'storage_size',
    field_search: 'storage_size',
    header: 'Storage ที่ได้รับ',
    search: 'text',
    sort: true,
    width: '1%',
  },
  {
    field: 'description',
    field_search: 'description',
    header: 'รายละเอียดเพิ่มเติม',
    search: 'text',
    sort: true,
    width: '100%',
  },
  {
    field: 'actions',
    header: 'การจัดการ',
    width: '1%',
  },
])
</script>
<template>
  <section class="space-y-4 gap-4">
    <div class="flex gap-4 flex-wrap items-center justify-between px-[20px] pt-[15px] mb-[15px]">
      <div>
        <p class="title">จัดการแพ็กเกจ</p>
        <p class="subtitle">จัดการแพ็กเกจสำหรับให้บริการลูกค้า</p>
      </div>
      <div class="flex gap-2">
        <base-button class="ml-auto !bg-[#0F182A]" @click="router.push('/package/add')"> เพิ่มข้อมูล </base-button>
      </div>
    </div>
    <div>
      <BaseDataTable
        :table="{
          columns: tableColumns,
        }"
        :data="data"
        :loading="isLoading"
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @edit=""
        @delete=""
      >
        <template #cell-is_active="{ row }">
          <span class="p-[10px] rounded-[6px] text-nowrap" :class="{
            'text-[#78DF42] bg-[#E9FAE2]': +row.is_active === 1,
            'text-[#8E9AAA] bg-[#EDEFF1]': +row.is_active === 0,
          }">
            {{ row.is_active === 1 ? 'เปิดให้บริการ' : 'ไม่เปิดให้บริการ' }}
          </span>
        </template>
        <template #cell-storage_size="{ row }">
          {{ (+row.storage_size).toLocaleString('en') }} {{ row.storage_unit }}
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1 items-center justify-center">
            <base-icon-button-table
              iconName="Trash"
              class="!rounded-full"
              @click="() => { deletePackageId = row.id; openDelete = true }"
            />
            <base-icon-button-table
              iconName="Share"
              class="!rounded-full"
              @click="router.push(`/package/${row.id}`)"
            />
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Delete Modal -->
    <base-modal
      v-if="openDelete"
      open
      title="ลบแพ็กเกจ"
      subtitle="การลบแพ็กเกจจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจนี้ออกจากระบบ?"
      action-button
      action-text="ลบ"
      variant="danger"
      :showBody="false"
      @primary="handleDelete()"
      @close="() => { openDelete = false; deletePackageId = null }"
    />
  </section>
</template>