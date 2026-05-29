<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Tab {
  label: string
  route?: string | { path: string; query?: Record<string, any> }
}

interface Props {
  tabs: Tab[]
  class?: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()

// แปลง tab.route ให้เป็น fullPath เพื่อเทียบง่าย ๆ
const normalizeRoute = (routeData: Tab['route']): string | null => {
  if (!routeData) return null

  // หากเป็น string เช่น "/evaluation-forms?step=draft"
  if (typeof routeData === 'string') {
    return routeData
  }

  // หากเป็น object เช่น { path: '/evaluation-forms', query:{ step:'draft' }}
  if (typeof routeData === 'object') {
    const url = new URL(routeData.path, window.location.origin)
    if (routeData.query) {
      Object.entries(routeData.query).forEach(([key, val]) => {
        url.searchParams.set(key, String(val))
      })
    }
    return url.pathname + url.search
  }

  return null
}

// ตรวจ active tab
const activeTab = computed(() => {
  const current = route.fullPath

  const index = props.tabs.findIndex((tab) => {
    const tabFull = normalizeRoute(tab.route)
    return tabFull === current
  })

  // ถ้าไม่เจอให้ default เป็น tab แรก (index 0)
  return index >= 0 ? index : 0
})

// เมื่อกด tab
const handleTabClick = (tab: Tab) => {
  if (!tab.route) return

  if (typeof tab.route === 'string') {
    router.push(tab.route)
  } else {
    router.push({
      path: tab.route.path,
      query: tab.route.query,
    })
  }
}
</script>

<template>
  <div class="tab-menu border-b-1 border-[#DBDCDF]" :class="props.class">
    <div class="flex bg-[var(--theme-hr)] rounded-t-[10px] overflow-hidden overflow-x-auto">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="[
          'tab-button px-6 py-4 text-[16px] transition-all duration-200 cursor-pointer whitespace-nowrap',
          activeTab === index ? 'bg-[var(--theme-tab-active)] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--theme-text-table)] border-b-2 border-transparent',
        ]"
        @click="handleTabClick(tab)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>