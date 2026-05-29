<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'

const router = useRouter()

const formData = ref({
  name: '',
  type: 'รายเดือน',
  price: '',
  duration: 30,
  storage_size: '',
  storage_unit: 'GB',
  description: '',
})

watch(() => formData.value.type, (type) => {
  formData.value.duration = type === 'รายปี' ? 365 : 30
})

const storageInByte = () => {
  const size = +formData.value.storage_size
  if (!size) return 0
  return formData.value.storage_unit === 'TB'
    ? size * 1024 * 1024 * 1024 * 1024
    : size * 1024 * 1024 * 1024
}

const formErrors = ref({} as any)

const validate = () => {
  formErrors.value = {}
  let hasError = false
  if (!formData.value.name) { formErrors.value.name = 'กรุณากรอกชื่อแพ็กเกจ'; hasError = true }
  if (!formData.value.type) { formErrors.value.type = 'กรุณาเลือกประเภทแพ็กเกจ'; hasError = true }
  if (!formData.value.price) { formErrors.value.price = 'กรุณากรอกราคา'; hasError = true }
  if (!formData.value.duration) { formErrors.value.duration = 'กรุณากรอกอายุแพ็กเกจ'; hasError = true }
  if (!formData.value.storage_size) { formErrors.value.storage_size = 'กรุณากรอก Storage'; hasError = true }
  if (!formData.value.storage_unit) { formErrors.value.storage_unit = 'กรุณาเลือกหน่วยของ Storage'; hasError = true }
  return !hasError
}

const handleInsert = async () => {
  if (!validate()) return

  const res = await API('specific\\lawfirm\\admin_package', 'insert', {
    data: {
      name: formData.value.name,
      type: formData.value.type,
      price: +formData.value.price,
      duration: +formData.value.duration,
      storage_size: +formData.value.storage_size,
      storage_unit: formData.value.storage_unit,
      storage_size_in_byte: storageInByte(),
      description: formData.value.description,
      is_active: 0,
    }
  })

  if (res.response_status) {
    push.success('เพิ่มแพ็กเกจสำเร็จ!')
    router.push('/package/' + res.response_data)
  } else {
    push.error('เพิ่มแพ็กเกจไม่สำเร็จ!\n' + res.response_message)
  }
}

const handleInsertAndActivate = async () => {
  if (!validate()) return

  const res = await API('specific\\lawfirm\\admin_package', 'insert', {
    data: {
      name: formData.value.name,
      type: formData.value.type,
      price: +formData.value.price,
      duration: +formData.value.duration,
      storage_size: +formData.value.storage_size,
      storage_unit: formData.value.storage_unit,
      storage_size_in_byte: storageInByte(),
      description: formData.value.description,
      is_active: 1,
    }
  })

  if (res.response_status) {
    push.success('เพิ่มแพ็กเกจและเริ่มให้บริการสำเร็จ!')
    router.push('/package/' + res.response_data)
  } else {
    push.error('เพิ่มแพ็กเกจไม่สำเร็จ!\n' + res.response_message)
  }
}
</script>

<template>
  <div class="space-y-[20px]">
    <div>
      <p class="text-[22px] text-[#3B4854]">เพิ่มแพ็กเกจใหม่</p>
      <p class="text-[16px] text-[#777F87]">บันทึกรายละเอียดแพ็กเกจและกำหนดราคาขาย</p>
    </div>

    <div class="flex gap-[20px] items-start max-[1350px]:flex-col">
      <!-- รายละเอียดแพ็กเกจ -->
      <section class="flex-1 py-[20px] px-[25px] space-y-[20px] max-[1350px]:w-full">
        <h3 class="text-[20px] text-[#3b4854]">รายละเอียดแพ็กเกจ</h3>

        <base-text-input
          v-model="formData.name"
          label="ชื่อแพ็กเกจ"
          required
          placeholder="กรอก"
          labelType="vertical"
          :error="formErrors.name"
        />

        <div class="grid grid-cols-2 gap-[40px]">
            <base-dropdown-multi-select
              v-model="formData.type"
              label="ประเภทแพ็กเกจ"
              :options="[
                { value: 'รายเดือน', name: 'รายเดือน' }, 
                { value: 'รายปี', name: 'รายปี' }
              ]"
              required
              class="mt-2"
              labelType="vertical"
              :error="formErrors.type"
            />
          <div class="flex gap-[20px]">
            <base-text-input
              v-model="formData.price"
              label="ราคาแพ็กเกจต่อเดือน (บาท)"
              required
              placeholder="กรอก"
              type="number"
              labelType="vertical"
              :error="formErrors.price"
            />
            <base-text-input
              v-model="formData.duration"
              label="อายุแพ็กเกจ"
              required
              placeholder="กรอก"
              type="number"
              labelType="vertical"
              after="วัน"
              inputClass="pr-[50px]"
              disabled
              :error="formErrors.duration"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-[40px]">
          <div class="">
            <div class="w-full flex items-end">
              <base-text-input
                v-model="formData.storage_size"
                label="Storage สูงสุด ที่ได้รับ"
                required
                placeholder="กรอก"
                type="number"
                labelType="vertical"
                inputClass="!rounded-r-none"
              />
              <div class="w-[130px]">
                <base-dropdown-multi-select
                  v-model="formData.storage_unit"
                  :options="[
                    { value: 'MB', name: 'MB' },
                    { value: 'GB', name: 'GB' },
                    { value: 'TB', name: 'TB' }
                  ]"
                  styleProps="border-radius: 0 6px 6px 0; height: 44px; margin-bottom: -1px; forcused: !border-2 !border-primary"
                />
              </div>
            </div>
            <p v-if="formErrors.storage_size || formErrors.storage_unit" class="text-[12px] text-danger">{{ formErrors.storage_size || formErrors.storage_unit }}</p>
          </div>
        </div>

        <base-textarea
          v-model="formData.description"
          label="รายละเอียดเพิ่มเติม"
          placeholder="รายละเอียด..."
          labelType="vertical"
          :rows="3"
        />
      </section>

      <!-- การจัดการ -->
      <section class="w-[450px] py-[20px] px-[25px] space-y-[15px] max-[1350px]:w-full">
        <h3 class="text-[20px] text-[#3b4854]">การจัดการ</h3>

        <base-button
          class="w-full !bg-[#0f182a] hover:!bg-[#1a2740] justify-center"
          @click="handleInsertAndActivate"
        >
          <IconBadgeCheck />
          บันทึกและเริ่มให้บริการ
        </base-button>

        <base-button
          class="w-full !bg-[#3b4854] hover:!bg-[#2e3a45] justify-center"
          @click="handleInsert"
        >
          บันทึก
        </base-button>

        <base-button
          class="w-full !bg-[#edeef0] !text-[#8592a3] hover:!bg-[#e0e1e3] justify-center"
          @click="router.push('/package')"
        >
          ยกเลิก
        </base-button>
      </section>
    </div>
  </div>
</template>
