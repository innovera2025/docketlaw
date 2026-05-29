<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'

const router = useRouter()
const isLoading = ref(false)

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
  server: '',
})

const validate = () => {
  errors.email = ''
  errors.server = ''

  if (!form.email) {
    errors.email = 'กรุณากรอกอีเมล'
    push.warning('กรุณากรอกข้อมูลให้ครบถ้วน!')
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    push.warning('รูปแบบอีเมลไม่ถูกต้อง!')
    return false
  }

  return true
}

const onSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  try {
    const res = await API(
      'specific\\lawfirm\\lawyer_user',
      'forgetPassword',
      { email: form.email },
      false,
      true,
    )
    if (res?.response_status) {
      push.success('ส่งคำขอรีเซ็ตรหัสผ่านเรียบร้อย กรุณาตรวจสอบอีเมลของคุณ')
      router.push('/login')
    } else {
      errors.server = res?.response_message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      push.error('เกิดข้อผิดพลาด!\n' + (res?.response_message || ''))
    }
  } catch (err) {
    errors.server = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
    push.error('เกิดข้อผิดพลาดในการเชื่อมต่อ!\n' + err)
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
      class="h-screen w-[700px] flex flex-col justify-center bg-white dark:bg-neutral-800 py-8 px-20 sm:ml-auto"
    >
      <!-- Logo -->
      <div class="mb-6">
        <img src="@/assets/images/logo-login.svg" class="mb-4 w-[252px]" />
      </div>

      <!-- Header -->
      <div class="mb-8 space-y-1">
        <div class="text-[28px] text-[#3b4854] flex items-center gap-2">
          <p>ลืมรหัสผ่าน</p>
        </div>
        <p class="text-[20px] text-[#3b4854] mb-[10px]">ระบบจัดการคดีและจัดเก็บข้อมูล</p>
        <p class="text-[15px] text-[#777f87]">กรอกอีเมลที่ผูกกับบัญชีของคุณเพื่อรับรหัสผ่านใหม่</p>
      </div>

      <!-- Fields -->
      <div class="space-y-5 mb-8">
        <div class="space-y-[6px]">
          <label class="text-[15px] text-[#3b4854]">อีเมล</label>
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': errors.email }"
          >
            <iconMail class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              placeholder="ระบุอีเมลของคุณ"
              v-model="form.email"
              type="email"
              class="w-full outline-none text-[16px] placeholder:text-[#aeb3b9]"
            />
          </div>
          <p v-if="errors.email" class="text-danger text-sm pl-1">{{ errors.email }}</p>
        </div>

        <p v-if="errors.server" class="text-danger text-sm">{{ errors.server }}</p>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full h-[50px] rounded-[6px] !text-[#0F182A] bg-[#c29f5f] text-[16px] font-medium hover:bg-[#b08d4e] transition-colors mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'กำลังส่ง...' : 'ส่งคำขอรีเซ็ตรหัสผ่าน' }}
      </button>

      <!-- Back to login -->
      <p class="text-center text-[17px] text-[#777f87]">
        จำรหัสผ่านได้แล้ว?
        <router-link to="/login" class="text-[#c29f5f] hover:underline">เข้าสู่ระบบ</router-link>
      </p>
    </form>
  </main>
</template>
