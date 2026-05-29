<script setup lang="ts">
import IconOcrBadge from '@/components/icons/IconOcrBadge.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconX from '@/components/icons/IconX.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import type { StorageItem } from '@/components/storage/StorageFileGrid.vue'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

defineProps<{
  item: StorageItem | null
  open: boolean
}>()

defineEmits<{
  close: []
  delete: []
}>()
</script>

<template>
  <Teleport to="body ">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open && item" class="fixed inset-0 bg-black/20 z-61" @click="$emit('close')" />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open && item"
        class="fixed inset-y-0 right-0 bg-white shadow-2xl z-62 flex"
        :class="[
          {
            'w-2/3': item.type !== 'folder' && item.hasOcr,
          },
          {
            'min-w-[450px]': item.type === 'folder' && !item.hasOcr,
          },
        ]"
      >
        <!-- รายละเอียดจากการ OCR (files with OCR only) -->
        <div v-if="item.type !== 'folder' && item.hasOcr" class="bg-[#e7e8e9]">
          <div class="bg-white w-full px-[25px] pt-[25px] pb-[15px] border-b border-[#e7e8e9]">
            <p class="text-[20px] text-[#3b4854]">รายละเอียดจากการ OCR</p>
          </div>
          <div class="px-[25px] bg-white">
            <div class="relative py-2">
              <IconSearch class="absolute left-0 top-1/2 -translate-y-1/2 text-[#3b4854]" />
              <input
                type="text"
                placeholder="พิมพ์คำหรือคีย์เวิร์ดที่ต้องการค้นหา..."
                class="w-full pl-[34px] pr-[10px] py-[10px] text-[16px] text-[#3b4854] placeholder:text-[#aeb3b9] outline-none bg-transparent"
              />
            </div>
          </div>

          <div class="border border-[#e7e8e9] m-[25px] p-4 bg-white">
            <p class="text-[15px] text-[#3b4854] leading-relaxed whitespace-pre-wrap">
              {{ item.ocrText || 'ไม่มีข้อมูล OCR' }}
            </p>
          </div>
        </div>
        <div class="w-[450px] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-[25px] py-[20px] shrink-0">
            <p class="text-[22px] text-[#3b4854]">รายละเอียดไฟล์</p>
            <button
              class="flex size-[36px] items-center justify-center rounded-full hover:bg-[#f4f4f4] transition-colors"
              @click="$emit('close')"
            >
              <IconX size="12" class="text-[#3b4854]" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-[25px] py-[20px]">
            <!-- Section header -->
            <p class="text-[20px] text-[#3b4854] mb-[15px]">ข้อมูล</p>

            <!-- ชื่อไฟล์ -->
            <div class="flex items-center justify-between py-[15px] gap-[20px]">
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">ชื่อไฟล์</p>
              <p class="text-[16px] text-[#3b4854] text-left truncate w-full">{{ item.name }}</p>
            </div>

            <!-- ไฟล์ (files only) -->
            <!-- <div
              v-if="item.type !== 'folder'"
              class="flex items-center justify-between py-[15px] gap-[20px]"
            >
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">ไฟล์</p>
              <a href="#" class="text-[16px] text-[#16b1ff] text-left truncate w-full">
                {{ item.name }}
              </a>
            </div> -->

            <!-- ประเภทไฟล์ -->
            <div class="flex items-center justify-between py-[15px] gap-[20px]">
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">ประเภทไฟล์</p>
              <p class="text-[16px] text-[#3b4854] text-left w-full">
                {{ item.typeLabel }}
              </p>
            </div>

            <!-- การ OCR (files only) -->
            <div v-if="item.type !== 'folder'" class="flex items-center py-[15px] gap-[20px]">
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">การ OCR</p>
              <div
                v-if="item.hasOcr"
                class="flex items-center gap-[5px] rounded-full border border-[#beff9b] bg-[#e9fae2] px-[12px] py-[4px]"
              >
                <IconOcrBadge class="text-[#78df42] w-[18px]" />
                <span class="text-[14px] font-bold text-[#78df42]">OCR</span>
              </div>
              <p v-else class="text-[16px] text-[#aeb3b9]">-</p>
            </div>

            <!-- คำอธิบาย -->
            <div class="flex items-center justify-between py-[15px] gap-[20px]">
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">คำอธิบาย</p>
              <p class="text-[16px] text-left w-full text-[#3b4854]">
                {{ item.description || '-' }}
              </p>
            </div>

            <!-- วันที่อัปโหลด -->
            <div class="flex items-start justify-between py-[15px] gap-[20px]">
              <p class="ttext-[16px] text-[#777f87] shrink-0 w-[100px]">วันที่อัปโหลด</p>
              <div class="text-left w-full">
                <p class="text-[16px] text-[#3b4854]">{{ item.date }}</p>
                <p v-if="item.fullname" class="text-[15px] text-[#777f87]">
                  โดย {{ item.fullname }}
                </p>
              </div>
            </div>

            <!-- Download button -->
            <a
              v-if="item.fileUrl && p.is_download_document"
              :href="item.fileUrl.replace(/^http:\/\//, 'https://')"
              :download="item.name"
              target="_blank"
              class="mt-[20px] w-full flex items-center justify-center gap-[10px] rounded-[5px] bg-[#0f182a] py-[14px] text-[16px] font-medium text-white hover:bg-[#0f182a]/80 transition-colors"
            >
              <IconDownload />
              ดาวน์โหลดไฟล์
            </a>
          </div>

          <!-- Delete button (fixed at bottom) -->
          <div v-if="p.is_delete_document" class="px-[25px] py-[20px] shrink-0">
            <button
              class="w-full flex items-center justify-center gap-[10px] rounded-[6px] border border-[#e7e8e9] bg-white py-[13px] text-[16px] text-[#777f87] hover:bg-[#fff0f0] hover:border-[#ffc2b9] hover:text-[#ff725d] transition-colors"
              @click="$emit('delete')"
            >
              <IconTrashV2 />
              ลบไฟล์
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
