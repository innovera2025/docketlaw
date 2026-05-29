<script setup lang="ts">
import { md5 } from 'js-md5'
import BaseDataTable from '@/components/base/base-data-table.vue'
import BaseIconButtontable from '@/components/base/base-icon-button-table.vue'
import BaseModal from '@/components/base/base-modal.vue'
import { useUserStore } from '@/stores'
import type { userAdminType } from '@/type/userType'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { push } from 'notivue'
import { API } from '@/api'

const route = useRoute()
const router = useRouter()

const data = ref([] as any[])
const openDelete = ref(false)
const openAddModal = ref(false)
const deleteUserId = ref<number | null>(null)

const formData = ref({
  full_name: '',
  email: '',
  tel: '',
  position: '',
  remark: '',
  is_login: 1,
  username: '',
  password: '',
})

const formDataErrors = ref({} as any)

const closeAddModal = () => {
  openAddModal.value = false
  // Reset form
  formData.value = {
    full_name: '',
    email: '',
    tel: '',
    position: '',
    remark: '',
    is_login: 1,
    username: '',
    password: '',
  }
  // Reset errors
  formDataErrors.value = {}
}

const handleCheckUser = async (username: string) => {
  const res = await API(
    'amstx5\\User',
    'isUsernameExists',
    {
      username: username,
    },
    '',
  )
  return res.response_data
}

const handleInsert = async () => {
  // Reset errors
  formDataErrors.value = {}
  const is_error = ref(false)

  // Validate
  if (formData.value.is_login === 1) {
    if (!formData.value.full_name) {
      formDataErrors.value.full_name = 'กรุณากรอกชื่อ'
      is_error.value = true
    }
  }

  if (!formData.value.username) {
    formDataErrors.value.username = 'กรุณากรอกบัญชีผู้ใช้'
    is_error.value = true
  }

  if (formData.value.username) {
    // Check username exists
    const usernameCheck = await handleCheckUser(formData.value.username)
    if (usernameCheck) {
      push.error('บัญชีผู้ใช้ / Username นี้ถูกใช้ไปแล้ว!')
      is_error.value = true
    }
  }

  if (!formData.value.password) {
    formDataErrors.value.password = 'กรุณากรอกรหัสผ่าน'
    is_error.value = true
  } else if (formData.value.password.length < 8) {
    formDataErrors.value.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
    is_error.value = true
  } else if (!/[A-Z]/.test(formData.value.password)) {
    formDataErrors.value.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    is_error.value = true
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.value.password)) {
    formDataErrors.value.password = 'รหัสผ่านต้องมีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว'
    is_error.value = true
  }

  if (is_error.value) {
    return
  }

  // Insert user
  const res = await API(
    'amstx5\\User',
    'insert',
    {
      username: formData.value.username,
      password: md5(formData.value.password),
      role: 'admin',
      session_name: '',
      details: {
        full_name: formData.value.full_name,
        email: formData.value.email,
        tel: formData.value.tel,
        position: formData.value.position,
        remark: formData.value.remark,
      },
    },
    '',
  )

  if (res.response_status) {
    if (formData.value.is_login === 0) {
      await API('amstx5\\User', 'ban', { id: res.response_data }, '')
    }

    push.success('เพิ่มผู้ใช้งานระบบสําเร็จ!')
    // Reload data
    router.push('/admin/' + res.response_data)
    await handleSelect()
    closeAddModal()
  } else {
    push.error('เพิ่มผู้ใช้งานระบบไม่สําเร็จ!\n' + res.response_message)
    return
  }
}

const handleDelete = async () => {
  if (!deleteUserId.value) return

  const res = await API(
    'amstx5\\User',
    'deleteByID',
    {
      id: deleteUserId.value,
    },
    '',
  )

  if (res.response_status) {
    push.success('ลบผู้ใช้สำเร็จ!')
    openDelete.value = false
    deleteUserId.value = null
    // Reload data
    await handleSelect()
  } else {
    push.error('ลบผู้ใช้ไม่สำเร็จ!\n' + res.response_message)
    return
  }
}

