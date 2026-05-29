<script setup lang="ts">
import { API } from '@/api'
import IconWarningV2 from '@/components/icons/IconWarningV2.vue'
import IconAttachLink from '@/components/icons/IconAttachLink.vue'
import IconDownloadArrow from '@/components/icons/IconDownloadArrow.vue'
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import imgKbank from '@/assets/images/bank/kbank.png'
import imgQrCode from '@/assets/images/bank/qrcode.png'
import { push } from 'notivue'
import { ref, reactive, computed, onMounted } from 'vue'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const apiCode = import.meta.env.VITE_API_CODE
import { thailandProvinces } from '@/utils/thailand-provinces'
import moment from 'moment/min/moment-with-locales'
import { count } from 'ckeditor5'

const storageUnitToBytes = (size: number, unit: string): number => {
  switch (unit?.toUpperCase()) {
    case 'TB': return size * 1024 * 1024 * 1024 * 1024
    case 'GB': return size * 1024 * 1024 * 1024
    case 'MB': return size * 1024 * 1024
    default:   return size * 1024 * 1024
  }
}

//used size
const usedMb = computed(() => {
  const bytes = Number(mainData.value?.storage_in_use_byte ?? 0)
  return bytes / (1024 * 1024)
})

const usedPercent = computed(() => {
  //storage max size
  const size = Number(mainData.value?.current_package?.storage_size ?? 0)
  const unit = mainData.value?.current_package?.storage_unit ?? 'MB'
  const totalBytes = storageUnitToBytes(size, unit)
  if (!totalBytes) return 0
  //calculate percent
  const usedBytes = Number(mainData.value?.storage_in_use_byte ?? 0)
  return Math.min((usedBytes / totalBytes) * 100, 100)
})

const countryOptions = [
  { name: 'ไทย', value: 'ไทย' },
  // { name: 'สิงคโปร์', value: 'สิงคโปร์' },
  // { name: 'อื่นๆ', value: 'อื่นๆ' },
]

const provinceOptions = thailandProvinces

const openBillingModal = ref(false)

const billingForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  country: 'ไทย' as string | null,
  province: null as string | null,
  postalCode: '',
  isCompany: false,
  companyName: '',
  taxId: '',
})

const billingErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  country: '',
  province: '',
  companyName: '',
  taxId: '',
})

const resetBillingForm = () => {
  billingForm.firstName = ''
  billingForm.lastName = ''
  billingForm.email = ''
  billingForm.address = ''
  billingForm.province = null
  billingForm.postalCode = ''
  billingForm.isCompany = false
  billingForm.companyName = ''
  billingForm.taxId = ''
  billingErrors.firstName = ''
  billingErrors.lastName = ''
  billingErrors.email = ''
  billingErrors.address = ''
  billingErrors.country = ''
  billingErrors.province = ''
  billingErrors.companyName = ''
  billingErrors.taxId = ''
}

const validateBillingForm = (): boolean => {
  billingErrors.firstName = billingForm.firstName ? '' : 'กรุณากรอกชื่อ'
  billingErrors.lastName = billingForm.lastName ? '' : 'กรุณากรอกนามสกุล'
  billingErrors.email = billingForm.email ? '' : 'กรุณากรอกอีเมล'
  billingErrors.address = billingForm.address ? '' : 'กรุณากรอกที่อยู่'
  billingErrors.province = billingForm.province ? '' : 'กรุณาเลือกจังหวัด'
  billingErrors.companyName =
    billingForm.isCompany && !billingForm.companyName ? 'กรุณากรอกชื่อบริษัท' : ''
  billingErrors.taxId =
    billingForm.isCompany && !billingForm.taxId ? 'กรุณากรอกเลขทะเบียนผู้เสียภาษี' : ''
  return !Object.values(billingErrors).some((e) => e !== '')
}

const handleOpenBillingModal = () => {
  if (mainData.value) {
    billingForm.firstName = mainData.value.name
    billingForm.lastName = mainData.value.surname
    billingForm.email = mainData.value.email
    billingForm.address = mainData.value.address
    billingForm.country = mainData.value.country
    billingForm.province = mainData.value.province
    billingForm.postalCode = mainData.value.postcode
    billingForm.isCompany = mainData.value.is_company === 1
    billingForm.companyName = mainData.value.company_name
    billingForm.taxId = mainData.value.tax_id
  }
  openBillingModal.value = true
}

const loadingSaveBilling = ref(false)

