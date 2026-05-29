<script setup lang="ts">
import * as XLSX from 'xlsx'

const props = withDefaults(
  defineProps<{
    data: any
    fileName?: string
  }>(),
  {
    data: [
      {
        name: 'data1',
        value: '1',
      },
      {
        name: 'data2',
        value: '2',
      },
    ],
    fileName: 'data',
  },
)

const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(props.data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, props.fileName)
  XLSX.writeFile(workbook, `${props.fileName}.csv`, { compression: true })
}
</script>

<template>
  <button @click="exportExcel()"><slot /></button>
</template>
