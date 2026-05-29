<script setup lang="ts">
import router from '@/router';
import { ref, computed } from 'vue'

const openNode = ref(true)

const props = withDefaults(
  defineProps<{
    data: {
      category?: string
      title: string
      icon?: string
      path?: string
      children?: {
        name: string
        path: string
        icon?: string
        img?: string
        isShow?: boolean
      }[]
    }
  }>(),
  {},
)

const isActiveParent = computed(() => {
  if (props.data.path) {
    return router.currentRoute.value.path.includes(props.data.path)
  }
  return props.data.children?.some((c) => c.isShow && router.currentRoute.value.path.includes(c.path) ) || false
})

const handleClick = () => {
  if (props.data.path) {
    router.push(props.data.path)
  } else {
    openNode.value = !openNode.value
  }
}

</script>

<template>
  <div v-auto-animate class="overflow-hidden">
    <p v-if="data.category" class="pr-[30px] pt-[20px] pb-[10px] text-[15px] text-[#738399] font-medium flex items-center gap-[13px]">
      <div class="w-[20px] h-[1px] bg-[#738399]"></div>
      {{ data.category }}
    </p>
    <button class="pl-[15px] mb-[5px] flex justify-between items-center w-full" @click="handleClick">
      <div class="flex items-center justify-between w-full px-[15px] py-[10px] rounded-[6px] hover:bg-[#1B2232]" :class="{ '!bg-[#C29F5F]': (!data.path && isActiveParent), 'bg-[#C29F5F] hover:bg-[#C29F5F]': data.path && router.currentRoute.value.path.includes(data.path) }">
        <div class="flex gap-2 items-center text-[#FFFFFF] " :class="[{ '!text-[#0F182A]' : (!data.path && isActiveParent) }, { '!text-[#0F182A]' : data.path && router.currentRoute.value.path.includes(data.path) }]">
          <div class="min-w-[30px] size-[30px] flex items-center justify-center">
            <BaseIcon :name="data.icon" :color="(!data.path && isActiveParent) || (data.path && router.currentRoute.value.path.includes(data.path)) ? '#0F182A' : '#738399'" />
          </div>
          <p>{{ data.title }}</p>
        </div>
        <iconCaretDown v-if="!data.path" class="transition-all" :class="{ '-rotate-180': !openNode, '!text-[#0F182A]' : isActiveParent } " />
      </div>
      <div class="ml-3 !w-[4px] h-[45px] bg-[#0F182A] rounded-l-full" :class="{ '!bg-[#C29F5F]': isActiveParent }"></div>
    </button>
    <div v-if="openNode && data.children?.filter((c) => c.isShow).length">
      <RouterLink v-for="c in data.children?.filter((c) => c.isShow)" :key="c.path" :to="c.path"
        class="" active-class="">
        <div class="px-4">
          <div class="flex gap-2 text-[#FFFFFF] items-center py-[10px] px-[18px] rounded-[6px] hover:bg-[#1B2232]">
            <div class="min-w-[30px] size-[30px] flex items-center justify-center">
              <div class="w-[14px] h-[14px] flex items-center justify-center rounded-full" :class="{ 'bg-[#40341D]': router.currentRoute.value.path.includes(c.path) }">
                <div v-if="router.currentRoute.value.path.includes(c.path)" class="size-[8px] bg-[#C29F5F] rounded-full"></div>
                <div v-else class="size-[5px] bg-[#738399] rounded-full"></div>
              </div>
              <!-- <BaseIcon :name="c.icon" class="opacity-50" /> -->
              <!-- <img v-if="c.img" :src="c.img" class="size-[20px]" /> -->
            </div>
            <p>{{ c.name }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