const handleSaveBilling = async () => {
  if (!validateBillingForm()) return
  if (loadingSaveBilling.value) return
  loadingSaveBilling.value = true
  try {
    const res = await API('specific\\lawfirm\\lawyer_package', 'updatePaymentInfo', {
      main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
      data: {
        name: billingForm.firstName,
        surname: billingForm.lastName,
        email: billingForm.email,
        address: billingForm.address,
        country: billingForm.country ?? '',
        province: billingForm.province ?? '',
        postcode: billingForm.postalCode,
        is_company: billingForm.isCompany ? 1 : 0,
        company_name: billingForm.companyName,
        tax_id: billingForm.taxId,
      },
    })
    if (res?.response_status) {
      push.success('บันทึกข้อมูลสำเร็จ')
      openBillingModal.value = false
      resetBillingForm()
      await loadDataMain()
    } else {
      push.error('เกิดข้อผิดพลาด: ' + res.response_message)
    }
  } finally {
    loadingSaveBilling.value = false
  }
}

const mainData = ref({} as any)
const loadingMain = ref(true)

const loadDataMain = async () => {
  loadingMain.value = true
  try {
    await API('specific\\lawfirm\\lawyer_package', 'getPaymentInfo', {
      main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    }).then((res) => {
      if (res?.response_status) {
        mainData.value = res.response_data
        currentPackageId.value = res.response_data.current_package?.id ?? null
      } else {
        push.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + res.response_message)
      }
    })
  } finally {
    loadingMain.value = false
  }
}

interface ApiPackage {
  id: number
  name: string
  type: string
  price: string
  duration: number
  storage_size: string
  description: string
}

const openChangePackageModal = ref(false)

const packageOptions = ref<ApiPackage[]>([])
const currentPackageId = ref<number | null>(null)

const changePackageForm = reactive({
  selectedPackage: null as number | null,
  paymentProofFile: null as File | null,
  paymentProofFileName: '',
})

const changePackageProofInputRef = ref<HTMLInputElement | null>(null)

const handleChangePackageProofUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const allowed = ['image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      slipError.value = 'อนุญาตเฉพาะไฟล์ .jpg, .jpeg, .png เท่านั้น'
      input.value = ''
      return
    }
    slipError.value = ''
    changePackageForm.paymentProofFile = file
    changePackageForm.paymentProofFileName = file.name
  }
}

const selectedPackageData = computed(() =>
  packageOptions.value.find((p) => p.id === changePackageForm.selectedPackage),
)

const isSelectedCurrentPackage = computed(
  () => changePackageForm.selectedPackage === currentPackageId.value,
)

const loadingUpgrade = ref(false)

const handleOpenUpgradeModal = async () => {
  if (loadingUpgrade.value) return
  loadingUpgrade.value = true
  try {
    await loadDataPreFill()
    openChangePackageModal.value = true
  } finally {
    loadingUpgrade.value = false
  }
}

const loadingConfirmPackage = ref(false)
const slipError = ref('')

const handleConfirmChangePackage = async () => {
  if (!changePackageForm.paymentProofFile) {
    slipError.value = 'กรุณาแนบสลิปโอนเงิน'
    return
  }
  if (!changePackageForm.selectedPackage) return
  if (loadingConfirmPackage.value) return
  loadingConfirmPackage.value = true
  try {
    const code = `${apiCode}_slip_${Date.now()}`
    const uploadRes = await API(
      'amstx5\\File',
      'upload',
      { file_code: code, file: changePackageForm.paymentProofFile },
      true,
    )
    if (!uploadRes?.response_status) {
      push.error('อัปโหลดสลิปไม่สำเร็จ: ' + uploadRes?.response_message)
      return
    }
    const slipUrl = uploadRes.response_data.file.path_external

    const res = await API('specific\\lawfirm\\lawyer_package', 'buyPackage', {
      main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
      package_id: changePackageForm.selectedPackage,
      slip_image: slipUrl,
    })
    if (res?.response_status) {
      push.success('ส่งคำขอสมัครแพ็กเกจสำเร็จ')
      openChangePackageModal.value = false
      changePackageForm.paymentProofFile = null
      changePackageForm.paymentProofFileName = ''
      slipError.value = ''
      await loadDataMain()
    } else {
      push.error('เกิดข้อผิดพลาด: ' + res.response_message)
    }
  } finally {
    loadingConfirmPackage.value = false
  }
}

const openPaymentHistoryModal = ref(false)
const paymentHistory = ref([] as any[])

