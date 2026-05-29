<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const emit = defineEmits<{ delete: [] }>()
const { p } = usePermissions()

const props = defineProps<{
  caseData: {
    id: number
    caseType: string
    caseNumber: string
    typeShort: string
    status: string
    statusLabel: string
    title: string
    description: string
    lawyer: string
    lawyerInfo: string
    court: string
    filedDate: string
    nextDate: string
    clientFullName: string
    clientIdCard: string
    clientPhone: string
    clientEmail: string
    clientAddress: string
    updatedAt: string
    updatedBy: string
    createdAt: string
    createdBy: string
  }
  contacts: { prefix: string; name: string; tel: string; email: string; remark: string }[]
  statusConfig: Record<string, { bg: string; text: string }>
}>()

const contactTable = {
  columns: [
    { field: 'prefix', header: 'ประเภท' },
    { field: 'name', header: 'ชื่อผู้ติดต่อ' },
    { field: 'tel', header: 'เบอร์ติดต่อ' },
    { field: 'email', header: 'อีเมล' },
    { field: 'remark', header: 'บันทึกเพิ่มเติม' },
  ],
}
</script>

<template>
  <div class="flex gap-[20px] items-start">
    <!-- ===== LEFT CONTENT ===== -->
    <div class="flex-1 min-w-0 space-y-[15px]">
      <!-- รายละเอียดคดี + ข้อมูลลูกความ -->
      <div class="rounded-[10px] border border-[#e7e8e9] overflow-hidden">
        <!-- รายละเอียดคดี -->
        <div class="p-[25px] space-y-[18px]">
          <p class="text-[20px] text-[#3b4854]">รายละเอียดคดี</p>
          <div class="grid grid-cols-2 gap-x-[40px] gap-y-[18px]">
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">เลขคดี</p>
              <p class="text-[16px] text-[#3b4854]">
                {{ props.caseData.caseNumber }}
              </p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">ประเภทคดี</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.typeShort }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[15px] text-[#777f87] mb-[4px]">ชื่อคดี</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.title }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[15px] text-[#777f87] mb-[4px]">คำอธิบาย</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.description }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">ทนายความผู้รับผิดชอบ</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.lawyer }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">ข้อมูลทนาย</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.lawyerInfo }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">ศาล</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.court }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">วันที่ยื่นฟ้อง</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.filedDate }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">การนัดหมายครั้งถัดไป</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.nextDate }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">สถานะคดี</p>
              <span
                class="inline-block rounded-full px-[15px] py-[5px] text-[15px]"
                :class="[
                  props.statusConfig[props.caseData.status]?.bg,
                  props.statusConfig[props.caseData.status]?.text,
                ]"
              >
                {{ props.caseData.statusLabel }}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t border-[#e7e8e9]"></div>

        <!-- ข้อมูลลูกความ -->
        <div class="p-[25px] space-y-[18px]">
          <p class="text-[20px] text-[#3b4854]">ข้อมูลลูกความ</p>
          <div class="grid grid-cols-2 gap-x-[40px] gap-y-[18px]">
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">ชื่อ</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.clientFullName }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">เลขบัตรประชาชน</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.clientIdCard }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">โทรศัพท์</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.clientPhone }}</p>
            </div>
            <div>
              <p class="text-[15px] text-[#777f87] mb-[4px]">อีเมล</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.clientEmail }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[15px] text-[#777f87] mb-[4px]">ที่อยู่</p>
              <p class="text-[16px] text-[#3b4854]">{{ props.caseData.clientAddress }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ผู้ติดต่อที่เกี่ยวข้อง -->
      <div class="rounded-[8px] border border-[#e7e8e9] overflow-hidden">
        <div class="p-[25px]">
          <p class="text-[20px] text-[#3b4854]">ผู้ติดต่อที่เกี่ยวข้อง</p>
        </div>
        <BaseDataTable
          :table="contactTable"
          :data="props.contacts"
          :disabled-pagination="true"
          :disable-filter-row="true"
          rowClass="hover:none"
        >
          <template #cell-prefix="{ row }">
            <span class="text-[15px] text-[#777f87]">{{
              row.prefix === 'witness'
                ? 'พยาน'
                : row.prefix === 'opponent'
                  ? 'คู่ความ'
                  : row.prefix === 'expert'
                    ? 'ผู้เชี่ยวชาญ'
                    : '-'
            }}</span>
          </template>
          <template #cell-name="{ row }">
            <span class="text-[15px] text-[#3b4854]">{{ row.name || '-' }}</span>
          </template>
          <template #cell-tel="{ row }">
            <span class="text-[15px] text-[#777f87]">{{ row.tel || '-' }}</span>
          </template>
          <template #cell-email="{ row }">
            <span class="text-[15px] text-[#777f87]">{{ row.email || '-' }}</span>
          </template>
          <template #cell-remark="{ row }">
            <span class="text-[15px] text-[#777f87]">{{ row.remark || '-' }}</span>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <!-- ===== RIGHT SIDEBAR ===== -->
    <div class="w-[430px] shrink-0 sticky top-[20px]">
      <div class="rounded-[10px] border border-[#e7e8e9] bg-white overflow-hidden">
        <div class="p-[25px] space-y-[10px]">
          <p class="text-[20px] text-[#3b4854] mb-[15px]">การจัดการ</p>
          <button
            v-if="p.is_edit_case"
            @click="router.push('/cases/' + props.caseData.id + '/edit')"
            class="flex w-full items-center justify-center gap-[10px] rounded-[6px] bg-[#0f182a] py-[13px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80"
          >
            <IconPencil class="w-[18px]" />
            แก้ไขข้อมูล
          </button>
          <button
            v-if="p.is_delete_case"
            class="flex w-full items-center justify-center rounded-[6px] bg-[#ffe3e0] py-[13px] text-[16px] font-medium text-[#ff725d] hover:bg-[#ffd0cc]"
            @click="emit('delete')"
          >
            ลบข้อมูล
          </button>
        </div>

        <div class="mx-[25px] border-t border-dashed border-[#e7e8e9]"></div>

        <div class="p-[25px] space-y-[20px]">
          <p class="text-[20px] text-[#3b4854]">ข้อมูลเพิ่มเติม</p>
          <div class="space-y-[16px]">
            <div v-if="props.caseData.updatedAt !== '-'" class="flex items-start gap-[20px]">
              <p class="text-[15px] text-[#777f87] min-w-[130px] shrink-0">การแก้ไขล่าสุด</p>
              <div>
                <p class="text-[16px] text-[#3b4854]">{{ props.caseData.updatedAt }}</p>
                <p class="text-[15px] text-[#777f87]">โดย {{ props.caseData.updatedBy }}</p>
              </div>
            </div>
            <div class="flex items-start gap-[20px]">
              <p class="text-[15px] text-[#777f87] min-w-[130px] shrink-0">สร้างเมื่อ</p>
              <div>
                <p class="text-[16px] text-[#3b4854]">{{ props.caseData.createdAt }}</p>
                <p class="text-[15px] text-[#777f87]">โดย {{ props.caseData.createdBy }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
