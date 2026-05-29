<script setup lang="ts">
const props = defineProps<{
  datetime: string
}>()
</script>

<template>
  <div class="mx-[20px] my-[10px] mb-[10px] relative flex justify-center before:absolute before:content-[''] before:w-full before:h-[1px] before:bg-[#E6E6E6] before:top-1/2">
    <div class="z-2 px-[10px] bg-[#F8FAFF]">
      <div class="bg-[#E6E6E6] text-[12px] text-[#707070] px-[10px] rounded-[100px]">
        {{ datetime }}
      </div>
    </div>
  </div>
</template>
