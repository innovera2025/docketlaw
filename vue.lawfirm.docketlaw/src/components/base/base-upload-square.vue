<script setup lang="ts">
import { API } from '@/api'
import { push } from 'notivue'

const model = defineModel<string>()

const apiCode = import.meta.env.VITE_API_CODE

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    disabled?: boolean
    id: string
    type?: 'file' | 'image'
  }>(),
  {
    type: 'image',
    label: undefined,
    required: false,
    disabled: false,
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uploadImage = async (e: any) => {
  const image = e.target.files[0]
  const code = `${apiCode}_${props.id}_${Date.now()}`
  API('amstx5\\File', 'upload', { file_code: code, file: image }, true)
    .then((res) => {
      model.value = res?.response_data.file.path_external || ''
    })
    .catch((err) => {
      push.error('อัปโหลดไฟล์ไม่สําเร็จ!\n' + err)
    })
  e.value = null
}

const selectImage = () => {
  if (!props.disabled) {
    document.getElementById(props.id)?.click()
  }
}

const removeImage = () => {
  model.value = ''
}
</script>

<template>
  <div class="upload-square-wrapper">
    <label v-if="label" class="upload-square-label">
      <span v-if="required" class="text-danger">*</span>
      {{ label }}
    </label>

    <div
      class="upload-square-box"
      :class="{ 'has-image': model, disabled: disabled }"
      @click="selectImage"
    >
      <div v-if="!model" class="upload-empty">
        <img
          src="@/assets/images/placeholder.png"
          alt="Placeholder"
          class="preview-img placeholder-img"
        />
      </div>

      <div v-else class="upload-image-preview">
        <img :src="model" alt="Preview" class="preview-img" />
        <button v-if="!disabled" class="remove-btn" @click.stop="removeImage" type="button">
          <iconX class="remove-icon" />
        </button>
      </div>
    </div>
  </div>

  <input
    type="file"
    :id="id"
    :disabled="disabled"
    accept="image/png, image/jpg, image/jpeg, image/gif"
    @change="uploadImage($event)"
    class="file-input-hidden"
  />
</template>

<style scoped>
.upload-square-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-square-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.text-danger {
  color: #ef4444;
  margin-right: 4px;
}

.upload-square-box {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.upload-square-box.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-square-box.has-image {
  border-style: solid;
  border-color: #e5e7eb;
  background-color: transparent;
}

.upload-empty {
  width: 100%;
  height: 100%;
}

.upload-image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  opacity: 0.4;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.remove-icon {
  width: 18px;
  height: 18px;
  color: black;
}

.file-input-hidden {
  position: fixed;
  top: -9999px;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
