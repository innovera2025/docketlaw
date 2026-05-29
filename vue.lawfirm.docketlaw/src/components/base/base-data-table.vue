<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode } from '@primevue/core/api'
import moment from 'moment/min/moment-with-locales'
import Select from 'primevue/select'

const props = withDefaults(
  defineProps<{
    disableFilterRow?: boolean
    moveOfset?: number
    text_no_data?: string
    table: {
      columns: {
        hide?: boolean
        field?: string
        field_search?: string
        field_sub?: string
        header?: string
        is_hide?: boolean
        text_nowrap?: boolean
        type?: string
        search?:
          | 'text'
          | 'number'
          | 'date'
          | 'date-show-time'
          | 'select'
          | 'status'
          | 'decimal'
          | 'badge'
          | 'color'
          | 'datetime-local'
          | 'date_time'
          | 'time'
          | 'icon_file'
          | 'icon'
          | 'checkbox'
          | 'file'
          | 'dropdown-two-step'
        link?: string
        field_sub_type?:
          | 'text'
          | 'number'
          | 'date'
          | 'date-show-time'
          | 'select'
          | 'status'
          | 'decimal'
          | 'badge'
          | 'link'
          | 'datetime-local'
          | 'datetime'
        options?: {
          name?: string
          value: string | number
          variant?: string
          color?: string
        }[]
        placeholder?: string
        sort?: boolean
        minWidth?: string
        width?: string
        action?: {
          type: 'text' | 'icon' | 'button'
          icon?: string
          label?: string
          name?: string
          variant?: string
        }[]
      }[]
    }
    disabledPagination?: boolean
    tableWidth?: string
    totalRecords?: number
    lastColumn?: boolean
    sortColumn?: boolean
    indexColumn?: boolean
    data: object[]
    resetState?: number
    stateKey?: string
    stateStorage?: 'local' | 'session'
    selectedRowId?: number | string | null
    text_nowrap?: boolean
    rowClass?: string | ((data: any, options: any) => string)
    checkboxSelection?: boolean
    selectedRows?: any[]
  }>(),
  {
    table: () => ({ columns: [] }),
    totalRecords: 0,
    lastColumn: false,
    sortColumn: false,
    disableFilterRow: false,
    disabledPagination: false,
    text_no_data: 'ไม่พบข้อมูล',
    text_nowrap: false,
    tableWidth: 'min-width: 50rem',
    data: () => [],
    checkboxSelection: false,
    selectedRows: () => [],
  },
)

const dt = ref(null)

const pagination = defineModel<{
  page: number
  size: number
  sort: { [key: string]: 'ASC' | 'DESC' } | null
  search: { [key: string]: string } | null
}>({
  default: {
    page: 0,
    size: 10,
    sort: {},
    search: {},
  },
})

const filters = ref<{
  [key: string]: {
    value: string | null
    matchMode: any
  }
}>({})

const isLoading = ref(true)
const isInit = ref(false)

// Check if any column has field_search
const hasFieldSearch = computed(() => {
  return props.table.columns.some((column) => column.field_search)
})

// Check if any column has both search and field_search
const hasSearchableColumn = computed(() => {
  return props.table.columns.some((column) => column.search && column.field_search)
})

const emits = defineEmits([
  'pagination',
  'rowClick',
  'lastClick',
  'update:selectedRows',
  'moveUp',
  'moveDown',
])

const handleLastColumnClick = (payload: { data: any; index: number }) => {
  // Emit both lastClick and rowClick events
  emits('lastClick', payload)
  emits('rowClick', payload)
}

// Checkbox selection functions
const isRowSelected = (rowData: any) => {
  return props.selectedRows?.some((row: any) => row.id === rowData.id) || false
}

const isAllSelected = () => {
  if (!props.data.length) return false
  return props.data.every((row: any) => isRowSelected(row))
}

const isIndeterminate = () => {
  const selectedCount = props.data.filter((row: any) => isRowSelected(row)).length
  return selectedCount > 0 && selectedCount < props.data.length
}

