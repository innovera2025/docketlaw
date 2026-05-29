<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment/min/moment-with-locales'
import { onClickOutside, templateRef } from '@vueuse/core'
import baseNavNode from './components/base/base-nav-node.vue'
import { useUserStore } from './stores'
import { Notification, Notivue, NotivueSwipe } from 'notivue'

moment.locale('th')

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(true)
const renderCount = ref(0)
const openProfile = ref(false)
const forceOpenNav = ref(false)
const forceHideNav = ref(false)
const isSmallScreen = ref(window.innerWidth < 1024)

// Export function to force breadcrumb update
;(window as any).updateBreadcrumb = () => {
  renderCount.value++
}
const isEnv = import.meta.env.VITE_API_URL

const date = ref(moment().format('DD-MM-YYYY'))
const time = ref(moment().format('HH:mm'))
const isBackSite = computed(() =>
  ['/', '/overview', '/customer', '/payment', '/package', '/admin'].includes(route.path),
)

const appNavs = ref<
  {
    category?: string
    title: string
    icon?: string
    path?: string
    children?: {
      name: string
      path: string
      icon?: string
      isShow?: boolean
      img?: string
    }[]
  }[]
>()

const nav = templateRef<HTMLDivElement>('nav')
const profile = templateRef<HTMLDivElement>('profile')

onClickOutside(nav, () => {
  forceOpenNav.value = false
})
onClickOutside(profile, () => {
  openProfile.value = false
})

const handleVerify = async () => {
  await userStore.verify().then(() => {
    appNavs.value = [
      {
        category: 'การจัดการระบบ',
        title: 'ภาพรวมและรายงาน',
        icon: 'Overview',
        path: '/overview',
      },
      {
        title: 'ข้อมูลสมาชิก',
        icon: 'Customer',
        path: '/customer',
      },
      {
        title: 'ตรวจเช็คการชำระเงิน',
        icon: 'Card',
        path: '/payment',
      },
      {
        title: 'จัดการแพ็กเกจ',
        icon: 'Gift',
        path: '/package',
      },
      {
        title: 'ผู้ดูแลระบบ',
        icon: 'User',
        path: '/admin',
      },
    ]
  })
}

