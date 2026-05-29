<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import IconBadgeCheck from '@/components/icons/IconBadgeCheck.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import moment from 'moment/min/moment-with-locales'

moment.locale('th')

const router = useRouter()
const route = useRoute()

const isEditing = ref(false)
const isLoading = ref(false)
const openDeleteModal = ref(false)
const openDeactivateModal = ref(false)

const data = ref<any>({})

const formData = ref({
  name: '',
  type: 'รายเดือน',
  price: '',
  duration: 0,
  storage_size: '',
  storage_unit: 'GB',
  description: '',
  is_active: 1,
  status: 1,
})

const formErrors = ref<any>({})

let skipTypeWatch = false

watch(() => formData.value.type, (type) => {
  if (skipTypeWatch) return
  formData.value.duration = type === 'รายปี' ? 365 : 30
})

const fillForm = (d: any) => {
  skipTypeWatch = true
  formData.value = {
    name: d.name ?? '',
    type: d.type ?? 'รายเดือน',
    price: d.price ?? '',
    duration: d.duration ?? 0,
    storage_size: d.storage_size ?? '',
    storage_unit: d.storage_unit ?? 'GB',
    description: d.description ?? '',
    is_active: d.is_active ?? 1,
    status: d.status ?? 1,
  }
  nextTick(() => { skipTypeWatch = false })
}

const storageInByte = () => {
  const size = +formData.value.storage_size
  if (!size) return 0
  return formData.value.storage_unit === 'TB'
    ? size * 1024 * 1024 * 1024 * 1024
    : size * 1024 * 1024 * 1024
}

const fetchData = async () => {
  isLoading.value = true
  const res = await API(
    'specific\\lawfirm\\admin_package',
    'getByID',
    { id: route.params.id },
    null,
  )
  if (res?.response_status) {
    data.value = res.response_data
    if (isEditing.value) fillForm(res.response_data)
  }
  isLoading.value = false
}

const handleEdit = () => {
  router.push(`/package/${route.params.id}/edit`)
}

const handleCancelEdit = () => {
  router.push(`/package/${route.params.id}`)
  formErrors.value = {}
}

const performUpdate = async () => {
  const res = await API(
    'specific\\lawfirm\\admin_package',
    'update',
    {
      id: data.value.id,
      data: {
        name: formData.value.name,
        type: formData.value.type,
        price: +formData.value.price,
        duration: +formData.value.duration,
        storage_size: +formData.value.storage_size,
        storage_unit: formData.value.storage_unit,
        storage_size_in_byte: storageInByte(),
        description: formData.value.description,
        is_active: formData.value.is_active,
      }
    },
    null,
  )

  if (res?.response_status) {
    push.success('บันทึกข้อมูลสำเร็จ!')
    router.push(`/package/${route.params.id}`)
  } else {
    push.error('บันทึกข้อมูลไม่สำเร็จ!\n' + res?.response_message)
  }
}

const handleUpdate = async () => {
  formErrors.value = {}
  let hasError = false

  if (!formData.value.name) { formErrors.value.name = 'กรุณากรอกชื่อแพ็กเกจ'; hasError = true }
  if (!formData.value.type) { formErrors.value.type = 'กรุณาเลือกประเภทแพ็กเกจ'; hasError = true }
  if (!formData.value.price) { formErrors.value.price = 'กรุณากรอกราคา'; hasError = true }
  if (!formData.value.duration) { formErrors.value.duration = 'กรุณากรอกอายุแพ็กเกจ'; hasError = true }
  if (!formData.value.storage_size) { formErrors.value.storage_size = 'กรุณากรอก Storage'; hasError = true }
  if (!formData.value.storage_unit) { formErrors.value.storage_unit = 'กรุณาเลือกหน่วยของ Storage'; hasError = true }
  if (String(formData.value.is_active) === '' || formData.value.is_active === null) { formErrors.value.is_active = 'กรุณาเลือกสถานะการให้บริการ'; hasError = true }
  if (hasError) return

  if (+data.value.is_active === 1 && formData.value.is_active === 0) {
    openDeactivateModal.value = true
    return
  }

  await performUpdate()
}