const toggleRowSelection = (rowData: any) => {
  let newSelectedRows = [...(props.selectedRows || [])]

  if (isRowSelected(rowData)) {
    newSelectedRows = newSelectedRows.filter((row: any) => row.id !== rowData.id)
  } else {
    newSelectedRows.push(rowData)
  }

  emits('update:selectedRows', newSelectedRows)
}

const toggleAllSelection = () => {
  let newSelectedRows = [...(props.selectedRows || [])]

  if (isAllSelected()) {
    // Remove all current page items from selection
    const currentPageIds = props.data.map((row: any) => row.id)
    newSelectedRows = newSelectedRows.filter((row: any) => !currentPageIds.includes(row.id))
  } else {
    // Add all current page items to selection
    props.data.forEach((row: any) => {
      if (!isRowSelected(row)) {
        newSelectedRows.push(row)
      }
    })
  }

  emits('update:selectedRows', newSelectedRows)
}

onMounted(() => {
  props.table.columns.forEach((column) => {
    if (column.search === 'select' || column.search === 'status' || column.search === 'badge') {
      filters.value[column.field_search || column.field || ''] = {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      }
    } else {
      filters.value[column.field_search || column.field || ''] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      }
    }
  })
  isLoading.value = false
})

watch(
  () => props.resetState,
  () => {
    // reset filters
    filters.value = {}
    props.table.columns.forEach((column) => {
      if (column.search === 'select' || column.search === 'status' || column.search === 'badge') {
        filters.value[column.field_search || column.field || ''] = {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        }
      } else {
        filters.value[column.field_search || column.field || ''] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        }
      }
    })
  },
)
</script>

