<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showResult = ref(false)
const fileName = ref('2568index.pdf')
const progress = ref(100)

const handleUpload = () => {
  showResult.value = true
}

const handleCancel = () => {
  showResult.value = false
}

const showSaveDropdown = ref(false)
const saveDropdownBtnRef = ref<HTMLButtonElement | null>(null)
const dropdownTop = ref(0)
const dropdownRight = ref(0)

const toggleSaveDropdown = () => {
  if (!showSaveDropdown.value && saveDropdownBtnRef.value) {
    const rect = saveDropdownBtnRef.value.getBoundingClientRect()
    dropdownTop.value = rect.bottom
    dropdownRight.value = window.innerWidth - rect.right
  }
  showSaveDropdown.value = !showSaveDropdown.value
}

const handleDocumentClick = () => {
  showSaveDropdown.value = false
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))
</script>

<template>
  <div class="px-[20px] pt-[15px] pb-[40px] flex flex-col items-center">
    <!-- Page Header (แสดงตลอด) -->
    <div class="mb-[20px] w-full flex flex-col items-center justify-center">
      <p class="text-[22px] text-[#3b4854] text-center">อ่านข้อมูลจากไฟล์เอกสาร</p>
      <p class="text-[16px] text-[#777f87] text-center">เลือกข้อมูลที่คุณต้องการอ่าน หรือถอดความ</p>
    </div>

    <!-- Action Buttons (แสดงตลอด) -->
    <div class="flex flex-wrap items-center justify-center gap-[12px]">
      <!-- เลือกจากระบบจัดเก็บข้อมูล -->
      <button
        id="ocr-btn-storage"
        class="flex items-center gap-[12px] rounded-[6px] border border-[#e7e8e9] bg-white px-[20px] py-[13px] text-[16px] text-[#777f87] hover:bg-[#f4f4f4] transition-colors"
      >
        <IconOcrFolder class="min-w-[20px] min-h-[20px]" />
        เลือกจากระบบจัดเก็บข้อมูล
      </button>

      <!-- อัปโหลดเอกสาร -->
      <button
        id="ocr-btn-upload"
        class="flex items-center gap-[12px] rounded-[5px] bg-[#0f182a] px-[20px] py-[14px] text-[16px] text-white hover:bg-[#0f182a]/80 transition-colors"
        @click="handleUpload"
      >
        <IconOcrUploadCloud class="min-w-[24px]" />
        อัปโหลดเอกสาร
      </button>
    </div>

    <!-- Placeholder image (ซ่อนหลังอัปโหลด) -->
    <div v-if="!showResult" class="mt-[60px]">
      <img src="@/assets/images/placeholder-ocr.png" alt="Placeholder OCR" />
    </div>

    <!-- ===== Result Section (แสดงหลังอัปโหลด) ===== -->
    <div
      v-if="showResult"
      class="w-full mt-[20px] -mx-[20px] border border-[#e7e8e9] overflow-hidden"
    >
      <!-- Toolbar (white strip) -->
      <div class="flex items-center bg-white border-b border-[#e7e8e9] h-[50px] pl-[20px]">
        <!-- File info -->
        <div class="flex items-center gap-[8px] shrink-0">
          <IconHyperlink class="text-[#777f87] w-[20px] shrink-0" />
          <span class="text-[16px] text-[#777f87]">ไฟล์ที่คุณอัปโหลด :</span>
          <span class="text-[16px] text-[#3b4854]">{{ fileName }}</span>
        </div>

        <!-- Cancel X -->
        <button
          class="ml-[12px] flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#e63946] shrink-0 hover:bg-[#c0303b] transition-colors"
          @click="handleCancel"
        >
          <IconXCircle />
        </button>

        <!-- Divider -->
        <div class="w-px h-full bg-[#e7e8e9] mx-[20px] shrink-0" />

        <!-- Progress -->
        <div class="flex items-center gap-[12px] flex-1 min-w-0 mr-3">
          <span class="text-[16px] text-[#202125] shrink-0">ประมวลผลข้อมูล</span>
          <!-- Striped progress bar -->
          <div class="w-full h-[10px] rounded-full overflow-hidden bg-[#e7e8e9]">
            <div class="h-full rounded-full ocr-progress-bar" :style="{ width: progress + '%' }" />
          </div>
        </div>

        <!-- Percentage -->
        <span class="text-[16px] text-[#3872e1] shrink-0">{{ progress }}%</span>

        <!-- Divider -->
        <div class="w-px h-full bg-[#e7e8e9] ml-[20px] shrink-0" />

        <!-- Save button -->
        <button
          ref="saveDropdownBtnRef"
          id="ocr-save-btn"
          class="flex items-center justify-between gap-[10px] w-[234px] h-[50px] px-[20px] text-[16px] text-[#777f87] hover:text-[#3b4854] transition-colors shrink-0"
          @click.stop="toggleSaveDropdown"
          :class="{ 'bg-[#F3F3F4]': showSaveDropdown }"
        >
          <div class="flex items-center gap-[10px]">
            <IconDownloadDoc class="text-[#777f87] w-[18px]" /> บันทึกเอกสาร
          </div>
          <IconCaretDown
            class="text-[#3b4854] w-[12px] transition-transform"
            :class="{ 'rotate-180': showSaveDropdown }"
          />
        </button>
      </div>

      <!-- Gray background area -->
      <div class="bg-[#e7e8e9] pb-[25px]">
        <!-- Search bar (white strip) -->
        <div
          class="flex items-center bg-white h-[50px] px-[20px] gap-[12px] border-b border-[#e7e8e9]"
        >
          <IconSearch class="text-[#3b4854] w-[20px] shrink-0" />
          <input
            type="text"
            placeholder="พิมพ์คำหรือคีย์เวิร์ดที่ต้องการค้นหา..."
            class="flex-1 text-[16px] text-[#3b4854] placeholder:text-[#aeb3b9] outline-none bg-transparent"
          />
        </div>

        <!-- Content area -->
        <div class="mx-[25px] mt-[25px] bg-white min-h-[600px] p-[20px]">
          <p class="text-[18px] text-[#3b4854] mb-[12px]">บทความ</p>
          <p class="text-[15px] text-[#3b4854] leading-relaxed">
            Lorem Ipsum คือ เนื้อหาจำลองแบบเรียบๆ ที่ใช้กันในธุรกิจงานพิมพ์หรืองานเรียงพิมพ์
            มันได้กลายมาเป็นเนื้อหาจำลองมาตรฐานของธุรกิจตั้งแต่คริสต์ศตวรรษที่ 16
          </p>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showSaveDropdown"
      class="fixed w-[235px] border border-[#e7e8e9] bg-white z-[9999]"
      :style="{ top: dropdownTop + 'px', right: dropdownRight + 'px', boxShadow: '0 10px 30px rgba(0,0,0,0.16)' }"
      @click.stop
    >
      <!-- Section: บันทึกภายในระบบ -->
      <div class="px-[20px] py-[10px]">
        <p class="text-[15px] font-medium text-[#8E9AAB]">บันทึกภายในระบบ</p>
      </div>
      <button
        class="w-full flex items-center justify-between px-[20px] h-[50px] hover:bg-[#f9f9f9] transition-colors"
      >
        <span class="text-[16px] text-[#3b4854]">บันทึกภายในที่จัดเก็บ</span>
        <IconCaretDown class="text-[#3b4854] w-[10px] -rotate-90" />
      </button>

      <!-- Section: ดาวน์โหลด -->
      <div class="px-[20px] py-[10px]">
        <p class="text-[15px] font-medium text-[#8E9AAB]">ดาวน์โหลด</p>
      </div>
      <button
        class="w-full flex items-center justify-between px-[20px] h-[50px] hover:bg-[#f9f9f9] transition-colors"
      >
        <span class="text-[16px] text-[#3b4854]">.PDF</span>
        <div class="flex items-center gap-[8px]">
          <span class="text-[14px] text-[#3b4854]">100KB</span>
        </div>
      </button>
      <button
        class="w-full flex items-center justify-between px-[20px] h-[50px] hover:bg-[#f9f9f9] transition-colors"
      >
        <span class="text-[16px] text-[#3b4854]">.DOC</span>
        <div class="flex items-center gap-[8px]">
          <span class="text-[14px] text-[#3b4854]">50KB</span>
        </div>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ocr-progress-bar {
  background: repeating-linear-gradient(
    -60deg,
    #4eb8f4 0px,
    #4eb8f4 3px,
    #0281f3 3px,
    #0281f3 10px
  );
}
</style>
