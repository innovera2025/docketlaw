<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { initLoginForm } from '@/utils/login-face'
import IconYeti from '@/components/icons/IconYeti.vue'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeSlash from '@/components/icons/IconEyeSlash.vue'

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

const login = async (data: { username: string; password: string }) => {
  await loginStore
    .login(data)
    .then((res) => {
      if (res.response_data.role === 'admin') {
        loginErrors.server = ''
        push.success('เข้าสู่ระบบสําเร็จ!')
        router.push('/')
      } else {
        loginStore.logout()
        loginForm.password = ''
        push.info('ท่านไม่มีสิทธิ์เข้าใช้งานระบบ!')
      }
    })
    .catch((err) => {
      loginErrors.server = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'
      push.error('เข้าสู่ระบบไม่สําเร็จ!\nInvalid username or password.')
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
  if (localStorage.wloves_hash) {
    router.push('/')
  }

  cleanup = initLoginForm()
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
      class="h-screen w-[640px] flex flex-col space-y-8 bg-white dark:bg-neutral-800 py-8 px-[120px] max-[560px]:px-[40px] max-[400px]:px-[20px] pt-24 sm:ml-auto"
    >
      <div class="flex flex-col gap-4">
        <img src="/src/assets/images/logo-login.svg" class="w-[255px] mb-[40px]" />

        <div class="space-y-2">
          <p class="text-[28px] text-[#3B4854] flex items-center gap-[5px]">
            ยินดีต้อนรับสู่ระบบ! <IconHand />
          </p>
          <p class="text-[20px] text-[#3B4854]">การจัดการระบบ INNOVERA DOCKETLAW</p>
          <p class="text-[15px] font-regular text-[#777F87]">เข้าใช้งานระบบผ่านบัญชีผู้ใช้ของคุณ</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-[5px]">
          <div id="loginEmailLabel" for="loginEmail" class="text-[#3B4854]">บัญชีผู้ใช้</div>
          <div
            class="flex items-center gap-4 px-4 border rounded-[6px] border-[#E6E6E6]"
            :class="{ '!border-danger': loginErrors.username }"
          >
            <IconUsername class="text-[#3B4854]" />
            <input
              id="loginEmail"
              placeholder="ระบุบัญชีของคุณ"
              v-model="loginForm.username"
              type="text"
              class="w-full outline-none h-[55px] placeholder:text-[#979898]"
            />
          </div>
          <p class="text-danger text-sm pl-2">{{ loginErrors.username }}</p>
        </div>

        <div class="space-y-[5px]">
          <div id="loginPasswordLabel" for="loginPassword" class="text-[#3B4854]">รหัสผ่าน</div>
          <div
            class="flex items-center gap-4 px-4 border rounded-[6px] border-[#E6E6E6]"
            :class="{ '!border-danger': loginErrors.password }"
          >
            <iconLock class="text-[#3B4854] min-w-[15px]" />
            <input
              :type="showPassword ? 'text' : 'password'"
              autocomplete="off"
              placeholder="ระบุรหัสผ่าน"
              v-model="loginForm.password"
              class="w-full outline-none h-[55px] placeholder:text-[#979898]"
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="cursor-pointer text-[#676A6F] hover:text-[#3B4854] transition-colors"
            >
              <IconEye class="text-[#000000]" />
            </button>
          </div>
          <p class="text-danger text-sm pl-2">{{ loginErrors.password }}</p>
        </div>

        <p class="text-danger text-sm pl-2">{{ loginErrors.server }}</p>
      </div>

      <button
        class="rounded-[6px] bg-primary text-[#000000] hover:bg-primary/80 w-full py-4 text-[17px] font-semibold"
      >
        เข้าสู่ระบบ
      </button>

      <p class="text-center text-[17px] text-[#676A6F] max-w-[350px] mx-auto">
        หากต้องการเข้าสู่ระบบหรือพบปัญหาการเข้าใช้งาน โปรดติดต่อผู้ดูแลระบบ
      </p>
    </form>
  </main>
</template>
