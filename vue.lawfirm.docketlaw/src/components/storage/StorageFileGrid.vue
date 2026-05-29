<script setup lang="ts">
import IconFolderLarge from '@/components/icons/IconFolderLarge.vue'
import IconFilePdf from '@/components/icons/IconFilePdf.vue'
import IconFilePng from '@/components/icons/IconFilePng.vue'
import IconFileXls from '@/components/icons/IconFileXls.vue'
import IconFileDoc from '@/components/icons/IconFileDoc.vue'
import IconOcrBadge from '@/components/icons/IconOcrBadge.vue'
import IconOtherFile from '@/components/icons/IconOtherFile.vue'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

type ItemType = 'folder' | 'pdf' | 'png' | 'xls' | 'doc' | 'other'

export interface StorageItem {
  id: number
  name: string
  description: string
  type: ItemType
  typeLabel: string
  date: string
  meta: string
  hasOcr: boolean
  ocrText?: string
  username?: string
  fullname?: string
  fileUrl?: string
  caseId?: number
}

defineProps<{
  items: StorageItem[]
}>()

defineEmits<{
  select: [item: StorageItem]
  action: [item: StorageItem]
}>()

const cardTopBg: Record<ItemType, string> = {
  folder: 'bg-[#edeff1]',
  pdf: 'bg-[#ffe3e0]',
  png: 'bg-[#e5f9f8]',
  xls: 'bg-[#ddfaec]',
  doc: 'bg-[#e3f0ff]',
  other: 'bg-[#E0DFE3]',
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[15px]">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex flex-col rounded-[10px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      @click="$emit('select', item)"
    >
      <div
        class="relative h-[100px] flex items-center justify-center"
        :class="cardTopBg[item.type]"
      >
        <IconFolderLarge v-if="item.type === 'folder'" />
        <IconFilePdf v-else-if="item.type === 'pdf'" />
        <IconFilePng v-else-if="item.type === 'png'" />
        <IconFileXls v-else-if="item.type === 'xls'" />
        <IconFileDoc v-else-if="item.type === 'doc'" />
        <IconOtherFile v-else-if="item.type === 'other'" />
        <div v-if="!item.caseId && p.is_delete_document" class="absolute top-[8px] right-[8px]" @click.stop>
          <base-icon-button-table
            iconName="Trash"
            variant="danger"
            @click="$emit('action', item)"
          />
        </div>
      </div>

      <div class="flex-1 bg-[#f3f3f4] rounded-b-[10px] px-[20px] py-[16px]">
        <p class="text-[16px] text-[#3b4854] mb-[4px] truncate">{{ item.name }}</p>
        <p class="text-[15px] text-[#777f87] mb-[8px] truncate">{{ item.description }}</p>
        <div class="flex items-center gap-[8px]">
          <div class="flex items-center gap-[6px] text-[14px] text-[#b2b6bb] min-w-0 flex-wrap">
            <span>{{ item.typeLabel }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block shrink-0"></span>
            <span>{{ item.date }}</span>
            <span class="size-[4px] rounded-full bg-[#b2b6bb] inline-block shrink-0"></span>
            <span>{{ item.meta }}</span>
          </div>
          <span
            v-if="item.hasOcr"
            class="size-[4px] rounded-full bg-[#b2b6bb] inline-block shrink-0"
          ></span>
          <div
            v-if="item.hasOcr"
            class="flex shrink-0 items-center gap-[5px] rounded-full border border-[#beff9b] bg-[#e9fae2] px-[10px] py-[4px]"
          >
            <IconOcrBadge class="text-[#78df42] w-[20px]" />
            <span class="text-[13px] font-semibold text-[#78df42]">OCR</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="items.length === 0"
      class="col-span-full flex items-center justify-center rounded-[10px] border border-dashed border-[#e7e8e9] py-[60px] text-[16px] text-[#8e9aab]"
    >
      ไม่พบไฟล์หรือโฟลเดอร์
    </div>
  </div>
</template>