const getStatusLabel = (status: string) => {
  if (status === 'approve') return 'อนุมัติแล้ว'
  if (status === 'reject') return 'ปฏิเสธ'
  return 'รอตรวจสอบ'
}

const getStatusClass = (status: string) => {
  if (status === 'approve') return 'bg-[#e9fae2] text-[#78df42]'
  if (status === 'reject') return 'bg-[#ffe3e0] text-[#ff725d]'
  return 'bg-[#fff2db] text-[#ffab00]'
}

const handleOpenPaymentHistoryModal = async () => {
  openPaymentHistoryModal.value = true
  const res = await API('specific\\lawfirm\\lawyer_package', 'selectPaymentHistory', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  })
  if (res?.response_status) {
    paymentHistory.value = res.response_data
  } else {
    push.error('เกิดข้อผิดพลาด: ' + res.response_message)
  }
}

onMounted(() => {
  loadDataMain()
})

const loadDataPreFill = async () => {
  await API('specific\\lawfirm\\lawyer_package', 'preFill').then((res) => {
    if (res?.response_status) {
      packageOptions.value = res.response_data.package ?? []
      const firstNonCurrent = packageOptions.value.find((p) => p.id !== currentPackageId.value)
      changePackageForm.selectedPackage = firstNonCurrent?.id ?? packageOptions.value[0]?.id ?? null
    } else {
      push.error('เกิดข้อผิดพลาดในการโหลดข้อมูล preFill: ' + res.response_message)
    }
  })
}
</script>