<template>
  <div class="overflow-x-auto">
    <DataTable
      ref="dt"
      v-if="!isLoading"
      :lazy="!!totalRecords"
      :value="data"
      :total-records="totalRecords"
      :tableStyle="tableWidth"
      scrollable
      removableSort
      v-model:filters="filters"
      :filterDisplay="props.disableFilterRow || !hasFieldSearch ? 'none' : 'row'"
      :paginator="!disabledPagination"
      paginatorPosition="bottom"
      paginatorTemplate="CurrentPageReport RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      :rows="pagination.size"
      :stateKey="stateKey || undefined"
      :stateStorage="stateKey ? (stateStorage === 'session' ? 'session' : 'local') : undefined"
      currentPageReportTemplate="แสดงผล {first} ถึง {last} จาก {totalRecords} รายการ&nbsp;&nbsp;&nbsp;"
      :rowsPerPageOptions="[10, 20, 50]"
      :pt="{
        root: 'text-grey',
        bodyRow: (options: any) => {
          if ($slots.row) return ''
          const isSelected = selectedRowId && options.data && options.data.id === selectedRowId

          let customClass = ''
          if (props.rowClass) {
            if (typeof props.rowClass === 'string') {
              customClass = props.rowClass
            } else if (typeof props.rowClass === 'function') {
              customClass = props.rowClass(options.data, options)
            }
          }

          // ถ้ามี customClass ให้ใช้แค่ customClass + cursor-pointer
          if (customClass) {
            return `${customClass}`.trim()
          }

          const baseClasses = isSelected
            ? 'align-top hover:!bg-[#f8f8f8] !bg-blue-100 border-blue-300 '
            : 'even:!bg-[#f8f8f8] align-top hover:!bg-[#f8f8f8] '

          return baseClasses
        },
      }"
      @row-click="(e) => emits('rowClick', { data: e.data, index: e.index })"
      @sort="
        (e) => {
          if (isInit) {
            pagination.sort = {}
            if (e.sortField)
              pagination.sort[e.sortField.toString()] = e.sortOrder === -1 ? 'DESC' : 'ASC'
            emits('pagination', pagination)
          }
        }
      "
      @update:filters="
        (e) => {
          if (isInit) {
            pagination.search = {}
            Object.entries(e).forEach((r) =>
              // @ts-ignore
              r[1].value ? (pagination.search[r[0]] = r[1].value) : '',
            )
            pagination.page = 0
            emits('pagination', pagination)
          }
        }
      "
      @page="
        (e) => {
          if (isInit) {
            pagination.page = e.page
            pagination.size = e.rows
            emits('pagination', pagination)
          }
        }
      "
      @state-restore="
        (e: any) => {
          const rows = e.rows ?? pagination.size
          const first = e.first ?? 0
          pagination.page = Math.floor(first / rows)
          pagination.size = rows
          emits('pagination', pagination)
          isInit = true
        }
      "
    >
      <template #empty>
        <div class="flex justify-center font-normal text-[#AEB3B9] text-[16px]">
          {{ props.text_no_data }}
        </div>
      </template>

      <Column
        v-if="indexColumn"
        header="No."
        :pt="{
          columnHeaderContent:
            '!border border-grey-highlighttext-[#676A6F] font-medium text-[15px] h-[40px] !px-4 !border-grey-highlight bg-[#f8f8f8]',
          sort: 'ml-auto pl-2',
          headerCell: '!border-0 text-nowrap !p-0',
          bodyCell:
            '!p-2 text-[#3b4854] !border border-grey-highlight !border-t-0 !border-grey-highlight',
          filter:
            '!border border-grey-highlight !border-t-0 !border-grey-highlight bg-[#f8f8f8] h-[40px]',
          filterMenuIcon: '!hidden w-0',
          filterClearIcon: '!hidden w-0',
          pcColumnFilterButton: '!hidden w-0',
        }"
        style="width: 1%"
      >
        <template #body="{ index }">
          <p class="text-center">
            {{ index + 1 }}
          </p>
        </template>
        <template #filter></template>
      </Column>

      <!-- Checkbox Selection Column -->
      <Column
        v-if="checkboxSelection"
        :pt="{
          columnHeaderContent:
            '!border text-[#676A6F] font-medium text-[15px] h-[40px] !px-5 !border-grey-highlight bg-[#f8f8f8]',
          sort: 'ml-auto pl-2',
          headerCell: '!border-0 text-nowrap !p-0',
          bodyCell: '!p-5 text-[#3b4854] !border !border-t-0 !border-grey-highlight text-center',
          filter: '!border !border-t-0 ! border-grey-highlight bg-[#f8f8f8] h-[40px]',
          filterMenuIcon: '!hidden w-0',
          filterClearIcon: '!hidden w-0',
          pcColumnFilterButton: '!hidden w-0',
        }"
        style="width: 3rem"
      >
        <template #header>
          <div class="flex items-center justify-center">
            <base-checkbox :model-value="isAllSelected() ? 1 : 0" @change="toggleAllSelection" />
          </div>
        </template>
        <template #body="{ data }">
          <div class="flex items-center justify-center">
            <base-checkbox
              :model-value="isRowSelected(data) ? 1 : 0"
              @change="toggleRowSelection(data)"
              @click.stop
            />
          </div>
        </template>
        <template #filter></template>
      </Column>

      <!-- Sort Column -->
      <Column
        v-if="sortColumn"
        :pt="{
          columnHeaderContent:
            '!border border-grey-highlighttext-[#676A6F] font-medium text-[15px] h-[40px] !px-4 !border-grey-highlight bg-[#f8f8f8]',
          sort: 'ml-auto pl-2',
          headerCell: '!border-0 text-nowrap !p-0',
          bodyCell: `!p-2 !px-2 text-[#3b4854] !border border-grey-highlight !border-t-0 !border-grey-highlight align-middle`,
          filter:
            '!border border-grey-highlight !border-t-0 !border-grey-highlight bg-[#f8f8f8] h-[40px]',
          filterMenuIcon: '!hidden w-0',
          filterClearIcon: '!hidden w-0',
          pcColumnFilterButton: '!hidden w-0',
        }"
        style="width: 1%"
      >
        <template #header><span class="text-[#676A6F]">ลำดับ</span></template>
        <template #filter></template>
        <template #body="{ index }">
          <div class="flex gap-[5px]" :class="index < data.length - 1 ? 'justify-end' : ''">
            <button v-if="index > 0" @click.stop="emits('moveUp', data[index])">
              <icon-sort-up class="text-neutral-500 hover:text-primary" />
            </button>
            <button
              v-if="index < data.length - 1 && index > (moveOfset || 0) - 1"
              @click.stop="emits('moveDown', data[index])"
            >
              <icon-sort-up class="rotate-180 text-neutral-500 hover:text-primary" />
            </button>
          </div>
        </template>
      </Column>

      <div v-for="(column, index) in table.columns" :key="column.field">
        <Column
          v-if="!column.is_hide"
          :field="column.field_search || column.field"
          :pt="{
            columnHeaderContent:
              index === table.columns.filter((col) => !col.is_hide).length - 1
                ? hasSearchableColumn
                  ? '!border-t !border-r-0 border-r text-[#3B4854] font-medium text-[15px] h-[60px] !px-4 !border-grey-highlight'
                  : '!border-t !border-r-0 border-r !border-b text-[#3B4854] font-medium text-[15px] h-[60px] !px-4 !border-grey-highlight'
                : hasSearchableColumn
                  ? '!border-t border-r text-[#3B4854] font-medium text-[15px] h-[60px] !px-4 !border-grey-highlight'
                  : '!border-t border-r !border-b text-[#3B4854] font-medium text-[15px] h-[60px] !px-4 !border-grey-highlight',
            sort: 'ml-auto pl-2',
            headerCell: '!border-0 text-nowrap !p-0',
            // bodyCell:
            //   column.search === 'number' || column.search === 'decimal'
            //     ? '!p-2 text-[#3b4854] !border !border-t-0 !border-grey-highlight !text-end'
            //     : column.action
            //       ? '!p-2 text-[#3b4854] !border !border-t-0 !border-grey-highlight align-middle'
            //       : '!p-2 text-[#3b4854] !border !border-t-0 !border-grey-highlight',
            bodyCell:
              column.search === 'number' || column.search === 'decimal'
                ? '!text-end'
                : column.action
                  ? 'align-middle'
                  : '',
            filter:
              index === table.columns.filter((col) => !col.is_hide).length - 1
                ? column.search && column.field_search
                  ? '!border-t !border-r-0 border-r !border-b !border-grey-highlight'
                  : '!border-t !border-r-0 border-r !border-b !border-grey-highlight bg-[#f8f8f8] h-[42px]'
                : column.search && column.field_search
                  ? '!border-t border-r !border-b !border-grey-highlight'
                  : '!border-t border-r !border-b !border-grey-highlight bg-[#f8f8f8] h-[42px]',
            filterMenuIcon: '!hidden w-0',
            filterClearIcon: '!hidden w-0',
            pcColumnFilterButton: '!hidden w-0',
          }"
          :sortable="column.sort"
          :style="`min-width: ${column.minWidth}; width: ${column.width};`"
          :class="column.text_nowrap ? 'text-nowrap' : ''"
        >
          <template #header>
            <span v-html="column.header"></span>
          </template>

          <template #body="{ data, index }">
            <!-- Custom slot for specific field -->
            <slot
              v-if="$slots[`cell-${column.field}`]"
              :name="`cell-${column.field}`"
              :row="data"
              :rowIndex="index"
              :value="data[column.field || '']"
              :field="column.field"
            ></slot>

            <!-- Default rendering -->
            <div
              v-else
              :style="`color: ${column.options?.find((o) => o.value === data[column.field || ''])?.color}`"
            >
              <base-status
                v-if="column.options && column.field && column.search === 'status'"
                :variant="
                  column.options.find((o) => o.value === data[column.field || ''])?.variant ||
                  'default'
                "
              >
                {{
                  column.options.find((o) => o.value === data[column.field || ''])?.name ||
                  'Unknown'
                }}
              </base-status>
              <base-badge
                v-else-if="column.options && column.field && column.search === 'badge'"
                :variant="column.options.find((o) => o.value === data[column.field || ''])?.variant"
                class="mx-auto"
              >
                {{ data[column.field] }}
              </base-badge>
              <p v-else-if="column.search === 'number'" class="text-nowrap">
                {{
                  Number((data[column.field || ''] || '0').toString()).toLocaleString('en', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || 0
                }}
              </p>
              <p v-else-if="column.search === 'decimal'" class="text-nowrap">
                {{
                  Number((data[column.field || ''] || '0').toString()).toLocaleString('en', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || 0
                }}
              </p>
              <div v-else-if="column.search === 'color'" class="text-nowrap flex justify-center">
                <div
                  class="h-[20px] w-[20px] rounded-full"
                  :style="`background-color: ${data[column.field || '']}`"
                ></div>
              </div>
              <p
                v-else-if="column.search === 'date'"
                class="text-nowrap"
                :class="{ '!text-grey': !moment(data[column.field || '']).isValid() }"
              >
                {{
                  moment(data[column.field || '']).isValid()
                    ? moment(data[column.field || '']).format('DD.MM.YYYY')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <p
                v-else-if="column.search === 'datetime-local'"
                class="text-nowrap"
                :class="{ '!text-grey': !moment(data[column.field || '']).isValid() }"
              >
                {{
                  moment(data[column.field || '']).isValid()
                    ? moment(data[column.field || '']).format('DD.MM.YYYY, HH:mm')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <p
                v-else-if="column.search === 'date-show-time'"
                class="text-nowrap"
                :class="{ '!text-grey': !moment(data[column.field || '']).isValid() }"
              >
                {{
                  moment(data[column.field || '']).isValid()
                    ? moment(data[column.field || '']).format('DD MMMM YYYY, HH:mm')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <div v-else-if="column.search === 'icon_file'" class="text-nowrap">
                <div v-if="data[column.field || '']" class="flex justify-center">
                  <IconFileCorrect />
                </div>
                <div v-else class="flex justify-center">
                  <IconFileIncorrect />
                </div>
              </div>
              <p v-else-if="column.search === 'text'">
                {{ data[column.field || ''] || '-' }}
              </p>
              <p v-else>{{ data[column.field || ''] }}</p>

              <p
                v-if="column.field_sub_type === 'date'"
                class="text-sm text-nowrap"
                style="color: #676a6f"
              >
                {{
                  data[column.field_sub || ''] && moment(data[column.field_sub || '']).isValid()
                    ? moment(data[column.field_sub || '']).format('DD MMMM YYYY')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <p
                v-if="column.field_sub_type === 'datetime-local'"
                class="text-sm text-nowrap"
                style="color: #676a6f"
              >
                {{
                  data[column.field_sub || ''] && moment(data[column.field_sub || '']).isValid()
                    ? moment(data[column.field_sub || '']).format('DD MMMM YYYY, HH:mm')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <p
                v-if="column.field_sub_type === 'date-show-time'"
                class="text-sm text-nowrap"
                style="color: #676a6f"
              >
                {{
                  data[column.field_sub || ''] && moment(data[column.field_sub || '']).isValid()
                    ? moment(data[column.field_sub || '']).format('DD MMMM YYYY, HH:mm')
                    : 'ไม่ได้ระบุ'
                }}
              </p>
              <p
                v-if="column.field_sub_type === 'number'"
                class="text-sm text-nowrap"
                style="color: #676a6f"
              >
                {{
                  Number((data[column.field_sub || ''] || '0').toString()).toLocaleString('en') || 0
                }}
              </p>
              <p
                v-if="column.field_sub_type === 'decimal'"
                class="text-sm text-nowrap"
                style="color: #676a6f"
              >
                {{
                  Number((data[column.field_sub || ''] || '0').toString()).toLocaleString('en', {
                    minimumFractionDigits: 2,
                  }) || 0
                }}
              </p>

              <RouterLink
                :to="column.link?.toString() || ''"
                v-if="column.field_sub_type === 'link'"
                class="text-sm text-nowrap !text-blue !underline"
                style="color: #676a6f"
              >
                {{ data[column.field_sub || ''] }}
              </RouterLink>
              <p v-if="!column.field_sub_type" class="text-sm" style="color: #676a6f">
                {{ data[column.field_sub || ''] }}
              </p>
              <div v-if="column.action && !column.hide" class="flex gap-1 items-center">
                <!-- @vue-ignore -->
                <div
                  v-for="action in column.action"
                  :key="action.name"
                  @click="$emit(`${action?.name}`, data as any)"
                >
                  <button v-if="action.type === 'text'" class="text-blue underline">
                    {{ action?.label }}
                  </button>
                  <base-icon-button-table
                    v-if="action.type === 'icon'"
                    :iconName="action?.icon"
                    :variant="action?.variant"
                  />
                  <base-button
                    v-if="action.type === 'button'"
                    :iconName="action?.icon"
                    :variant="action?.variant"
                  >
                    <base-icon :name="action?.icon" />
                    {{ action?.label }}
                  </base-button>
                </div>
              </div>
            </div>
          </template>

          <template
            v-if="column.field_search && !props.disableFilterRow"
            #filter="{ filterModel, filterCallback }"
          >
            <input
              v-if="
                column.search === 'text' ||
                column.search === 'date' ||
                column.search === 'number' ||
                column.search === 'color' ||
                column.search === 'datetime-local' ||
                column.search === 'icon_file'
              "
              :type="column.search"
              class="p-2.5 px-4 text-sm text-[#3b4854] outline-none w-full"
              placeholder="Search"
              v-model="filterModel.value"
              @change="filterCallback()"
            />
            <input
              v-else-if="column.search === 'date-show-time'"
              type="date"
              class="p-2.5 px-4 text-sm text-[#3b4854] outline-none w-full"
              placeholder="Search"
              v-model="filterModel.value"
              @change="filterCallback()"
            />
            <input
              v-else-if="column.search === 'decimal'"
              type="number"
              class="p-2.5 px-4 text-sm text-[#3b4854] outline-none w-full"
              placeholder="Search"
              v-model="filterModel.value"
              @change="filterCallback()"
            />

            <base-data-dropdown-multi-select
              v-else-if="
                column.search === 'select' ||
                column.search === 'status' ||
                column.search === 'badge'
              "
              v-model="filterModel.value"
              :options="[
                { value: null, name: column.placeholder || 'All' },
                ...(column.options || []),
              ]"
              class="w-full !border-none !rounded-none !outline-none"
              :style-props="{
                border: 'none !important',
                borderRadius: '0px !important',
                outline: 'none !important',
                background: 'transparent',
                color: '#676a6f',
              }"
              @change="filterCallback"
            />
          </template>
          <template v-else #filter></template>
        </Column>
      </div>
      <Column
        v-if="lastColumn"
        :pt="{
          columnHeaderContent:
            '!border text-[#676A6F] font-medium text-[15px] h-[40px] !px-4 !border-grey-highlight bg-[#f8f8f8]',
          sort: 'ml-auto pl-2',
          headerCell: '!border-0 text-nowrap !p-0',
          bodyCell:
            '!p-0 text-[#3b4854] !border !border-t-0 !border-grey-highlight align-middle w-0',
          filter: '!border !border-t-0 !border-grey-highlight bg-[#f8f8f8] h-[40px]',
          filterMenuIcon: '!hidden w-0',
          filterClearIcon: '!hidden w-0',
          pcColumnFilterButton: '!hidden w-0',
        }"
      >
        <template #body="{ data, index }">
          <div
            class="flex items-center justify-center cursor-pointer select-none flex-1 min-w-[40px] min-h-[40px]"
            role="button"
            tabindex="0"
            aria="เปิดรายการ"
            @click.stop="handleLastColumnClick({ data, index })"
            @keydown.enter.stop="handleLastColumnClick({ data, index })"
            @keydown.space.prevent.stop="handleLastColumnClick({ data, index })"
          >
            <iconCaretRight />
          </div>
        </template>
        <template #filter></template>
      </Column>
    </DataTable>
  </div>
</template>
