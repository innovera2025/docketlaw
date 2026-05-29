<script setup lang="ts">
import { ref } from 'vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconNotAllow from '@/components/icons/IconNotAllow.vue'
import IconLock from '@/components/icons/IconLock.vue'

const props = withDefaults(
  defineProps<{
    id: string
    image?: string
    name: string
    time: string
    message: string
    replyTag?: string
    replyMessage?: string
    profile_img_position?: string
    highlighted?: boolean
    userId?: number
    messageId?: number
    is_ban?: number
  }>(),
  {
    image: '',
    replyTag: '',
    replyMessage: '',
    highlighted: false,
    is_ban: 0,
  },
)

const emits = defineEmits<{
  moreClick: []
  replyTag: []
  deleteMessage: [messageId: number]
  kickOutUser: [userId: number]
  blockUser: [userId: number]
  unblockUser: [userId: number]
}>()

const openDeleteMessage = ref(false)
const openKickOut = ref(false)
const openBlock = ref(false)
const openUnblock = ref(false)

const openDeleteMessageModal = () => {
  openDeleteMessage.value = true
}

const openKickOutModal = () => {
  openKickOut.value = true
}

const openBlockModal = () => {
  openBlock.value = true
}

const openUnblockModal = () => {
  openUnblock.value = true
}

const handleDeleteMessage = () => {
  if (props.messageId) {
    emits('deleteMessage', props.messageId)
  }
  openDeleteMessage.value = false
}

const handleKickOut = () => {
  if (props.userId) {
    emits('kickOutUser', props.userId)
  }
  openKickOut.value = false
}

const handleBlock = () => {
  if (props.userId) {
    emits('blockUser', props.userId)
  }
  openBlock.value = false
}

const handleUnblock = () => {
  if (props.userId) {
    emits('unblockUser', props.userId)
  }
  openUnblock.value = false
}
</script>

<template>
  <div
    :id="id"
    class="group px-[20px] cursor-pointer hover:bg-[#EFF3FF] py-[5px]"
    :class="{ 'bg-[#EFF3FF] animate-pulse': highlighted }"
  >
    <!-- message -->
    <div class="flex items-center justify-between gap-[10px] mb-[5px]">
      <div class="flex gap-[10px]">
        <div
          class="bg-[#3455E0] rounded-full size-[40px] min-w-[40px] flex items-center justify-center mt-[4px] overflow-hidden"
        >
          <div class="text-white font-bold text-[25px]">{{ '?' }}</div>
        </div>
        <div class="">
          <div class="text-[16px] text-[#262626] font-medium">
            {{ name }} <span class="text-[12px] text-[#707070]">{{ time }}</span>
          </div>
          <div class="">{{ message }}</div>
        </div>
      </div>
      <base-icon-dropdown icon="ChatMore" buttonClass="!size-[35px] !min-w-[35px] bg-[#ffffff] !p-0 hover:!bg-[#ffffff] hover:shadow-md opacity-0 group-hover:opacity-100 transition-opacity !rounded-[8px] border-1 border-[#E8E8E8]" iconClass="!text-[#7E7E7E]" v-slot="{ closeMenu }">
        <button class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]" @click="openDeleteMessageModal(); closeMenu()">
          <IconTrash class="w-[20px] h-[20px" />
          <span class="text-[16px]">ลบข้อความ</span>
        </button>
        <button class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]" @click="openKickOutModal(); closeMenu()">
          <IconNotAllow class="w-[20px] h-[20px" />
          <span class="text-[16px]">ขับออกจากห้องสนทนา</span>
        </button>

        <button v-if="props.is_ban === 0" class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]" @click="openBlockModal(); closeMenu()">
          <IconLock class="w-[20px] h-[20px" />
          <span class="text-[16px]">ระงับบัญชี</span>
        </button>
        <button v-else class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]" @click="openUnblockModal(); closeMenu()">
          <IconUnLock class="w-[20px] h-[20px" />
          <span class="text-[16px]">เปิดใช้งานบัญชี</span>
        </button>
      </base-icon-dropdown>
    </div>
    <!-- Reply message -->
    <div
      v-if="replyMessage"
      class="ml-[50px] bg-[#E5EAFF] text-[13px] px-[10px] py-[5px] rounded-[13px] rounded-tl-none"
    >
      <span v-if="replyTag" class="text-[#3455E0] cursor-pointer" @click="emits('replyTag')">@{{ replyTag }}</span> {{ replyMessage }}
    </div>
  </div>

  <!-- Modal ลบข้อความ -->
  <base-modal
    v-if="openDeleteMessage"
    open
    title="ลบข้อความ"
    subtitle="คุณต้องการลบข้อความนี้ใช่หรือไม่?"
    action-button
    action-text="ลบข้อความ"
    variant="danger"
    :showBody="false"
    @primary="handleDeleteMessage"
    @close="() => { openDeleteMessage = false }"
  >
  </base-modal>

  <!-- Modal ขับออกจากห้องสนทนา -->
  <base-modal
    v-if="openKickOut"
    open
    title="ขับออกจากห้องสนทนา"
    subtitle="ผู้ใช้จะถูกขับออกจากห้องสนทนานี้"
    action-button
    action-text="ขับออก"
    variant="danger"
    :showBody="false"
    @primary="handleKickOut"
    @close="() => { openKickOut = false }"
  >
  </base-modal>

  <!-- Modal ระงับบัญชี -->
  <base-modal
    v-if="openBlock"
    open
    title="ระงับบัญชี"
    subtitle="ผู้ใช้จะไม่สามารถเข้าใช้งานระบบได้"
    action-button
    action-text="ระงับบัญชี"
    variant="danger"
    :showBody="false"
    @primary="handleBlock"
    @close="() => { openBlock = false }"
  >
  </base-modal>

  <!-- Modal เปิดใช้งานบัญชี -->
  <base-modal
    v-if="openUnblock"
    open
    title="เปิดใช้งานบัญชี"
    subtitle="ผู้ใช้จะสามารถเข้าใช้งานระบบได้"
    action-button
    action-text="เปิดใช้งาน"
    :showBody="false"
    @primary="handleUnblock()"
    @close="
      () => {
        openUnblock = false
      }
    "
  >
  </base-modal>
</template>
