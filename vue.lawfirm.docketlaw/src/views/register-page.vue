<script setup lang="ts">
import { md5 } from 'js-md5'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeSlash from '@/components/icons/IconEyeSlash.vue'
import IconMail from '@/components/icons/IconMail.vue'
import BaseModal from '@/components/base/base-modal.vue'

const router = useRouter()

const isLoading = ref(false)
const showPassword = ref(false)
const agreeTerms = ref(false)
const showTermsModal = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  terms: '',
})

const resetErrors = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.terms = ''
}

const validate = () => {
  resetErrors()
  let isValid = true

  if (!form.username) {
    errors.username = 'กรุณากรอกชื่อบัญชีผู้ใช้'
    isValid = false
  }
  if (!form.email) {
    errors.email = 'กรุณากรอกอีเมล'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    isValid = false
  }
  if (!form.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
    isValid = false
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    isValid = false
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
    errors.password = 'รหัสผ่านต้องมีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว'
    isValid = false
  }
  if (!agreeTerms.value) {
    errors.terms = 'กรุณายอมรับข้อกำหนดและเงื่อนไขการใช้งาน'
    isValid = false
  }

  if (!isValid) push.warning('กรุณากรอกข้อมูลให้ครบถ้วน!')
  return isValid
}

const onSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  try {
    // Check if username already exists
    const checkRes = await API(
      'amstx5\\User',
      'isUsernameExists',
      { username: form.username },
      true,
      true,
    )
    if (checkRes.response_data) {
      errors.username = 'บัญชีผู้ใช้นี้ถูกใช้งานแล้ว'
      push.error('บัญชีผู้ใช้ / Username นี้ถูกใช้ไปแล้ว!')
      return
    }

    // Register as lawyer
    const res = await API(
      'specific\\lawfirm\\lawyer_user',
      'insert',
      {
        main_lawyer_id: 0,
        username: form.username,
        password: md5(form.password),
        details: {
          full_name: form.username,
          email: form.email,
          type: 'lawyer',
          is_login: 1,
          permissions: {
            is_sec_calendar: 1,
            is_add_appointment: 1,
            is_edit_appointment: 1,
            is_delete_appointment: 1,
            is_change_appointment_status: 1,

            is_sec_cases: 1,

            is_add_case: 1,
            is_add_case_step: 1,
            is_delete_case: 1,
            is_edit_case: 1,
            is_edit_case_step: 1,
            is_delete_case_step: 1,

            is_sec_documents: 1,
            is_upload_document: 1,
            is_download_document: 1,
            is_delete_document: 1,
            is_preview_file: 1,

            is_sec_ocr: 1,
            is_request_ocr: 1,
            is_search_ocr: 1,

            is_sec_employee: 1,
            is_delete_employee: 1,
            is_view_employee_detail: 1,
            is_manage_access: 1,
            is_add_employee: 1,
            is_view_history: 1,
            is_edit_employee: 1,

            is_sec_report: 1,
            is_export_report: 1,
            is_financial_report: 1,

            is_sec_package: 1,
            is_subscribe_package: 1,
            is_update_payment_info: 1,
            is_payment_history: 1,
          },
        },
      },
      false,
      true,
    )

    if (res.response_status) {
      push.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
      router.push('/login')
    } else {
      if (res.response_message.includes('Duplicate entry')) {
        push.warning('บัญชีผู้ใช้นี้ถูกใช้ไปแล้ว!')
      } else if (res.response_message.includes('Email already exists')) {
        push.warning('อีเมลนี้ถูกใช้ไปแล้ว!')
      } else {
        push.error('สมัครสมาชิกไม่สำเร็จ!\n' + res.response_message)
      }
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="min-w-screen flex h-fit min-h-screen w-screen overflow-x-hidden bg-[url('@/assets/images/bg-login.png')] bg-cover bg-no-repeat"
  >
    <form
      @submit.prevent="onSubmit"
      class="h-screen w-[700px] flex flex-col justify-center bg-white dark:bg-neutral-800 py-8 px-20 sm:ml-auto overflow-y-auto"
    >
      <!-- Logo -->
      <div class="mb-6">
        <img src="@/assets/images/logo-login.svg" class="mb-4 w-[252px]" />
      </div>

      <!-- Header -->
      <div class="mb-8 space-y-1">
        <div class="text-[28px] text-[#3b4854] flex items-center gap-2">
          <p>มาทดลองใช้ระบบกันเถอะ!</p>
          <IconRocket class="w-[24px] h-[24px]" />
        </div>
        <p class="text-[20px] text-[#3b4854] mb-[10px]">ระบบจัดการคดีและจัดเก็บข้อมูล</p>
        <p class="text-[15px] text-[#777f87]">กรอกรายละเอียดเพื่อการสมัครสมาชิก</p>
      </div>

      <!-- Fields -->
      <div class="space-y-5 mb-5">
        <!-- บัญชีผู้ใช้ / Username -->
        <div class="space-y-[6px]">
          <label class="text-[15px] text-[#3b4854]"
            >บัญชีผู้ใช้ / Username <span class="text-danger">*</span></label
          >
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': errors.username }"
          >
            <iconUserV2 class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              placeholder="ระบุชื่อบัญชีสำหรับใช้เข้าสู่ระบบ"
              v-model="form.username"
              type="text"
              class="w-full outline-none text-[16px] placeholder:text-[#aeb3b9]"
            />
          </div>
          <p v-if="errors.username" class="text-danger text-sm pl-1">{{ errors.username }}</p>
        </div>

        <!-- อีเมล -->
        <div class="space-y-[6px]">
          <label class="text-[15px] text-[#3b4854]">อีเมล <span class="text-danger">*</span></label>
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': errors.email }"
          >
            <IconMail class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              placeholder="ระบุอีเมล"
              v-model="form.email"
              type="email"
              class="w-full outline-none text-[16px] placeholder:text-[#aeb3b9]"
            />
          </div>
          <p v-if="errors.email" class="text-danger text-sm pl-1">{{ errors.email }}</p>
        </div>

        <!-- รหัสผ่าน -->
        <div class="space-y-[6px]">
          <label class="text-[15px] text-[#3b4854]"
            >รหัสผ่าน <span class="text-danger">*</span></label
          >
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': errors.password }"
          >
            <iconLock class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              :type="showPassword ? 'text' : 'password'"
              autocomplete="off"
              placeholder="ระบุรหัสผ่าน"
              v-model="form.password"
              class="w-full outline-none text-[16px] placeholder:text-[#aeb3b9]"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="cursor-pointer text-[#777f87] hover:text-[#3b4854] transition-colors shrink-0"
            >
              <IconEyeSlash v-if="showPassword" class="text-[#777f87]" />
              <IconEye v-else class="text-[#777f87] -mt-1" />
            </button>
          </div>
          <p v-if="errors.password" class="text-danger text-sm pl-1">{{ errors.password }}</p>
          <p v-else class="text-[12px] text-[#AEB3B9] pl-1">
            ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์
          </p>
        </div>
      </div>

      <!-- ยอมรับข้อกำหนด -->
      <div class="mb-6">
        <label
          class="flex items-start gap-[10px] cursor-pointer select-none"
          @click="agreeTerms = !agreeTerms"
        >
          <div
            class="w-[20px] h-[20px] mt-[2px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0"
            :class="agreeTerms ? 'border-[#c29f5f] bg-[#fdf8ef]' : 'border-[#b2b6bb] bg-white'"
          >
            <svg v-if="agreeTerms" width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path
                d="M1 4L4.5 7.5L11 1"
                stroke="#c29f5f"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="text-[16px] text-[#3b4854] leading-snug">
            ฉันเข้าใจและยอมรับ
            <span
              class="text-[#c29f5f] cursor-pointer underline"
              @click.stop="showTermsModal = true"
              >ข้อกำหนดและเงื่อนไขการใช้งาน</span
            >
          </span>
        </label>
        <p v-if="errors.terms" class="text-danger text-sm pl-[30px] mt-1">{{ errors.terms }}</p>
      </div>

      <!-- สมัครสมาชิก button -->
      <button
        :disabled="isLoading"
        class="w-full h-[50px] rounded-[6px] !text-[#0F182A] bg-[#c29f5f] text-[16px] font-medium hover:bg-[#b08d4e] transition-colors mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
      </button>

      <!-- Login link -->
      <p class="text-center text-[17px] text-[#777f87]">
        มีบัญชีสำหรับเข้าใช้งานระบบแล้ว?
        <router-link to="/login" class="text-[#c29f5f] hover:underline">เข้าสู่ระบบ</router-link>
      </p>
    </form>
  </main>

  <BaseModal :open="showTermsModal" size="lg" @close="showTermsModal = false">
    <div class="p-6">
      <h2 class="text-[20px] font-semibold text-[#0F182A] mb-4">ข้อกำหนดและเงื่อนไขการใช้งาน</h2>

      <div class="text-[15px] text-[#3b4854] leading-relaxed space-y-4">
        <h3 class="font-semibold text-[#0F182A] mb-1">1. การยอมรับข้อกำหนด</h3>
        <p>
          การใช้งานระบบนี้ถือว่าท่านได้อ่าน เข้าใจ
          และยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ในเอกสารนี้ หากท่านไม่ยอมรับข้อกำหนดใด ๆ
          กรุณางดใช้บริการ
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">2. การใช้งานระบบ</h3>
        <p>
          ท่านตกลงที่จะใช้งานระบบนี้เพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมายเท่านั้น และจะไม่กระทำการใด ๆ
          ที่อาจก่อให้เกิดความเสียหายต่อระบบหรือผู้ใช้งานรายอื่น
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">3. ข้อมูลส่วนบุคคล</h3>
        <p>
          ข้อมูลส่วนบุคคลของท่านจะถูกเก็บรักษาและใช้งานตามนโยบายความเป็นส่วนตัว
          โดยบริษัทจะไม่เปิดเผยข้อมูลของท่านต่อบุคคลภายนอกโดยไม่ได้รับความยินยอม
          เว้นแต่เป็นการดำเนินการตามที่กฎหมายกำหนด
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">4. ความปลอดภัยของบัญชี</h3>
        <p>
          ท่านมีหน้าที่รับผิดชอบในการรักษาความลับของชื่อผู้ใช้และรหัสผ่านของท่าน
          และจะต้องแจ้งให้บริษัททราบทันทีหากพบว่ามีการใช้งานบัญชีของท่านโดยไม่ได้รับอนุญาต
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">5. ทรัพย์สินทางปัญญา</h3>
        <p>
          เนื้อหา ข้อมูล และสิ่งต่าง ๆ ที่ปรากฏในระบบนี้ถือเป็นทรัพย์สินของบริษัท การทำซ้ำ ดัดแปลง
          หรือเผยแพร่โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรถือเป็นการละเมิดลิขสิทธิ์
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">6. การเปลี่ยนแปลงข้อกำหนด</h3>
        <p>
          บริษัทขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงข้อกำหนดและเงื่อนไขนี้ได้ตลอดเวลา
          โดยจะแจ้งให้ผู้ใช้งานทราบผ่านช่องทางที่เหมาะสม
          การใช้งานต่อไปหลังจากการแจ้งถือว่าท่านยอมรับข้อกำหนดที่เปลี่ยนแปลง
        </p>

        <h3 class="font-semibold text-[#0F182A] mb-1">7. การยกเลิกบัญชี</h3>
        <p>
          บริษัทขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของท่านหากพบว่ามีการละเมิดข้อกำหนดและเงื่อนไขนี้
          โดยไม่จำเป็นต้องแจ้งล่วงหน้า
        </p>

        <p class="text-[13px] text-[#777f87] pt-2">อัปเดตล่าสุด: มกราคม 2568</p>
      </div>
    </div>
  </BaseModal>
</template>
