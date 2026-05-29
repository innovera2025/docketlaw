<script setup lang="ts">
import { onMounted } from 'vue'

withDefaults(
  defineProps<{
    appNavs: {
      title: string
      child: {
        path: string
        name: string
        iconName: string
        textColor?: string
      }[]
    }[]
    full_name?: string
    email?: string
    pic?: string
    username: string
  }>(),
  {
    full_name: 'Unkown',
    email: 'Unkown',
    pic: '',
    username: 'Unkown',
  },
)

const Emits = defineEmits(['logout'])

onMounted(() => {})
</script>

<template>
  <div class="flex h-screen w-[300px] flex-col justify-between border-r border-grey-light bg-white">
    <nav class="overflow-y-auto overflow-x-hidden pl-0">
      <div class="flex justify-center">
        <img src="../assets/images/logo-icon.vue" class="mb-4 w-[200px]" />
      </div>
      <div v-for="app in appNavs" :key="app.title" class="mb-[20px] text-left">
        <p class="mb-2 text-nowrap pl-[25px] text-grey">{{ app.title }}</p>
        <router-link
          v-for="c in app.child"
          :key="c.path"
          :to="c.path"
          active-class="bg-[#E7F7F6] text-[#3b4854] hover:bg-[#E7F7F6]"
          class="mb-[5px] flex w-full items-center gap-2 py-[10px] pl-[25px] hover:bg-[#E7F7F6] hover:text-[#3b4854]"
          :style="`color: ${c.textColor}`"
        >
          <base-icon :name="c.iconName" />
          <p class="text-[15px]">{{ c.name }}</p>
        </router-link>
      </div>
    </nav>
    <div class="mx-[20px] space-y-2 border-t border-grey-light py-[20px]">
      <p class="text-[14px]">Profile</p>
      <div class="flex items-start gap-3">
        <div
          class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-primary-dark font-bold uppercase text-white"
        >
          {{ full_name[0] ?? 'User' }}
        </div>
        <div class="">
          <p class="w-[200px] capitalize">
            {{ full_name }}
            <!-- Suphanat Panyakom (Suphanat Panyakom)  -->
          </p>
          <p class="text-grey-mid">
            {{ username }}
          </p>
        </div>
        <div class="flex w-full justify-end" style="position: relative; right: 30px">
          <button
            class="rounded-full p-2 hover:bg-danger/10 hover:text-danger"
            @click="Emits('logout')"
          >
            <icon-logout class="text-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scope lang="css">
.nav-button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  border-top-right-radius: 9999px;
  width: 100%;
  padding-left: 25px;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #c7c7c7;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #a5a5a5;
}
</style>