<template>
  <div class="space-y-[20px] max-w-[1000px] mx-auto">
    <base-loading v-if="loadingMain" />
    <template v-else>
      <!-- Page Header -->
      <div class="text-center space-y-[8px]">
        <p class="text-[22px] text-[#3b4854]">แพ็กเกจและการชำระเงิน</p>
        <p class="text-[16px] text-[#777f87]">
          อัปเดตข้อมูลสำหรับการชำระเงินให้เป็นปัจจุบันอยู่เสมอ เพื่อให้การต่ออายุการใช้งานง่ายขึ้น
        </p>
      </div>

      <!-- Section 1: แพ็กเกจ -->
      <div
        v-if="mainData?.current_package || mainData?.status === 'approve'"
        class="rounded-[8px] border border-[#e7e8e9] bg-white p-[25px]"
      >
        <p class="text-[15px] text-[#777f87] mb-[10px]">แพ็กเกจปัจจุบัน</p>
        <div class="flex items-start justify-between gap-[20px]">
          <div class="space-y-[6px]">
            <div class="flex items-center gap-[8px]">
              <p class="text-[18px] font-semibold text-[#3b4854]">
                {{ mainData?.current_package?.name }}
              </p>
              <p class="text-[18px] font-semibold text-[#3b4854]">-</p>
              <p class="text-[18px] font-medium text-[#3b4854]">
                {{ Number(mainData?.current_package?.price).toLocaleString('en') }} บาทต่อ{{
                  mainData?.current_package?.type.replace('ราย', '')
                }}
              </p>
            </div>
            <p class="text-[15px] text-[#777f87]">
              {{ mainData?.current_package?.description || '' }}
            </p>
            <div class="pt-[10px]">
              <p class="text-[16px] font-medium text-[#3b4854]">การชำระเงินครั้งถัดไป</p>
              <p class="text-[16px] text-[#3b4854]">
                {{
                  moment(mainData?.expire_date).isValid()
                    ? moment(mainData?.expire_date).format('DD MMMM, YYYY')
                    : '-'
                }}
              </p>
            </div>
          </div>
          <button
            v-if="mainData?.status === 'approve' && p.is_subscribe_package"
            class="shrink-0 rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[12px] text-[16px] font-medium text-[#3b4854] transition-colors whitespace-nowrap disabled:opacity-50 disabled:!cursor-not-allowed"
            :class="{ 'hover:bg-[#f4f4f4]': !loadingUpgrade && mainData?.status !== 'waiting' }"
            :disabled="loadingUpgrade || mainData?.status === 'waiting'"
            @click="handleOpenUpgradeModal"
          >
            <template v-if="loadingUpgrade">กำลังโหลด...</template>
            <template
              v-else-if="
                (!mainData.current_package ||
                  (mainData.expire_date && moment(mainData.expire_date) < moment())) &&
                (mainData.status !== 'waiting' || mainData.status === 'reject')
              "
              >สมัคร Package</template
            >
            <template v-else-if="mainData.status === 'waiting'">รออนุมัติ</template>
            <template v-else>เปลี่ยน Package</template>
          </button>
        </div>
      </div>

      <div
        v-if="mainData?.status !== 'approve'"
        class="rounded-[8px] border border-[#e7e8e9] bg-white p-[25px]"
      >
        <p class="text-[15px] text-[#777f87] mb-[10px]">แพ็กเกจ</p>
        <div class="flex items-start justify-between gap-[20px]">
          <!-- ไม่มี current_package -->
          <div class="space-y-[6px]">
            <p
              v-if="mainData?.status === 'waiting' || mainData?.status === 'reject'"
              class="text-[18px] font-semibold text-[#3b4854]"
            >
              {{ mainData?.package_detail?.name }}
              <span class="font-normal text-[#FF725D] text-[16px]">{{
                mainData?.status === 'waiting' ? '(รอเจ้าหน้าที่ยืนยัน)' : '(ถูกปฏิเสธ)'
              }}</span>
            </p>
            <p v-else class="text-[18px] font-semibold text-[#3b4854]">ยังไม่มี Package</p>

            <p class="text-[15px] text-[#777f87]">
              {{
                mainData?.status === 'waiting'
                  ? mainData?.package_detail?.description
                  : 'กรุณาสมัคร Package'
              }}
            </p>
            <div class="pt-[10px]">
              <p class="text-[16px] font-medium text-[#3b4854]">การชำระเงินครั้งถัดไป</p>
              <p class="text-[16px] text-[#3b4854]">-</p>
            </div>
          </div>
          <button
            v-if="p.is_subscribe_package"
            class="shrink-0 rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[12px] text-[16px] font-medium text-[#3b4854] transition-colors whitespace-nowrap disabled:opacity-50 disabled:!cursor-not-allowed"
            :class="{ 'hover:bg-[#f4f4f4]': !loadingUpgrade && mainData?.status !== 'waiting' }"
            :disabled="loadingUpgrade || mainData?.status === 'waiting'"
            @click="handleOpenUpgradeModal"
          >
            <template v-if="loadingUpgrade">กำลังโหลด...</template>
            <template
              v-else-if="
                (!mainData.current_package ||
                  (mainData.expire_date && moment(mainData.expire_date) < moment())) &&
                (mainData.status !== 'waiting' || mainData.status === 'reject')
              "
              >สมัคร Package</template
            >
            <template v-else-if="mainData.status === 'waiting'">รออนุมัติ</template>
            <template v-else>เปลี่ยน Package</template>
          </button>
        </div>
      </div>

      <!-- Section 2: ความจุคลังจัดเก็บข้อมูล -->
      <div
        v-if="mainData?.current_package"
        class="rounded-[8px] border border-[#e7e8e9] bg-white p-[25px] space-y-[16px]"
      >
        <p class="text-[20px] text-[#3b4854]">ความจุคลังจัดเก็บข้อมูล</p>
        <div class="space-y-[8px]">
          <!-- Progress bar -->
          <div class="w-full h-[10px] rounded-full bg-[#f3f3f4] overflow-hidden">
            <div
              class="h-full rounded-full bg-[#c29f5f]"
              :style="{ width: usedPercent + '%' }"
            ></div>
          </div>
          <!-- Labels -->
          <div class="flex items-center justify-between">
            <p class="text-[14px] text-[#3b4854]">
              ใช้แล้ว
              {{
                usedMb.toLocaleString('en', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              }}MB
            </p>
            <p class="text-[14px] text-[#3b4854]">
              จาก
              {{
                Number((mainData.current_package.storage_size || 0).toString()).toLocaleString(
                  'en',
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  },
                )
              }}{{ mainData.current_package.storage_unit }}
            </p>
          </div>
        </div>
        <!-- <p class="text-[15px] text-[#777f87]">เครดิตการจัดเก็บจะรีเซ็ตทุกปี</p> -->
      </div>

      <!-- Section 3: ข้อมูลการเรียกเก็บเงิน -->
      <div class="rounded-[8px] border border-[#e7e8e9] bg-white p-[25px]">
        <p class="text-[20px] text-[#3b4854] mb-[14px]">ข้อมูลการเรียกเก็บเงิน</p>
        <div class="flex items-center justify-between gap-[20px]">
          <div class="space-y-[4px]">
            <p v-if="mainData?.is_company">
              {{ mainData?.company_name }}
            </p>
            <p
              class="text-[18px] font-semibold text-[#3B4854]"
              :class="mainData?.name ? '' : 'text-[#AEB3B9]'"
            >
              {{
                mainData?.name && mainData?.surname
                  ? mainData?.name + ' ' + mainData?.surname
                  : 'ยังไม่มีข้อมูล'
              }}
            </p>

            <p class="text-[15px] text-[#3B4854]">
              {{ mainData?.email }}
            </p>
          </div>

          <div class="flex items-center gap-[10px] shrink-0">
            <button
              v-if="p.is_update_payment_info"
              class="rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[12px] text-[16px] font-medium text-[#3b4854] hover:bg-[#f4f4f4] transition-colors whitespace-nowrap"
              @click="handleOpenBillingModal"
            >
              อัปเดตข้อมูล
            </button>
            <button
              v-if="p.is_payment_history"
              class="rounded-[8px] border border-[#e7e8e9] bg-white px-[20px] py-[12px] text-[16px] font-medium text-[#3b4854] hover:bg-[#f4f4f4] transition-colors whitespace-nowrap"
              @click="handleOpenPaymentHistoryModal"
            >
              ประวัติการชำระเงิน
            </button>
          </div>
        </div>
      </div>

      <!-- Section 4: การยกเลิกแพ็กเกจ -->
      <!-- <div class="rounded-[8px] border border-[#ffc2b9] bg-[#fff0ef] p-[25px] space-y-[16px]">
      <div>
        <p class="text-[20px] text-[#ff725d]">การยกเลิกแพ็กเกจ</p>
        <p class="text-[15px] text-[#3b4854]">โปรดทำความเข้าใจข้อมูลก่อนยกเลิกการสมัครสมาชิก</p>
      </div> -->

      <!-- Warning message -->
      <!-- <div class="flex items-start gap-[14px]">
        <IconWarningV2 class="shrink-0 w-[15px] mt-1.5" />
        <p class="text-[15px] text-[#3b4854] leading-relaxed">
          คุณสามารถยกเลิกการสมัครสมาชิกได้ทุกเมื่อ
          คุณจะยังคงเข้าถึงฟีเจอร์ของระบบได้จนกว่ารอบการเรียกเก็บเงินปัจจุบันของคุณจะสิ้นสุดลง
          โปรดทราบว่า<br />
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </div> -->

      <!-- Divider -->
      <!-- <div class="border-t border-[#ffc2b9]"></div> -->

      <!-- Current package -->
      <!-- <p class="text-[16px] font-medium text-[#3b4854]">แพ็กเกจปัจจุบันของคุณ</p>
      <div
        class="flex items-center justify-between rounded-[10px] border border-[#ffc2b9] bg-white px-[25px] py-[20px]"
      >
        <div class="space-y-[4px]">
          <div class="flex items-center gap-[8px]">
            <p class="text-[18px] font-semibold text-[#3b4854]">STANDARD</p>
            <p class="text-[18px] font-semibold text-[#3b4854]">-</p>
            <p class="text-[16px] text-[#3b4854]">199 บาทต่อเดือน</p>
          </div>
          <p class="text-[15px] text-[#3b4854]">การชำระเงินครั้งถัดไป : 31 ธันวาคม, 2026</p>
        </div>
        <button
          class="shrink-0 rounded-[8px] bg-[#ffe3e0] px-[20px] py-[12px] text-[16px] font-medium text-[#ff725d] hover:bg-[#ffd0cc] transition-colors whitespace-nowrap"
        >
          ยกเลิกการสมัครสมาชิก
        </button>
      </div> -->
      <!-- </div> -->
    </template>
  </div>

  <base-modal
    v-if="openChangePackageModal"
    open
    :title="
      !mainData?.current_package
        ? 'สมัครแพ็กเกจและรอบการเรียกชำระเงิน'
        : 'เปลี่ยนแพ็กเกจและรอบการเรียกชำระเงิน'
    "
    size="2lg"
    @close="openChangePackageModal = false"
  >
    <div class="p-4">
      <!-- Section 1: รอบการเรียกชำระเงิน -->
      <div
        v-if="mainData?.current_package"
        class="mb-[20px] rounded-[8px] border border-[#e7e8e9] overflow-hidden"
      >
        <p class="px-[20px] py-[16px] text-[20px] text-[#3b4854]">รอบการเรียกชำระเงิน</p>
        <div class="border-t border-[#e7e8e9]"></div>
        <div class="flex items-center justify-between px-[20px] py-[20px]">
          <p class="text-[18px] text-[#3b4854]">{{ mainData.current_package.type }}</p>
          <p class="text-[18px] text-[#3b4854]">
            {{ Number(mainData.current_package.price) }} บาทต่อเดือน
          </p>
        </div>
      </div>

      <!-- Section 2: แพ็กเกจ -->
      <div class="mb-[20px] rounded-[8px] border border-[#e7e8e9] overflow-hidden">
        <p class="px-[20px] py-[16px] text-[20px] text-[#3b4854]">แพ็กเกจ</p>
        <div class="border-t border-[#e7e8e9]"></div>
        <template v-for="(pkg, index) in packageOptions" :key="pkg.id">
          <div class="border-t border-[#e7e8e9]" v-if="index > 0"></div>
          <div
            class="flex gap-[16px] px-[20px] py-[16px] transition-colors"
            :class="
              currentPackageId === pkg.id
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-[#f9f9f9]'
            "
            @click="currentPackageId !== pkg.id && (changePackageForm.selectedPackage = pkg.id)"
          >
            <div
              v-if="currentPackageId !== pkg.id"
              class="size-[20px] shrink-0 rounded-full border-2 mt-1 flex items-center justify-center"
              :class="
                changePackageForm.selectedPackage === pkg.id
                  ? 'border-[#c29f5f] bg-[#c29f5f]'
                  : 'border-[#d1d5db]'
              "
            >
              <div
                v-if="changePackageForm.selectedPackage === pkg.id"
                class="size-[8px] rounded-full bg-white"
              ></div>
            </div>
            <div class="flex-1 min-w-0 space-y-[6px]">
              <div class="flex items-center gap-[8px]">
                <p class="text-[18px] text-[#3b4854]">{{ pkg.name }}</p>
                <p class="text-[18px] text-[#3b4854]">-</p>
                <p class="text-[18px] text-[#3b4854]">
                  {{ Number(pkg.price).toLocaleString('en') }} บาทต่อ{{
                    pkg.type.replace('ราย', '')
                  }}
                </p>
              </div>
              <p v-if="pkg.description" class="text-[15px] text-[#3b4854]">{{ pkg.description }}</p>
            </div>
            <div
              v-if="currentPackageId === pkg.id"
              class="rounded-[8px] bg-[#def3ff] px-[16px] py-[8px] h-fit"
            >
              <span class="text-[15px] text-[#16b1ff]">ใช้อยู่</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Summary -->
      <div class="mb-[20px]">
        <div class="flex items-center justify-between py-[10px]">
          <p class="text-[18px] text-[#3b4854]">{{ selectedPackageData?.name }} + รายเดือน</p>
          <p class="text-[18px] text-[#3b4854]">
            {{ Number(selectedPackageData?.price).toLocaleString('en') }} บาท
          </p>
        </div>
        <div class="border-t border-[#e7e8e9]"></div>
        <div class="flex items-center justify-between py-[10px]">
          <p class="text-[20px] text-[#3b4854]">รวมทั้งสิ้น</p>
          <p class="text-[20px] text-[#3b4854]">
            {{ Number(selectedPackageData?.price).toLocaleString('en') }} บาท
          </p>
        </div>
        <p class="text-[15px] text-[#3b4854]">
          โปรดโอนเงินและแนบสลิปโอนเพื่อการตรวจสอบและยืนยันสิทธิ
        </p>
      </div>

      <!-- Section 3: ช่องทางการชำระเงิน -->
      <div class="mb-[20px] rounded-[8px] border border-[#e7e8e9] overflow-hidden">
        <p class="px-[20px] py-[16px] text-[20px] text-[#3b4854]">ช่องทางการชำระเงิน</p>
        <div class="border-t border-[#e7e8e9]"></div>
        <div class="p-[20px] space-y-[16px]">
          <!-- Bank info -->
          <div class="flex items-center justify-center gap-[14px]">
            <img :src="imgKbank" class="size-[40px]" />

            <p class="text-[16px] text-[#3b4854]">
              กสิกรไทย เลขที่บัญชี 123-4-56789-0, ชื่อบัญชี บริษัท กฎหมาย จำกัด
            </p>
          </div>
          <!-- หรือ QR code -->
          <p class="text-center text-[15px] text-[#777f87]">หรือ QR code</p>
          <!-- QR placeholder -->
          <div class="flex justify-center">
            <img :src="imgQrCode" class="size-[300px]" />
          </div>
        </div>
      </div>

      <!-- File upload -->
      <div class="mb-[20px]">
        <p class="text-[15px] text-[#3b4854] mb-[10px]">
          ไฟล์หลักฐานการชำระเงิน <span class="text-[#ff725d]">*</span>
        </p>
        <input
          ref="changePackageProofInputRef"
          type="file"
          accept=".jpg,.jpeg,.png"
          class="hidden"
          @change="handleChangePackageProofUpload"
        />
        <button
          class="w-full rounded-[6px] border bg-white px-[16px] py-[13px] flex items-center gap-[10px] hover:bg-[#f4f4f4] transition-colors"
          :class="slipError ? 'border-[#ff725d]' : 'border-[#e7e8e9]'"
          @click="
            () => {
              changePackageProofInputRef?.click()
              slipError = ''
            }
          "
        >
          <IconAttachLink />
          <span class="text-[16px] text-[#aeb3b9]">
            <span v-if="changePackageForm.paymentProofFileName">{{
              changePackageForm.paymentProofFileName
            }}</span>
            <span v-else>กดเพื่ออัปโหลดไฟล์</span>
          </span>
        </button>
        <p v-if="slipError" class="mt-[6px] text-[13px] text-[#ff725d]">{{ slipError }}</p>
      </div>

      <!-- ยืนยันและชำระเงิน -->
      <button
        class="w-full rounded-[6px] bg-[#0f182a] py-[14px] text-[16px] font-medium text-white transition-colors mb-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'hover:bg-[#0f182a]/80': !loadingConfirmPackage && !isSelectedCurrentPackage }"
        :disabled="loadingConfirmPackage || isSelectedCurrentPackage"
        @click="handleConfirmChangePackage"
      >
        {{ loadingConfirmPackage ? 'กำลังดำเนินการ...' : 'ยืนยันและชำระเงิน' }}
      </button>

      <!-- Terms -->
      <!-- <p class="text-[14px] text-[#777f87] leading-relaxed">
        เมื่อคลิก <span class="text-[#3b4854]">ยืนยันและชำระเงิน</span>
        คุณยอมรับข้อกำหนดการใช้งานของเรา
        <span class="text-[#3b4854]">การต่ออายุอัตโนมัติรายเดือน</span> : คุณจะถูกเรียกเก็บเงิน
        {{ Number(selectedPackageData?.price) }} บาท ทุกเดือนโดยอัตโนมัติสำหรับการสมัครสมาชิกของคุณ
        ยกเลิก: คุณสามารถยกเลิกการสมัครสมาชิกได้ทุกเมื่อ
      </p> -->
    </div>
  </base-modal>

  <base-modal
    v-if="openPaymentHistoryModal"
    open
    title="ประวัติการชำระเงิน"
    size="xl"
    @close="openPaymentHistoryModal = false"
  >
    <div class="p-4">
      <div class="rounded-[8px] border border-[#e7e8e9] overflow-hidden">
        <div class="px-[25px] py-[14px] border-b border-[#e7e8e9]">
          <p class="text-[18px] text-[#3b4854]">ใบแจ้งหนี้</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#e7e8e9]">
              <th class="px-[25px] py-[14px] text-left text-[15px] font-medium text-[#3b4854]">
                แพ็กเกจ
              </th>
              <th class="px-[25px] py-[14px] text-left text-[15px] font-medium text-[#3b4854]">
                อ้างอิง
              </th>
              <th class="px-[25px] py-[14px] text-left text-[15px] font-medium text-[#3b4854]">
                วันที่
              </th>
              <th class="px-[25px] py-[14px] text-left text-[15px] font-medium text-[#3b4854]">
                ยอด
              </th>
              <th class="px-[25px] py-[14px] text-left text-[15px] font-medium text-[#3b4854]">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody v-if="count(paymentHistory) > 0">
            <tr v-for="item in paymentHistory" :key="item.id" class="border-t border-[#e7e8e9]">
              <td class="px-[25px] py-[16px] text-[16px] text-[#3b4854]">
                {{ item?.package_detail?.name }}
              </td>
              <td class="px-[25px] py-[16px] text-[16px] text-[#777f87]">{{ item.ref_code }}</td>
              <td class="px-[25px] py-[16px] text-[16px] text-[#777f87]">
                {{
                  moment(item.insert_date_time).isValid()
                    ? moment(item.insert_date_time).format('DD/MM/YYYY')
                    : '-'
                }}
              </td>
              <td class="px-[25px] py-[16px] text-[16px] text-[#777f87]">
                {{
                  Number((item.price || 0).toString()).toLocaleString('en', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
                บาท
              </td>
              <td class="px-[25px] py-[16px]">
                <span
                  class="inline-block rounded-[8px] px-[12px] py-[6px] text-[15px]"
                  :class="getStatusClass(item.status)"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="px-[25px] py-[16px] text-center text-[16px] text-[#777f87]">
                ไม่มีรายการ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </base-modal>

  <base-modal
    v-if="openBillingModal"
    open
    title="อัปเดตข้อมูลการเรียกเก็บเงิน"
    subtitle="สำหรับระบุในเอกสารที่เกี่ยวข้อง"
    size="smm"
    action-button
    action-text="บันทึก"
    action-text-cancel="ปิด"
    variant="success"
    :disabled="loadingSaveBilling"
    :loading="loadingSaveBilling"
    @primary="handleSaveBilling"
    @close="
      () => {
        resetBillingForm()
        openBillingModal = false
      }
    "
    positionAction="left"
  >
    <!-- ชื่อ + นามสกุล -->
    <div class="mb-[20px] grid grid-cols-2 gap-[20px]">
      <base-text-input
        v-model="billingForm.firstName"
        label="ชื่อ"
        labelType="vertical"
        placeholder="กรอกชื่อ"
        required
        :error="billingErrors.firstName"
        @input="billingErrors.firstName = ''"
      />
      <base-text-input
        v-model="billingForm.lastName"
        label="นามสกุล"
        labelType="vertical"
        placeholder="กรอกนามสกุล"
        required
        :error="billingErrors.lastName"
        @input="billingErrors.lastName = ''"
      />
    </div>

    <!-- อีเมล -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="billingForm.email"
        label="อีเมล"
        labelType="vertical"
        placeholder="กรอก"
        required
        :error="billingErrors.email"
        @input="billingErrors.email = ''"
      />
    </div>

    <!-- ที่อยู่ -->
    <div class="mb-[20px]">
      <base-text-input
        v-model="billingForm.address"
        label="ที่อยู่"
        labelType="vertical"
        placeholder="กรอก"
        required
        :error="billingErrors.address"
        @input="billingErrors.address = ''"
      />
    </div>

    <div class="mb-[20px] grid grid-cols-2 gap-[20px]">
      <base-data-dropdown-multi-select
        v-model="billingForm.province"
        label="จังหวัด"
        labelType="vertical"
        labelWidth="w-[100%]"
        required
        :options="provinceOptions"
        placeholder="เลือก"
        :error="billingErrors.province"
        @update:modelValue="billingErrors.province = ''"
      />
      <base-text-input
        v-model="billingForm.postalCode"
        label="รหัสไปรษณีย์"
        labelType="vertical"
        placeholder="กรอก"
      />
    </div>

    <!-- checkbox ฉันเป็นบริษัท -->
    <div class="mb-[20px] flex items-center gap-[12px]">
      <button
        type="button"
        class="flex size-[25px] shrink-0 items-center justify-center rounded-[5px] transition-colors"
        :class="billingForm.isCompany ? 'bg-[#3cad00]' : 'border border-[#e7e8e9] bg-white'"
        @click="billingForm.isCompany = !billingForm.isCompany"
      >
        <IconCheckmark v-if="billingForm.isCompany" class="text-white" />
      </button>
      <span class="text-[16px] text-[#3b4854]">ฉันเป็นบริษัท</span>
    </div>

    <!-- ชื่อบริษัท + เลขทะเบียน (แสดงเมื่อเป็นบริษัท) -->
    <template v-if="billingForm.isCompany">
      <div class="mb-[20px]">
        <base-text-input
          v-model="billingForm.companyName"
          label="ชื่อบริษัท"
          labelType="vertical"
          placeholder="กรอก"
          required
          :error="billingErrors.companyName"
          @input="billingErrors.companyName = ''"
        />
      </div>
      <div class="mb-[5px]">
        <base-text-input
          v-model="billingForm.taxId"
          label="เลขทะเบียนผู้เสียภาษี"
          labelType="vertical"
          placeholder="กรอก"
          required
          :error="billingErrors.taxId"
          @input="billingErrors.taxId = ''"
        />
      </div>
    </template>
  </base-modal>
</template>
