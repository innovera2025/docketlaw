<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import moment from 'moment/min/moment-with-locales'
import IconCancel from '@/components/icons/IconCancel.vue'
import imgKbank from '@/assets/images/bank/kbank.png'
import imgScb from '@/assets/images/bank/scb.png'
import imgKrungsri from '@/assets/images/bank/krungsri.png'

const route = useRoute()
const router = useRouter()
const packages = ref([] as any[])

const mockData = [
  {
    id: 1,
    insert_user_id: 1,
    insert_full_name: 'สมชาย ใจดี',
    insert_date_time: '2026-05-10T09:30:00',
    update_date_time: '2026-05-10T09:30:00',
    status: 'waiting',
    price: 1500,
    slip_image: null,
    to_account_image: imgKbank,
    to_account_bank: 'กสิกรไทย',
    to_account_number: '123-4-56789-0',
    to_account_name: 'บริษัท กฎหมาย จำกัด',
    package_detail: {
      id: 1,
      name: 'Basic',
      storage_size: 10,
      storage_unit: 'GB',
      price: 1500,
      duration: 30,
    },
    current_package: null,
  },
]

const data = ref<any[]>(mockData)
const loadingId = ref<number | null>(null)

const handleSelect = async () => {
  const res = await API('specific\\lawfirm\\admin_payment', 'select', {
    status: route.query.state,
  })
  if (res?.response_status) {
    data.value = res.response_data
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!' + (res?.response_message ? '\n' + res.response_message : ''))
  }
}

const handleApprove = async (row: any, closeModal = false) => {
  loadingId.value = row.id
  const res = await API('specific\\lawfirm\\admin_payment', 'approve', { id: row.id })
  loadingId.value = null
  if (res?.response_status) {
    push.success('ยืนยันการชำระเงินสำเร็จ!')
    if (closeModal) openDetailModal.value = false
    await handleSelect()
  } else {
    push.error('ยืนยันไม่สำเร็จ!' + (res?.response_message ? '\n' + res.response_message : ''))
  }
}

const handleReject = async (row: any, closeModal = false) => {
  loadingId.value = row.id
  const res = await API('specific\\lawfirm\\admin_payment', 'reject', { id: row.id })
  loadingId.value = null
  if (res?.response_status) {
    push.success('ปฏิเสธการชำระเงินสำเร็จ!')
    if (closeModal) openDetailModal.value = false
    await handleSelect()
  } else {
    push.error('ปฏิเสธไม่สำเร็จ!' + (res?.response_message ? '\n' + res.response_message : ''))
  }
}

const handlePackage = async () => {
  const res = await API('specific\\lawfirm\\admin_package', 'select')
  if (res?.response_status) {
    packages.value = res.response_data
  } else {
    push.error(
      'โหลดข้อมูลแพ็กเกจไม่สำเร็จ!' + (res?.response_message ? '\n' + res.response_message : ''),
    )
  }
}

onMounted(async () => {
  await handleSelect()
  await handlePackage()
})

const openDetailModal = ref(false)
const selectedRow = ref<any>(null)
const loadingDetail = ref(false)

const openDetail = async (row: any) => {
  loadingDetail.value = true
  const res = await API('specific\\lawfirm\\admin_payment', 'getByID', { id: row.id })
  loadingDetail.value = false
  if (res?.response_status) {
    const paymentUser = await API(
      'amstx5\\User',
      'getByID',
      { id: res.response_data.insert_user_id },
      '',
    )
    selectedRow.value = res.response_data
    selectedRow.value.payment_user = paymentUser?.response_data || null
    openDetailModal.value = true
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!' + (res?.response_message ? '\n' + res.response_message : ''))
  }
}

const tabs = computed(() => [
  {
    label: `ทั้งหมด`,
    route: `/payment`,
  },
  {
    label: `รอการตรวจสอบ`,
    route: `/payment?state=waiting`,
  },
  {
    label: `ยืนยันแล้ว`,
    route: `/payment?state=approve`,
  },
  {
    label: `ปฏิเสธ`,
    route: `/payment?state=reject`,
  },
])