const handleToggleService = () => {
  data.value.is_active = data.value.is_active ? 0 : 1
  push.success(data.value.is_active ? 'เปิดให้บริการสำเร็จ!' : 'หยุดให้บริการสำเร็จ!')
}

const handleDelete = async () => {
  const res = await API(
    'specific\\lawfirm\\admin_package',
    'delete',
    { id: data.value.id }
  )
  if (res?.response_status) {
    push.success('ลบแพ็กเกจสำเร็จ!')
    router.push('/package')
  } else {
    push.error('ลบแพ็กเกจไม่สำเร็จ!\n' + res?.response_message)
  }
  openDeleteModal.value = false
}

const formatDate = (date: string) => {
  if (!date || date.startsWith('0000')) return '-'
  return moment(date).format('D MMMM YYYY, HH:mm น.')
}

onMounted(() => {
  if (route.name === 'package-edit') {
    isEditing.value = true
    formErrors.value = {}
  }
  fetchData()
})
</script>

<template>
  <div class="space-y-[20px]">
    <!-- Header -->
    <div>
      <p class="text-[22px] text-[#3B4854]">
        {{ isEditing ? 'แก้ไขรายละเอียดแพ็กเกจ' : 'รายละเอียดแพ็กเกจ' }}
      </p>
      <p class="text-[16px] text-[#777F87]">บันทึกรายละเอียดแพ็กเกจและกำหนดราคาขาย</p>
    </div>

    <div class="flex gap-[20px] items-start max-[1350px]:flex-col">
      <!-- Left section -->
      <section class="flex-1 border border-[#e7e8e9] rounded-[10px] py-[20px] px-[25px] space-y-[20px] max-[1350px]:w-full">
        <h3 class="text-[20px] text-[#3b4854]">รายละเอียดแพ็กเกจ</h3>

        <!-- View mode -->
        <template v-if="!isEditing">
          <div class="space-y-[16px]">
            <!-- ชื่อแพ็กเกจ -->
            <div>
              <p class="text-[15px] text-[#777f87]">ชื่อแพ็กเกจ</p>
              <p class="text-[16px] text-[#3b4854] mt-[4px]">{{ data?.name || '-' }}</p>
            </div>

            <!-- Row: ประเภท | ราคา -->
            <div class="flex gap-[20px] flex-wrap">
              <div class="flex-1 min-w-[160px]">
                <p class="text-[15px] text-[#777f87]">ประเภทแพ็กเกจ</p>
                <p class="text-[16px] text-[#3b4854] mt-[4px]">{{ data?.type || '-' }}</p>
              </div>
              <div class="flex-1 min-w-[160px]">
                <p class="text-[15px] text-[#777f87]">ราคาแพ็กเกจต่อเดือน (บาท)</p>
                <p class="text-[16px] text-[#3b4854] mt-[4px]">
                  {{ data?.price != null ? Number(data.price).toLocaleString('en') : '-' }}
                </p>
              </div>
            </div>

            <!-- Row: อายุ | Storage -->
            <div class="flex gap-[20px] flex-wrap">
              <div class="flex-1 min-w-[160px]">
                <p class="text-[15px] text-[#777f87]">อายุแพ็กเกจ</p>
                <p class="text-[16px] text-[#3b4854] mt-[4px]">
                  {{ data?.duration != null ? `${data.duration} วัน` : '-' }}
                </p>
              </div>
              <div class="flex-1 min-w-[160px]">
                <p class="text-[15px] text-[#777f87]">Storage สูงสุด ที่ได้รับ</p>
                <p class="text-[16px] text-[#3b4854] mt-[4px]">
                  {{ `${(+data.storage_size).toLocaleString('en')} ${data.storage_unit || 'GB'}` }}
                </p>
              </div>
            </div>

            <!-- รายละเอียดเพิ่มเติม -->
            <div>
              <p class="text-[15px] text-[#777f87]">รายละเอียดเพิ่มเติม</p>
              <p class="text-[16px] mt-[4px]" :class="data?.description ? 'text-[#3b4854]' : 'text-[#8e9aab]'">
                {{ data?.description || 'ไม่ได้ระบุ' }}
              </p>
            </div>

            <!-- การให้บริการ -->
            <div>
              <p class="text-[16px] text-[#777f87] mb-[10px]">การให้บริการ</p>
              <span
                class="inline-flex items-center px-[14px] py-[5px] rounded-full text-[15px]"
                :class="data?.is_active ? 'bg-[#def3ff] text-[#16b1ff]' : 'bg-[#EDEFF1] text-[#8E9AAA]'"
              >
                {{ +data?.is_active ? 'เปิดให้บริการ' : 'ไม่เปิดให้บริการ' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Edit mode -->
        <template v-else>
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
            <div class="grid grid-cols-2 gap-[20px]">
              <div class="">
                <base-text-input
                  v-model="formData.price"
                  label="ราคาแพ็กเกจต่อเดือน (บาท)"
                  required
                  placeholder="กรอก"
                  type="number"
                  labelType="vertical"
                  :error="formErrors.price"
                />
              </div>
              <div class="">
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
                >
                  <template #suffix>
                    <span class="text-[#3b4854] px-[10px]">วัน</span>
                  </template>
                </base-text-input>
              </div>
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
                >
                  <template #suffix>
                    <span class="text-[#3b4854] px-[10px]">GB</span>
                  </template>
                </base-text-input>
                <div class="w-[130px]">
                  <base-dropdown-multi-select
                    v-model="formData.storage_unit"
                    :options="[
                      { value: 'GB', name: 'GB' }, 
                      { value: 'TB', name: 'TB' }
                    ]"
                    styleProps="border-radius: 0 6px 6px 0; height: 44px; margin-bottom: -1px; forcused: !border-2 !border-primary"
                  />
                </div>
              </div>
              <p v-if="formErrors.storage_size || formErrors.storage_unit" class="text-[12px] text-danger">{{ formErrors.storage_size || formErrors.storage_unit }}</p>
            </div>
            <base-dropdown-multi-select
              v-model="formData.is_active"
              label="การให้บริการ"
              :options="[
                { value: 0, name: 'ไม่เปิดให้บริการ' }, 
                { value: 1, name: 'เปิดให้บริการ' }
              ]"
              required
              class="mt-2"
              labelType="vertical"
              :error="formErrors.is_active"
            />
          </div>

          <base-textarea
            v-model="formData.description"
            label="รายละเอียดเพิ่มเติม"
            placeholder="รายละเอียด..."
            labelType="vertical"
            :rows="3"
          />
        </template>
      </section>

      <!-- Right section -->
      <section class="w-[450px] max-[1350px]:w-full border border-[#e7e8e9] rounded-[10px] py-[20px] px-[25px] space-y-[15px]">
        <h3 class="text-[20px] text-[#3b4854]">การจัดการ</h3>

        <!-- View mode buttons -->
        <template v-if="!isEditing">
          <base-button
            class="w-full !bg-[#0f182a] hover:!bg-[#1a2740] justify-center"
            @click="handleEdit"
          >
            <IconPencil />
            แก้ไขข้อมูล
          </base-button>

          <!-- <base-button
            class="w-full !bg-[#ff725d] hover:!bg-[#e85c47] justify-center"
            @click="handleToggleService"
          >
            {{ data?.is_active ? 'หยุดให้บริการ' : 'เปิดให้บริการ' }}
          </base-button>
          <div class="bg-[#ffe3e0] border border-[#ffcbcb] rounded-[10px] px-[20px] py-[15px]">
            <p class="text-[15px] text-[#ff725d] leading-[1.8]">
              เมื่อหยุดให้บริการ จะหยุดขาย แพ็กเกจนี้แก่ลูกค้า และลูกค้า<br />
              ที่ต้องการต่ออายุจะไม่สามารถต่ออายุแพ็กเกจนี้ได้อีก<br />
              ปล. ลูกค้าที่ใช้งานแพ็กเกจนี้อยู่ยังสามารถใช้งานต่อได้<br />
              จนหมดอายุแพ็กเกจ
            </p>
          </div> -->

          <button
            class="w-full flex justify-center items-center py-[15px] px-8 rounded-[6px] border border-[#e7e8e9] text-[16px] font-semibold text-[#ff725d] hover:bg-[#fff5f4] transition-colors"
            @click="openDeleteModal = true"
          >
            ลบข้อมูล
          </button>
        </template>

        <!-- Edit mode buttons -->
        <template v-else>
          <base-button
            class="w-full !bg-[#0f182a] hover:!bg-[#1a2740] justify-center"
            @click="handleUpdate"
          >
            <IconBadgeCheck />
            บันทึกข้อมูล
          </base-button>

          <base-button
            class="w-full !bg-[#edeef0] !text-[#8592a3] hover:!bg-[#e0e1e3] justify-center"
            @click="handleCancelEdit"
          >
            ยกเลิก
          </base-button>
        </template>

        <!-- Dashed divider -->
        <div class="border-t border-dashed border-[#e7e8e9] !mt-[20px]"></div>

        <!-- ข้อมูลเพิ่มเติม -->
        <h3 class="text-[20px] text-[#3b4854] !mt-[20px]">ข้อมูลเพิ่มเติม</h3>

        <div class="space-y-[20px]">
          <div v-if="data?.update_date_time && data?.update_date_time !== '0000-00-00 00:00:00' && data?.update_date_time !== data?.insert_date_time " class="flex gap-[10px]">
            <p class="text-[15px] text-[#777f87] min-w-[130px]">การแก้ไขล่าสุด</p>
            <div>
              <p class="text-[16px] text-[#3b4854]">{{ formatDate(data?.update_date_time) }}</p>
              <p v-if="data?.update_username" class="text-[15px] text-[#777f87] mt-[4px]">
                โดย {{ data.update_username }}
              </p>
            </div>
          </div>

          <div class="flex gap-[10px]">
            <p class="text-[15px] text-[#777f87] min-w-[130px]">สร้างเมื่อ</p>
            <div>
              <p class="text-[16px] text-[#3b4854]">{{ formatDate(data?.insert_date_time) }}</p>
              <p v-if="data?.insert_username" class="text-[15px] text-[#777f87] mt-[4px]">
                โดย {{ data.insert_username }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Delete modal -->
    <base-modal
      v-if="openDeleteModal"
      open
      title="ลบแพ็กเกจ"
      subtitle="การลบแพ็กเกจจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจนี้ออกจากระบบ?"
      action-button
      action-text="ลบ"
      variant="danger"
      :showBody="false"
      @primary="handleDelete()"
      @close="openDeleteModal = false"
    />

    <!-- Deactivate confirmation modal -->
    <base-modal
      v-if="openDeactivateModal"
      open
      title="หยุดให้บริการแพ็กเกจ"
      action-button
      action-text="ยืนยัน"
      variant="danger"
      @primary="openDeactivateModal = false; performUpdate()"
      @close="openDeactivateModal = false"
    >
      <div class="bg-[#ffe3e0] border border-[#ffcbcb] rounded-[10px] px-[20px] py-[15px]">
        <p class="text-[15px] text-[#ff725d] leading-[1.8]">
          เมื่อหยุดให้บริการ จะหยุดขาย แพ็กเกจนี้แก่ลูกค้า และลูกค้า<br />
          ที่ต้องการต่ออายุจะไม่สามารถต่ออายุแพ็กเกจนี้ได้อีก<br />
          ปล. ลูกค้าที่ใช้งานแพ็กเกจนี้อยู่ยังสามารถใช้งานต่อได้<br />
          จนหมดอายุแพ็กเกจ
        </p>
      </div>
    </base-modal>
  </div>
</template>
