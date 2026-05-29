<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { UAParser } from 'ua-parser-js'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeSlash from '@/components/icons/IconEyeSlash.vue'
import { API } from '@/api'

const router = useRouter()
const loginStore = useUserStore()
let cleanup: (() => void) | undefined

const isLoading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginErrors = reactive({
  username: '',
  password: '',
  server: '',
})

const getDeviceInfo = async (): Promise<string> => {
  const parser = new UAParser()
  const result = parser.getResult()

  const browser = result.browser.name || 'Unknown Browser'
  const os = result.os.name || 'Unknown OS'
  const device =
    result.device.model || (result.device.vendor ? `${result.device.vendor} Device` : '')

  let country = ''
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(timeout)
    const json = await res.json()
    country = json.country_name || ''
  } catch {
    // ignore if IP lookup fails
  }

  return [`${browser} on ${os}`, device, country].filter(Boolean).join(', ')
}

const login = async (data: { username: string; password: string }) => {
  await loginStore
    .login(data)
    .then(async (res) => {
      if (res.response_status) {
        const role = res.response_data.role
        console.log(role)
        if (role === 'lawyer' || role === 'employee') {
          const deviceInfo = await getDeviceInfo()
          await API('specific\\lawfirm\\timeline', 'insert', {
            name: 'เข้าสู่ระบบ',
            description: deviceInfo || 'เข้าสู่ระบบเรียบร้อย',
            type: 'login',
          }).then((res) => {
            if (res.response_status) {
            } else {
              push.error('เกิดข้อผิดพลาดในการเก็บข้อมูลlog!\n' + res.response_message)
            }
          })
          localStorage.removeItem('lawyer_remember_username')
          localStorage.removeItem('lawyer_remember_password')
          loginErrors.server = ''
          push.success('เข้าสู่ระบบสําเร็จ!')
          router.push('/')
        } else {
          loginStore.logout()
          loginForm.password = ''
          push.info('ท่านไม่มีสิทธิ์เข้าใช้งานระบบ!')
        }
      } else {
        push.error('เข้าสู่ระบบไม่สําเร็จ!\n' + res.response_message)
      }
    })
    .catch((err) => {
      loginErrors.server = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'
      push.error('เข้าสู่ระบบไม่สําเร็จ!\n' + err)
    })
}

const onSubmit = (data: { username: string; password: string }) => {
  const valid = validateLogin()
  if (!valid) return
  login(data)
}

const validateLogin = () => {
  let isValid = true

  loginErrors.username = ''
  loginErrors.password = ''

  loginErrors.username = loginForm.username ? '' : 'กรุณากรอกชื่อบัญชี'
  loginErrors.password = loginForm.password ? '' : 'กรุณากรอกรหัสผ่าน'

  if (loginErrors.username || loginErrors.password) {
    isValid = false
    push.warning('กรุณากรอกข้อมูลให้ครบถ้วน!')
  }

  return isValid
}

onMounted(async () => {
  isLoading.value = true
  if (localStorage.lawyer_hash) {
    router.push('/')
  }

  isLoading.value = false
})

onBeforeUnmount(() => {
  cleanup?.()
})
</script>

<template>
  <main
    v-if="!isLoading"
    class="min-w-screen flex h-fit min-h-screen w-screen overflow-x-hidden bg-[url('@/assets/images/bg-login.png')] bg-cover bg-no-repeat"
  >
    <form
      @submit.prevent="onSubmit(loginForm)"
      class="h-screen w-[700px] flex flex-col justify-center bg-white dark:bg-neutral-800 py-8 px-20 sm:ml-auto"
    >
      <!-- Logo -->
      <div class="mb-6">
        <img src="@/assets/images/logo-login.svg" class="mb-4 w-[252px]" />
      </div>

      <!-- Header -->
      <div class="mb-8 space-y-1">
        <div class="text-[28px] text-[#3b4854] flex items-center gap-2">
          <p>ยินดีต้อนรับสู่ระบบ!</p>
          <IconHand class="w-[24px] h-[24px]" />
        </div>
        <p class="text-[20px] text-[#3b4854] mb-[10px]">ระบบจัดการคดีและจัดเก็บข้อมูล</p>
        <p class="text-[15px] text-[#777f87]">เข้าใช้งานระบบผ่านบัญชีผู้ใช้ของคุณ</p>
      </div>

      <!-- Fields -->
      <div class="space-y-5 mb-5">
        <!-- บัญชีผู้ใช้ -->
        <div class="space-y-[6px]">
          <label id="loginEmailLabel" class="text-[15px] text-[#3b4854]">บัญชีผู้ใช้</label>
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': loginErrors.username }"
          >
            <iconUserV2 class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              id="loginEmail"
              placeholder="ระบุบัญชีของคุณ"
              v-model="loginForm.username"
              type="text"
              class="w-full outline-none text-[16px] placeholder:text-[#aeb3b9]"
            />
          </div>
          <p v-if="loginErrors.username" class="text-danger text-sm pl-1">
            {{ loginErrors.username }}
          </p>
        </div>

        <!-- รหัสผ่าน -->
        <div class="space-y-[6px]">
          <label id="loginPasswordLabel" class="text-[15px] text-[#3b4854]">รหัสผ่าน</label>
          <div
            class="flex items-center gap-3 px-4 border rounded-[6px] border-[#e7e8e9] h-[50px] mt-2"
            :class="{ '!border-danger': loginErrors.password }"
          >
            <iconLock class="text-[#3b4854] w-[18px] shrink-0" />
            <input
              :type="showPassword ? 'text' : 'password'"
              autocomplete="off"
              placeholder="ระบุรหัสผ่าน"
              v-model="loginForm.password"
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
          <p v-if="loginErrors.password" class="text-danger text-sm pl-1">
            {{ loginErrors.password }}
          </p>
        </div>

        <p v-if="loginErrors.server" class="text-danger text-sm">{{ loginErrors.server }}</p>
      </div>

      <!-- ลืมรหัสผ่าน -->
      <div class="flex items-center justify-end mb-6">
        <router-link to="/forget-password" class="text-[16px] text-[#c29f5f] hover:underline">
          ลืมรหัสผ่าน
        </router-link>
      </div>

      <!-- เข้าสู่ระบบ button -->
      <button
        class="w-full h-[50px] rounded-[6px] !text-[#0F182A] bg-[#c29f5f] text-[16px] font-medium hover:bg-[#b08d4e] transition-colors mb-6"
      >
        เข้าสู่ระบบ
      </button>

      <!-- Register link -->
      <p class="text-center text-[17px] text-[#777f87]">
        ยังไม่มีบัญชีสำหรับเข้าใช้งาน?
        <router-link to="/register" class="text-[#c29f5f] hover:underline"
          >สมัครสมาชิกใหม่</router-link
        >
      </p>
    </form>
  </main>
</template>