const toggleDarkMode = () => {
  localStorage.setItem(
    'wlove_theme',
    localStorage.getItem('wlove_theme') === 'dark' ? 'light' : 'dark',
  )
  const isDarkMode = localStorage.getItem('wlove_theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDarkMode)
  document.documentElement.classList.toggle('light', !isDarkMode)
}

const toggleNav = () => {
  if (isSmallScreen.value) {
    forceOpenNav.value = !forceOpenNav.value
  } else {
    forceHideNav.value = !forceHideNav.value
  }
}

watch([forceOpenNav, forceHideNav], () => {
  if (isSmallScreen.value && forceOpenNav.value && !forceHideNav.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Reset forceHideNav when screen becomes small
const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 1024
  if (isSmallScreen.value && forceHideNav.value) {
    forceHideNav.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(route, async () => {
  if (route.path === '/login') return
  await handleVerify()
  date.value = moment().format('DD-MM-YYYY')
  time.value = moment().format('HH:mm')

  forceOpenNav.value = false
  isLoading.value = false
  renderCount.value++
})

watch(
  () => route.meta.pages,
  () => {
    renderCount.value++
  },
  { deep: true },
)

onMounted(() => {
  const isDarkMode = localStorage.getItem('wlove_theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDarkMode)
  document.documentElement.classList.toggle('light', !isDarkMode)
})
</script>

<template>
  <div v-if="isEnv">
    <div v-if="route.path !== '/login'" class="flex overflow-hidden">
      <!-- <div v-if="forceOpenNav" class="fixed left-0 top-0 z-10 h-screen w-screen bg-black/20"></div> -->
      <nav
        ref="nav relative"
        class="fixed left-0 top-0 z-60 flex h-screen w-[280px] flex-col border-r border-grey-highlight dark:border-neutral-700 bg-[#0F182A] dark:bg-neutral-900 transition-all max-[1024px]:w-full max-[1024px]:-left-full"
        :class="[{ '!left-0': forceOpenNav }, { '!-left-[280px] ': forceHideNav }]"
      >
        <div
          class="absolute top-[31px] right-[-20px] w-[40px] h-[40px] z-51 bg-[#FFFFFF] rounded-full cursor-pointer max-[1024px]:right-[-50px]"
          @click="toggleNav"
          :class="[
            {
              'right-[-20px] rotate-0': !forceHideNav,
              'right-[-50px] rotate-180 max-[1024px]:!right-[-20px] max-[1024px]:rotate-0':
                forceHideNav,
            },
            { 'max-[1024px]:rotate-180': !forceHideNav },
          ]"
        >
          <div class="w-full h-full flex items-center justify-center relative">
            <div class="absolute inset-0 border-1 border-[#E6E6E6] rounded-full"></div>
            <div
              class="absolute inset-0 left-[21px] bg-[#FFFFFF] w-[21px] h-full"
              :class="{ 'left-[24px]': forceHideNav || isSmallScreen }"
            ></div>
            <IconCircleArrowLeft class="z-2" />
          </div>
        </div>

        <div class="flex p-[30px]">
          <img src="/src/assets/images/logo-main.svg" class="w-[190px]" />
        </div>

        <!-- <hr class="border-grey-highlight dark:border-neutral-700" /> -->
        <div class="overflow-y-auto overflow-x-hidden max-[1024px]:h-[calc(100vh-194px)]">
          <div v-for="app in appNavs" :key="app.title">
            <!-- <hr class="border-grey-highlight dark:border-neutral-700" /> -->
            <baseNavNode :id="renderCount" :data="app" :path="app.path" />
          </div>
        </div>
      </nav>

      <div
        class="flex-grow transition-all max-lg:pl-0 lg:pl-[280px] w-screen"
        :class="[{ '!pl-0': forceHideNav }]"
      >
        <div class="sticky top-0 p-[20px] pl-[25px] pb-[10px] pb-0 bg-[#FFFFFF] z-56">
          <div
            class="flex w-full z-10 items-center justify-between border border-grey-highlight dark:border-neutral-700 bg-white dark:bg-neutral-900 p-[10px] rounded-[8px]"
          >
            <div class="flex items-center gap-[15px]">
              <!-- <button
                class="flex size-[40px] min-w-[40px] items-center justify-center rounded-[6px] bg-primary/10 p-1 text-primary lg:hidden"
                @click="forceOpenNav = !forceOpenNav"
              >
                <iconLayout />
              </button> -->
              <!-- <button
                class="flex size-[40px] min-w-[40px] items-center max-[1024px]:ml-[20px] justify-center rounded-[6px] !bg-grey-highlight dark:!bg-neutral-700 !text-grey p-1 lg:hidden cursor-pointer"
                :class="{ 'ml-[20px]': forceOpenNav }"
                @click="forceOpenNav = !forceOpenNav"
              >
                <iconLayout2 />
              </button> -->
              <div
                v-if="isBackSite"
                class="flex size-[40px] min-w-[40px] items-center max-[1024px]:ml-[20px] justify-center rounded-[6px] !bg-grey-highlight dark:!bg-neutral-700 !text-grey p-1 lg:hidden"
                :class="{ 'ml-[20px]': forceHideNav }"
              >
                <iconLayout2 />
              </div>

              <button
                v-else
                class="flex size-[40px] items-center justify-center rounded-[6px] p-1 text-primary min-lg:hidden border-1 border-[#F3F3F4] hover:bg-[#F3F3F4]"
                :class="{
                  ' ml-[20px]': !forceOpenNav,
                }"
                @click="router.back()"
              >
                <IconArrowLeft1 />
              </button>

              <!-- <button
                class="flex size-[40px] items-center justify-center rounded-[6px] bg-primary/10 dark:bg-neutral-800 p-1 text-primary max-lg:hidden"
                :class="{
                  '!bg-grey-highlight dark:!bg-neutral-700 !text-grey dark:text-grey-highlight':
                    forceHideNav,
                }"
                @click="forceHideNav = !forceHideNav"
              >
                <iconLayout2 />
              </button> -->

              <div
                v-if="isBackSite"
                class="flex size-[40px] items-center justify-center rounded-[6px] p-1 max-lg:hidden !bg-[#F3F3F4] dark:!bg-neutral-700 !text-grey dark:text-grey-highlight"
                :class="{ 'ml-[20px]': forceHideNav }"
              >
                <iconLayout2 />
              </div>

              <button
                v-else
                class="flex size-[40px] items-center justify-center rounded-[6px] p-1 text-primary max-lg:hidden border-1 border-[#F3F3F4] hover:bg-[#F3F3F4]"
                :class="{
                  ' ml-[20px]': forceHideNav,
                }"
                @click="router.back()"
              >
                <IconArrowLeft1 />
              </button>

              <div
                :key="`breadcrumb-${renderCount}-${Array.isArray(route.meta.pages) ? route.meta.pages.join('-') : ''}`"
                class="flex items-center gap-1 text-[15px] font-medium"
              >
                <!-- @vue-ignore -->
                <span
                  v-for="(n, i) in route.meta.pages"
                  :key="n"
                  @click="
                    route.meta.routes[i] &&
                    router.push(route.meta.routes[i].replace('[id]', route.params.id))
                  "
                  class="flex items-center gap-1 text-grey dark:text-grey-highlight"
                  :class="[
                    {
                      'cursor-pointer !text-[#C29F5F]': route.meta.routes[i],
                    },
                  ]"
                >
                  <!-- <iconCaretDown v-if="i > 0" class="-rotate-90" /> -->
                  <span v-if="i > 0"> - </span>
                  {{ n }}
                </span>
              </div>
            </div>
            <div class="flex gap-4 pl-4">
              <!-- <div class="flex items-center gap-3 rounded-full bg-grey-highlight dark:bg-neutral-700 px-4 py-2">
                <iconWindowClock class="text-primary" />
                <p class="text-sm font-medium">
                  <span class="text-primary"> Date : </span>
                  <span class="font-normal">{{ date }} </span> •
                  <span class="text-primary">Time : </span>
                  <span class="font-normal">{{ time }}</span>
                </p>
              </div> -->
              <!-- <button
                class="dark:hover:bg-neutral-700 hover:bg-[#ededed] size-[40px] rounded-[10px] flex items-center justify-center"
                @click="toggleDarkMode">
                <iconDarkMode class="w-[20px] dark:text-white dark:rotate-180 transition-all" />
              </button> -->
              <div class="relative">
                <button
                  class="flex items-center gap-1 rounded-full bg-grey-highlight dark:bg-neutral-700 relative"
                  @click="openProfile = !openProfile"
                >
                  <div
                    class="flex size-[40px] items-center justify-center gap-2 rounded-full bg-primary text-[30px] text-white"
                  >
                    <p class="mb-1.5 font-bold capitalize">
                      {{ userStore.currentUser?.details?.full_name?.[0] || 'U' }}
                    </p>
                  </div>
                  <div
                    class="absolute bottom-0 right-0 size-[15px] bg-[#FFFFFF] rounded-full flex items-center justify-center"
                  >
                    <div class="size-[9px] bg-[#70DE36] rounded-full"></div>
                  </div>
                  <!-- <iconCaretDown class="text-grey" /> -->
                </button>
                <div
                  ref="profile"
                  v-if="openProfile"
                  class="absolute right-0 top-[60px] z-52 flex min-w-[200px] flex-col bg-white dark:bg-neutral-900 border-1 border-[#E7E8E9] rounded-[10px] overflow-hidden min-w-[245px]"
                >
                  <div
                    class="flex items-center justify-start gap-[10px] border-b-1 border-[#E7E8E9] w-full py-[15px] px-[20px]"
                  >
                    <div
                      class="flex size-[40px] items-center justify-center gap-2 rounded-full bg-primary text-[30px] text-white relative"
                    >
                      <p class="mb-1.5 font-bold capitalize">
                        {{ userStore.currentUser?.details?.full_name?.[0] || 'U' }}
                      </p>
                      <div
                        class="absolute bottom-0 right-0 size-[15px] bg-[#FFFFFF] rounded-full flex items-center justify-center"
                      >
                        <div class="size-[9px] bg-[#70DE36] rounded-full"></div>
                      </div>
                    </div>
                    <div class="leading-none">
                      <p class="text-nowrap text-[16px] font-medium">
                        {{ userStore.currentUser.details?.full_name || 'Unknown' }}
                      </p>
                      <p
                        class="text-nowrap text-base text-grey dark:text-grey-highlight capitalize"
                      >
                        {{ userStore.currentUser.role || 'Unknown' }}
                      </p>
                    </div>
                  </div>
                  <button
                    class="flex items-center w-full gap-[15px] text-base text-[#3B4854] px-[20px] py-[15px] border-b-1 border-[#E7E8E9] hover:bg-[#F3F3F4]"
                    @click="
                      () => {
                        openProfile = false
                        router.push('/admin/' + userStore.currentUser.id)
                      }
                    "
                  >
                    <IconProfile class="w-[20px] text-[#3B4854]" /> โปรไฟล์
                  </button>
                  <button
                    class="flex items-center w-full gap-[15px] text-base text-[#3B4854] px-[20px] py-[15px] hover:bg-[#F3F3F4]"
                    @click="userStore.logout()"
                  >
                    <IconLogout class="w-[20px] text-[#3B4854]" /> ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="p-[20px] pl-[25px] bg-[#ffffff] h-[calc(100vh-92px)] overflow-hidden overflow-y-auto"
        >
          <routerView :key="$route.fullPath" />
        </div>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
  <div v-else>
    <p class="py-16 text-center text-2xl font-bold">Please create .env file first!</p>
  </div>

  <Notivue v-slot="item">
    <NotivueSwipe :item="item">
      <Notification :item="item" />
    </NotivueSwipe>
  </Notivue>
</template>
