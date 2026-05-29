<script setup lang="ts">
import { API } from '@/api'
import { push } from 'notivue'
import { ref } from 'vue'

const model = defineModel<string>()

const apiCode = import.meta.env.VITE_API_CODE

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    labelColor?: string
    placeholder?: string
    disabled?: boolean
    labelWidth?: string
    inputWidth?: string
    helper?: string | null
    error?: string | null
    maxlength?: number
    id: string
    type?: 'file' | 'image'
  }>(),
  {
    type: 'file',
    label: undefined,
    required: false,
    placeholder: '',
    disabled: false,
    helper: null,
    error: null,
    inputClass: '',
    maxlength: undefined,
    after: '',
    step: 1,
    labelWidth: '200px',
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uploadImage = async (e: any) => {
  const image = e.target.files[0]
  const code = `${apiCode}_${props.id}_${Date.now()}`
  API('amstx5\\File', 'upload', { file_code: code, file: image }, '')
    .then((res) => {
      model.value = res?.response_data.file.path_external || ''
    })
    .catch((err) => {
      push.error('อัปโหลดไฟล์ไม่สําเร็จ!\n' + err)
    })
  e.value = null
}

const selectImage = () => {
  document.getElementById(props.id)?.click()
}
</script>

<template>
  <div class="flex md:flex-row flex-col mt-2 w-full gap-x-6 gap-2">
    <div v-if="label" class="md:text-end mt-3" :style="`width: ${labelWidth}`">
      <label class="h-[16px] text-nowrap px-1">
        <span v-if="required" class="text-danger">*</span>
        {{ label }}
      </label>
    </div>
    <div class="flex-grow space-y-2" :style="`max-width: ${inputWidth} !important`">
      <div v-if="!model" class="text-[#676A6F] flex items-center gap-4">
        <button
          class="bg-grey-highlight text-nowrap hover:text-primary hover:bg-primary-highlight py-3 px-4 rounded-[10px] flex items-center gap-3 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:hover:text-white"
          :class="{ 'border border-grey-highlightborder-danger': error }"
          @click="selectImage"
        >
          <iconUpload />อัปโหลดไฟล์
        </button>
        <p>ยังไม่มีไฟล์</p>
      </div>
      <div
        v-else
        class="flex items-center gap-2 border border-grey-highlightp-2 border-grey-highlight w-fit rounded-[10px]"
        :style="`max-width: ${inputWidth} !important`"
      >
        <a :href="model" target="_blank" class="text-blue underline truncate max-w-[300px]">
          {{ model }}
        </a>
        <button @click="model = ''">
          <iconX class="min-w-[20px]" />
        </button>
      </div>
      <img :src="model" v-if="model && type === 'image'" class="w-full" />
      <p class="text-[12px] text-danger">{{ error }}</p>
    </div>
  </div>

  <input
    type="file"
    :id="id"
    accept="image/png, image/jpg, image/jpeg, image/gif"
    @change="uploadImage($event)"
    class="fixed -top-96 left-0 opacity-0"
  />
</template>

<style scoped>
input {
  line-height: 2em;
}
</style>