const handleSelect = async () => {
  const res = await API(
    'amstx5\\User',
    'select',
    {
      columns: '*',
      where: {
        role: 'admin',
      },
    },
    '',
  )

  if (res.response_status) {
    data.value = res.response_data
  } else {
    push.error('โหลดข้อมูลไม่สำเร็จ!\n' + res.response_message)
  }
}

onMounted(async () => {
  await handleSelect()
})
</script>

<template>
  <section class="space-y-4 gap-4">
    <div class="flex gap-4 flex-wrap items-center justify-between px-[20px] pt-[15px]">
      <div>
        <p class="title">ผู้ดูแลระบบ</p>
        <p class="subtitle">จัดการข้อมูลผู้ดูแลระบบและสิทธิการใช้งานระบบ</p>
      </div>

      <div class="flex gap-2">
        <base-button class="ml-auto !bg-[#0F182A]" @click="openAddModal = true">
          เพิ่มข้อมูล
        </base-button>
      </div>
    </div>
    <div>
      <BaseDataTable
        :table="{
          columns: [
            {
              field: 'data_name',
              field_search: 'data_name',
              header: 'ชื่อข้อมูล',
              search: 'text',
              sort: true,
              width: '200px',
            },
            {
              field: 'is_ban',
              field_search: 'is_ban',
              header: 'สิทธิการเข้าสู่ระบบ',
              search: 'select',
              sort: true,
              options: [
                { value: '0', name: 'Active' },
                { value: '1', name: 'Inactive' },
              ],
            },
            {
              field: 'email',
              field_search: 'email',
              header: 'อีเมล',
              search: 'text',
              sort: true,
            },
            {
              field: 'tel',
              field_search: 'tel',
              header: 'เบอร์โทรศัพท์',
              search: 'text',
              sort: true,
            },
            {
              field: 'remark',
              field_search: 'remark',
              header: 'หมายเหตุ',
              search: 'text',
              sort: true,
            },
            {
              field: 'actions',
              header: 'การจัดการ',
              width: '1%',
            },
          ],
        }"
        :data="
          data.map((item) => {
            return {
              ...item,
              id: item.id,
              data_name:
                item.details?.full_name +
                  ', ' +
                  item.role.charAt(0).toUpperCase() +
                  item.role.slice(1) || '-',
              full_name: item.details?.full_name || '-',
              role: item.role.charAt(0).toUpperCase() + item.role.slice(1),
              email: item.details?.email || '-',
              tel: item.details?.tel || '',
              remark: item.details?.remark || '-',
              username: item.username,
            }
          })
        "
        :rowClass="'even:!bg-[#fff] hover:bg-[#f8f8f8]'"
        @download=""
        @edit=""
        @delete=""
      >
        <template #cell-data_name="{ row }">
          <div class="flex items-center gap-[10px]">
            <div
              class="size-[40px] min-w-[40px] rounded-full overflow-hidden bg-primary flex items-center justify-center"
            >
              <img v-if="row.details?.image" :src="row.details?.image" alt="" />
              <p v-else class="mb-1 text-[25px] font-bold capitalize text-white">
                {{ row.full_name[0] || 'U' }}
              </p>
            </div>
            <div class="">
              <div class="text-[16px]">{{ row.full_name }}</div>
              <div class="text-[14px] text-[#777F87]">{{ row.username }}</div>
            </div>
          </div>
        </template>
        <template #cell-is_ban="{ row }">
          <div
            class="py-[8px] px-[15px] w-fit rounded-[6px] text-[16px] font-regular"
            :class="{
              'bg-[#E9FAE2] text-[#78DF42]': row.is_ban === 0,
              'bg-[#EDEFF1] text-[#8E9AAA]': row.is_ban === 1,
            }"
          >
            {{ row.is_ban === 1 ? 'Inactive' : 'Active' }}
          </div>
        </template>
        <template #cell-email="{ row }">
          <div class="text-[#777F87]">{{ row.email || '-' }}</div>
        </template>
        <template #cell-tel="{ row }">
          <div class="text-[#777F87]">{{ row.tel || '-' }}</div>
        </template>
        <template #cell-remark="{ row }">
          <div class="text-[#777F87]">{{ row.remark || '-' }}</div>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1 items-center justify-center">
            <base-icon-button-table
              iconName="Trash"
              class="!rounded-full"
              @click="
                () => {
                  deleteUserId = row.id
                  openDelete = true
                }
              "
            />
            <base-icon-button-table
              iconName="Share"
              class="!rounded-full"
              @click="router.push(`/admin/${row.id}`)"
            />
            <!-- <baseIconDropdown>
              <div class="px-[20px] text-[#AEB3B9]">กำลังพัฒนา...</div>
              <button
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-[#202125]"
              >
                <IconLock class="w-[20px] h-[20px" />
                <span class="text-[16px]">หยุดใช้งาน</span>
              </button>
            </baseIconDropdown> -->
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Add User Modal -->
    <base-modal
      v-if="openAddModal"
      open
      title="เพิ่มข้อมูลผู้ดูแลระบบ"
      position="right"
      @close="closeAddModal"
    >
      <div class="p-[25px] space-y-6">
        <!-- ข้อมูลส่วนบุคคล -->
        <div class="space-y-4">
          <h3 class="text-[20px] font-normal text-[#1F2937] mb-[20px]">ข้อมูลส่วนบุคคล</h3>

          <base-text-input
            v-model="formData.full_name"
            label="ชื่อ"
            required
            placeholder="กรอก"
            labelType="vertical"
            :error="formDataErrors.full_name"
          />

          <base-text-input
            v-model="formData.email"
            label="อีเมล"
            type="text"
            placeholder="example@email.com"
            labelType="vertical"
          />

          <base-text-input
            v-model="formData.tel"
            label="เบอร์ติดต่อ"
            placeholder="กรอก"
            labelType="vertical"
          />

          <base-text-input
            v-model="formData.position"
            label="ตำแหน่ง"
            placeholder="กรอก"
            labelType="vertical"
          />

          <base-text-input
            v-model="formData.remark"
            label="หมายเหตุ"
            placeholder="กรอก"
            labelType="vertical"
          />
        </div>

        <!-- สิทธิการเข้าใช้งานระบบ -->
        <div class="space-y-4">
          <div>
            <h3 class="text-[20px] font-normal text-[#1F2937]">สิทธิการเข้าใช้งานระบบ</h3>
            <p class="text-[16px] text-[#777F87]">คุณสามารถปรับแต่งสิทธิได้หลังจากบันทึกข้อมูล</p>
          </div>

          <div class="flex items-center gap-[15px]">
            <base-toggle v-model="formData.is_login" class="!m-0" />
            {{ formData.is_login ? 'สามารถเข้าใช้งานระบบได้' : 'ไม่สามารถเข้าใช้งานระบบได้' }}
          </div>

          <base-text-input
            v-model="formData.username"
            label="บัญชีผู้ใช้ / Username"
            placeholder="กรอก"
            labelType="vertical"
            :error="formDataErrors.username"
            required
          />

          <base-text-input
            v-model="formData.password"
            label="รหัสผ่านตั้งต้น"
            type="password"
            placeholder="••••••••"
            labelType="vertical"
            :error="formDataErrors.password"
            required
          />
          <div class="text-[12px] text-[#AEB3B9] mt-[-15px]">
            ความยาวอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ และสัญลักษณ์
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-[15px]">
          <base-button @click="handleInsert" class="px-8 py-3 !bg-[#0F182A]"> บันทึก </base-button>
          <base-button @click="closeAddModal" class="px-8 py-3 !bg-[#EDEFF1] !text-[#8E9AAB]">
            ยกเลิก
          </base-button>
        </div>
      </div>
    </base-modal>

    <!-- Delete Modal -->
    <base-modal
      v-if="openDelete"
      open
      title="ลบผู้ใช้"
      subtitle="การลบผู้ใช้งานระบบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานระบบนี้ออกจากระบบ?"
      action-button
      action-text="ลบ"
      variant="danger"
      :showBody="false"
      @primary="handleDelete()"
      @close="
        () => {
          openDelete = false
          deleteUserId = null
        }
      "
    >
    </base-modal>
  </section>
</template>