const isFixedStatusTab = computed(
  () =>
    route.query.state === 'waiting' ||
    route.query.state === 'approve' ||
    route.query.state === 'reject',
)

const tableColumns = computed(() => [
  {
    field: 'insert_full_name',
    field_search: 'insert_full_name',
    header: 'ดำเนินรายการโดย',
    search: 'text',
    sort: true,
  },
  {
    field: 'insert_date_time',
    field_search: 'insert_date_time',
    header: 'วันที่, เวลา',
    search: 'date-show-time',
    sort: true,
    minWidth: '160px',
  },
  {
    field: 'status',
    field_search: 'status',
    header: 'สถานะ',
    ...(isFixedStatusTab.value
      ? {}
      : {
          search: 'select',
          sort: true,
          options: [
            { value: 'waiting', name: 'รอตรวจสอบ' },
            { value: 'approve', name: 'ยืนยันแล้ว' },
            { value: 'reject', name: 'ปฏิเสธ' },
          ],
        }),
    width: '1%',
  },
  {
    field: 'package',
    field_search: 'package',
    header: 'แพ็กเกจ',
    search: 'select',
    sort: true,
    options: packages.value.map((item) => ({ value: item.name, name: item.name })),
    minWidth: '200px',
  },
  {
    field: 'amount',
    field_search: 'amount',
    header: 'ค่าใช้จ่าย',
    search: 'decimal',
    sort: true,
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
    field: 'slip_image',
    field_search: 'slip_image',
    header: 'รูป',
    minWidth: '1%',
  },
  {
    field: 'to_account',
    field_search: 'to_account',
    header: 'ไปยังบัญชี',
    search: 'text',
    sort: true,
    minWidth: '320px',
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
        <p class="title">ตรวจเช็คการชำระเงิน</p>
        <p class="subtitle">รายการชำระเงินและต่ออายุแพ็กเกจของสมาชิก</p>
      </div>
    </div>
    <baseTabMenu :tabs="tabs" class="mb-0 border-none" />
    <div>
      <BaseDataTable
        :table="{
          columns: tableColumns,
        }"
        :data="
          data.map((item) => ({
            ...item,
            to_account: item.to_account_bank
              ? `${item.to_account_bank} เลขที่บัญชี ${item.to_account_number}, ชื่อบัญชี ${item.to_account_name}`
              : null,
            package: item.package_detail.name,
            expire_date: item.package_detail?.duration
              ? moment(item.update_date_time)
                  .add(item.package_detail.duration, 'days')
                  .toISOString()
              : null,
          }))
        "
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @download=""
        @edit=""
        @delete=""
      >
        <template #cell-insert_full_name="{ row }">
          <span :class="{ '!text-[#AEB3B9] text-[14px]': !row.insert_full_name }">{{
            row.insert_full_name || 'ผู้ใช้นี้ถูกลบไปแล้ว'
          }}</span>
        </template>
        <template #cell-status="{ row }">
          <div
            class="p-[10px] rounded-[6px] text-nowrap text-center"
            :class="{
              'text-[#FFAB00] bg-[#FFF2DB]': row.status === 'waiting',
              'text-[#78DF42] bg-[#E9FAE2]': row.status === 'approve',
              'text-[#FF725D] bg-[#FFE3E0]': row.status === 'reject',
            }"
          >
            {{
              row.status === 'waiting'
                ? 'รอตรวจสอบ'
                : row.status === 'approve'
                  ? 'ยืนยันแล้ว'
                  : 'ปฏิเสธ'
            }}
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
          <div v-if="row.package">
            <p class="uppercase">{{ row.package_detail.name }}</p>
            <p class="text-[14px] text-[#777F87]">
              {{ Number(row.package_detail.storage_size).toLocaleString('en') }}
              {{ row.package_detail.storage_unit }}, OCR 50 Credit
            </p>
          </div>
          <div v-else class="text-[#AEB3B9]">ไม่มี</div>
        </template>
        <template #cell-amount="{ row }">
          {{
            Number(row.price).toLocaleString('en', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}
        </template>
        <template #cell-expire_date="{ row }">
          <div class="text-[#777F87]">
            {{ row.expire_date ? moment(row.expire_date).format('DD.MM.YYYY') : '-' }}
          </div>
        </template>
        <template #cell-slip_image="{ row }">
          <a v-if="row.slip_image" :href="row.slip_image" target="_blank">
            <img
              :src="row.slip_image"
              alt="Slip Image"
              class="min-w-[40px] w-[40px] object-cover"
            />
          </a>
          <div v-else>-</div>
        </template>
        <template #cell-to_account="{ row }">
          <div class="flex items-center gap-[10px]">
            <img
              :src="mockData[0].to_account_image"
              alt="Bank Image"
              class="min-w-[40px] w-[40px] object-cover"
            />
            <div class="">
              <div class="">
                {{ mockData[0].to_account_bank }} เลขที่บัญชี {{ mockData[0].to_account_number }},
              </div>
              <div class="">{{ mockData[0].to_account_name }}</div>
            </div>
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div
            class="flex gap-[10px] items-center justify-end"
            :class="{
              '!justify-center': route.query.state === 'approve' || route.query.state === 'reject',
            }"
          >
            <base-button
              v-if="row.status === 'waiting'"
              class="!bg-[#E9FAE2] hover:!bg-[#D4F5D0] h-[40px] !text-[#78DF42] rounded-[8px]"
              :disabled="loadingId === row.id"
              @click="handleApprove(row)"
              >ยืนยัน</base-button
            >
            <base-button
              v-if="row.status === 'waiting'"
              class="!bg-[#FFE3E0] hover:!bg-[#FFD1CC] !size-[40px] !p-0 flex items-center justify-center rounded-[8px]"
              :disabled="loadingId === row.id"
              @click="handleReject(row)"
            >
              <IconCancel />
            </base-button>
            <base-icon-button-table
              iconName="Share"
              class="!rounded-full"
              @click="openDetail(row)"
            />
          </div>
        </template>
      </BaseDataTable>
    </div>
  </section>

  <!-- Payment Detail Modal -->
  <base-modal
    v-if="openDetailModal"
    open
    title="รายละเอียดการชำระเงิน"
    position="right"
    size="smm"
    @close="openDetailModal = false"
  >
    <div class="p-[25px] space-y-[30px]">
      <!-- ข้อมูลการชำระเงิน -->
      <div>
        <h3 class="text-[20px] font-normal text-[#3b4854] mb-[20px]">ข้อมูลการชำระเงิน</h3>
        <div class="space-y-[20px]">
          <base-show-data label="ชื่อสมาชิก" labelWidth="135px">
            <span v-if="selectedRow?.payment_user">{{
              selectedRow?.payment_user?.details?.full_name || '-'
            }}</span>
            <span v-else class="text-[#AEB3B9] text-[14px]">ผู้ใช้นี้ถูกลบไปแล้ว</span>
          </base-show-data>
          <base-show-data label="Email" labelWidth="135px">
            <span v-if="selectedRow?.payment_user">{{
              selectedRow?.payment_user?.details?.email || '-'
            }}</span>
            <span v-else class="text-[#AEB3B9] text-[14px]">ผู้ใช้นี้ถูกลบไปแล้ว</span>
          </base-show-data>
          <base-show-data label="แพ็กเกจที่ใช้<br>ณ ปัจจุบัน" labelWidth="135px">
            <div v-if="selectedRow?.current_package?.id">
              <div class="uppercase">{{ selectedRow?.current_package?.name || '-' }}</div>
              <div class="text-[14px] text-[#777F87]">
                พื้นที่ {{ (+selectedRow?.current_package?.storage_size).toLocaleString('en') }}
                {{ selectedRow?.current_package?.storage_unit }}
              </div>
            </div>
            <div v-else class="text-[#AEB3B9]">ไม่มี</div>
          </base-show-data>
          <base-show-data label="แพ็กเกจที่เลือก" labelWidth="135px">
            <div>
              <div class="uppercase">{{ selectedRow?.package_detail?.name || '-' }}</div>
              <div class="text-[14px] text-[#777F87]">
                พื้นที่ {{ (+selectedRow?.package_detail?.storage_size).toLocaleString('en') }}
                {{ selectedRow?.package_detail?.storage_unit }}
              </div>
            </div>
          </base-show-data>
          <base-show-data label="ยอดที่ต้องชำระ" labelWidth="135px">
            {{ Number(selectedRow?.package_detail?.price).toLocaleString('en') }}
          </base-show-data>
          <base-show-data label="วันที่ชำระ" labelWidth="135px">
            {{
              selectedRow?.insert_date_time
                ? moment(selectedRow.insert_date_time).format('DD.MM.YYYY, HH:mm')
                : '-'
            }}
          </base-show-data>
          <base-show-data label="หลักฐานการชำระเงิน" labelWidth="135px">
            <a
              v-if="selectedRow?.slip_image"
              :href="selectedRow.slip_image"
              target="_blank"
              class="text-[#16b1ff]"
            >
              <img
                :src="selectedRow.slip_image"
                alt="Slip"
                class="w-[225px] h-[225px] object-cover border border-[#e7e8e9]"
              />
            </a>
            <span v-else>-</span>
          </base-show-data>
          <base-show-data label="ไปยังบัญชี" labelWidth="135px">
            <!-- <div class="flex gap-[10px]">
              <img v-if="selectedRow?.to_account_image" :src="selectedRow.to_account_image" alt="Bank" class="w-[40px] h-[40px] rounded-full object-cover mt-[5px]" />
              <div>
                <div>{{ selectedRow?.to_account_bank }}</div>
                <div>เลขที่บัญชี {{ selectedRow?.to_account_number }}</div>
                <div>ชื่อบัญชี {{ selectedRow?.to_account_name }}</div>
              </div>
            </div> -->
            <div class="flex gap-[10px]">
              <img
                :src="mockData[0].to_account_image"
                alt="Bank"
                class="w-[40px] h-[40px] rounded-full object-cover mt-[5px]"
              />
              <div>
                <div>{{ mockData[0].to_account_bank }}</div>
                <div>เลขที่บัญชี {{ mockData[0].to_account_number }}</div>
                <div>ชื่อบัญชี {{ mockData[0].to_account_name }}</div>
              </div>
            </div>
          </base-show-data>
          <base-show-data label="สถานะ" labelWidth="135px">
            <div
              class="px-[10px] py-[8px] rounded-[6px] w-fit text-nowrap"
              :class="{
                'text-[#FFAB00] bg-[#FFF2DB]': selectedRow?.status === 'waiting',
                'text-[#78DF42] bg-[#E9FAE2]': selectedRow?.status === 'approve',
                'text-[#FF725D] bg-[#FFE3E0]': selectedRow?.status === 'reject',
              }"
            >
              {{
                selectedRow?.status === 'waiting'
                  ? 'รอตรวจสอบ'
                  : selectedRow?.status === 'approve'
                    ? 'ยืนยันแล้ว'
                    : 'ปฏิเสธ'
              }}
            </div>
          </base-show-data>
        </div>
      </div>

      <!-- การจัดการ -->
      <div v-if="selectedRow?.status === 'waiting'">
        <h3 class="text-[20px] font-normal text-[#3b4854] mb-[15px]">การจัดการ</h3>
        <div class="space-y-[15px]">
          <base-button
            class="w-full !bg-[#3cad00] hover:!bg-[#35a000] justify-center"
            :disabled="loadingId === selectedRow?.id"
            @click="handleApprove(selectedRow, true)"
            >ยืนยันการชำระเงิน</base-button
          >
          <base-button
            class="w-full !bg-[#FFE3E0] !text-[#FF725D] hover:!bg-[#FFD1CC] justify-center"
            :disabled="loadingId === selectedRow?.id"
            @click="handleReject(selectedRow, true)"
            >ปฏิเสธการชำระเงิน</base-button
          >
        </div>
      </div>
    </div>
  </base-modal>
</template>
