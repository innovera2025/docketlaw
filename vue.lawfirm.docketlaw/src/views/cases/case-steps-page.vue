<script setup lang="ts">
import { md5 } from 'js-md5'
import { useUserStore } from '@/stores'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'
import moment from 'moment/min/moment-with-locales'
import { usePermissions } from '@/composables/usePermissions'

const { p } = usePermissions()

const route = useRoute()
const router = useRouter()
const data = ref([] as any[])
const openDelete = ref(false)
const deleteStepId = ref<number | null>(null)
const package_data = ref({} as any)

const openForm = ref(false)
const editStepId = ref<number | null>(null)
const form = ref({ name: '', description: '' })
const formErrors = ref({ name: '' })

const openCreate = () => {
  editStepId.value = null
  form.value = { name: '', description: '' }
  formErrors.value = { name: '' }
  openForm.value = true
}

const openEdit = (row: any) => {
  editStepId.value = row.id
  form.value = { name: row.name, description: row.description || '' }
  formErrors.value = { name: '' }
  openForm.value = true
}

const handleSave = async () => {
  if (!package_data.value.current_package || new Date(package_data.value.expire_date) < new Date()) {
    push.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาสมัคร Package ก่อน')
    await router.push('/packages')
    return
  }

  formErrors.value.name = form.value.name.trim() ? '' : 'กรุณากรอกชื่อขั้นตอน'
  if (formErrors.value.name) return
  try {
    const isEdit = editStepId.value !== null
    const payload: Record<string, unknown> = {
      'data[name]': form.value.name,
      'data[description]': form.value.description,
    }
    if (isEdit) {
      payload['id'] = editStepId.value
    } else {
      payload['main_lawyer_id'] = localStorage.getItem('main_lawyer_id')
    }
    const res = await API('specific\\lawfirm\\case_step', isEdit ? 'update' : 'insert', payload)
    if (res?.response_status) {
      push.success({ title: 'สำเร็จ', message: 'บันทึกข้อมูลเรียบร้อยแล้ว' })
      openForm.value = false
      await handleSelect()
    } else {
      push.error({ title: 'ผิดพลาด', message: res?.message || 'ไม่สามารถบันทึกข้อมูลได้' })
    }
  } catch {
    push.error({ title: 'ผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
  }
}

const handleDelete = async () => {
  try {
    const res = await API('specific\\lawfirm\\case_step', 'delete', {
      id: deleteStepId.value,
    })
    if (res?.response_status) {
      push.success({ title: 'สำเร็จ', message: 'ลบข้อมูลเรียบร้อยแล้ว' })
      openDelete.value = false
      deleteStepId.value = null
      await handleSelect()
    } else {
      push.error({ title: 'ผิดพลาด', message: res?.message || 'ไม่สามารถลบข้อมูลได้' })
    }
  } catch {
    push.error({ title: 'ผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
  }
}

const handleSelect = async () => {
  try {
    const res = await API('specific\\lawfirm\\case_step', 'select', {
      main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
    })
    if (res?.response_status) {
      data.value = res.response_data ?? []
    } else {
      push.error({ title: 'ผิดพลาด', message: res?.message || 'ไม่สามารถโหลดข้อมูลได้' })
    }
  } catch {
    push.error({ title: 'ผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
  }
}

const handlePackage = async () => {
  const res = await API('specific\\lawfirm\\lawyer_package', 'getPaymentInfo', {
    main_lawyer_id: Number(localStorage.getItem('main_lawyer_id')),
  })

  if (res?.response_status) {
    package_data.value = res.response_data
  } else {
    push.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + res.response_message)
  }
}


onMounted(async () => {
  await handlePackage()
  await handleSelect()
})
</script>

<template>
  <section class="space-y-4 gap-4">
    <div class="flex gap-4 flex-wrap items-center justify-between px-[20px] pt-[15px]">
      <div>
        <p class="title">จัดการขั้นตอนของคดี</p>
        <p class="subtitle">จัดการขั้นตอนของคดีสำหรับใช้ประกอบข้อมูลคดีภายในระบบ</p>
      </div>

      <div class="flex gap-2">
        <base-button v-if="p.is_add_case_step" class="ml-auto !bg-[#0F182A]" @click="openCreate()"> เพิ่มข้อมูล </base-button>
      </div>
    </div>
    <div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'name',
              field_search: 'name',
              header: 'ชื่อขั้นตอน',
              search: 'text',
              sort: true,
              minWidth: '350px',
            },
            {
              field: 'description',
              field_search: 'description',
              header: 'คำอธิบาย',
              search: 'text',
              sort: true,
              width: '100%',
            },
            {
              field: 'actions',
              header: 'การจัดการ',
              width: '1%',
            },
          ],
        }"
        :data="data"
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @download=""
        @edit=""
        @delete=""
      >
        <!-- <template #cell-data_name="{ row }"></template> -->
        <template #cell-actions="{ row }">
          <div class="flex gap-1 items-center justify-center">
            <base-icon-button-table
              v-if="p.is_edit_case_step"
              iconName="Pencil"
              class="!rounded-full"
              @click="openEdit(row)"
            />
            <base-icon-button-table
              v-if="p.is_delete_case_step"
              iconName="Trash"
              class="!rounded-full"
              @click="
                () => {
                  deleteStepId = row.id
                  openDelete = true
                }
              "
            />
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Create/Edit Modal -->
    <base-modal
      v-if="openForm"
      :open="openForm"
      :title="editStepId ? 'แก้ไขขั้นตอนของคดี' : 'เพิ่มขั้นตอนของคดี'"
      subtitle="จัดการรายละเอียดขั้นตอนของคดีสำหรับใช้ประกอบข้อมูลคดีภายในระบบ"
      variant="black"
      position="center"
      size="lg"
      @close="openForm = false"
    >
      <div class="px-[20px] pb-[20px]">
        <div class="space-y-4 px-1 pt-1">
          <base-text-input
            label="ชื่อขั้นตอน"
            v-model="form.name"
            placeholder="กรอก"
            labelType="vertical"
            required
            :error="formErrors.name"
          />
          <base-textarea
            label="คำอธิบาย"
            v-model="form.description"
            labelType="vertical"
            placeholder="กรอกหากมี"
            :rows="4"
          />
        </div>
        <div class="flex gap-3 mt-[30px]">
          <button
            class="h-[50px] px-[30px] rounded-[6px] text-[16px] font-medium text-white bg-[#0F182A] hover:bg-[#0F182A]/80 transition-all"
            @click="handleSave()"
          >
            บันทึก
          </button>
          <button
            class="h-[50px] px-[28px] rounded-[6px] text-[16px] font-medium text-[#8E9AAB] bg-[#EDEFF1] hover:bg-[#E0E2E5] transition-all"
            @click="openForm = false"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </base-modal>

    <!-- Delete Modal -->
    <base-modal
      v-if="openDelete"
      open
      title="ลบขั้นตอนของคดี"
      subtitle="การลบขั้นตอนของคดีจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบขั้นตอนนี้ออกจากระบบ?"
      action-button
      action-text="ลบ"
      variant="danger"
      :showBody="false"
      @primary="handleDelete()"
      @close="
        () => {
          openDelete = false
          deleteStepId = null
        }
      "
    />
  </section>
</template>
