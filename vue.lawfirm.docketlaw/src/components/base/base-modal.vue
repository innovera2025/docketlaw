<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconX from '@/components/icons/IconX.vue'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    subtitle?: string
    actionButton?: boolean
    showActionCancel?: boolean
    actionText?: string
    variant?: 'danger' | 'primary' | 'success' | 'warning' | 'blue' | 'black'
    size?: 'sm' | 'md' | 'lg' | '2lg' | 'smm' | 'xl' | 'xxl'
    disabled?: boolean
    actionTextCancel?: string
    titleContainerClass?: string
    position?: 'center' | 'left' | 'right'
    positionAction?: 'center' | 'left' | 'right'
    showBody?: boolean
    bg_transparent?: boolean
  }>(),
  {
    actionTextCancel: 'ยกเลิก',
    variant: 'primary',
    size: 'md',
    titleContainerClass: '',
    position: 'center',
    positionAction: 'left',
    showBody: true,
    bg_transparent: false,
    showActionCancel: true,
  },
)

const Emits = defineEmits(['close', 'primary', 'secondary'])
</script>

<template>
  <div
    v-if="open"
    class="fixed left-0 top-0 z-63 flex h-screen w-screen overflow-auto"
    :class="[
      {
        'justify-center items-start': position === 'center',
        'justify-start items-stretch': position === 'left',
        'justify-end items-stretch': position === 'right',
      },
      { 'bg-black/65': !bg_transparent },
    ]"
    @keydown.esc="Emits('close')"
    @click.self="Emits('close')"
  >
    <div
      class="relative bg-white flex flex-col"
      :class="[
        { 'm-8  rounded-[8px] shadow-lg': position === 'center' },
        { 'h-full w-[400px]': position !== 'center' && size === 'sm' },
        { 'h-full w-[550px]': position !== 'center' && size === 'smm' },
        { 'h-full w-[500px]': position !== 'center' && size === 'md' },
        { 'h-full w-[700px]': position !== 'center' && size === 'lg' },
        { 'h-full w-[800px]': position !== 'center' && size === '2lg' },
        { 'h-full w-[1000px]': position !== 'center' && size === 'xl' },
        { 'h-full w-[1500px]': position !== 'center' && size === 'xxl' },
        { 'w-[400px]': position === 'center' && size === 'sm' },
        { 'w-[550px]': position === 'center' && size === 'smm' },
        { 'w-[500px]': position === 'center' && size === 'md' },
        { 'w-[700px]': position === 'center' && size === 'lg' },
        { 'w-[800px]': position === 'center' && size === '2lg' },
        { 'w-[1000px]': position === 'center' && size === 'xl' },
        { 'w-[1500px]': position === 'center' && size === 'xxl' },
      ]"
      @click.stop=""
    >
      <div
        v-if="position === 'center'"
        @click="Emits('close')"
        class="absolute z-20 right-[-13px] top-[-13px] !text-[#B2B6BB] size-[30px] rounded-[6px] bg-[#FFFFFF] border-1 border-[#E7E8E9] flex items-center justify-center cursor-pointer hover:shadow-sm transition-all"
      >
        <IconX class="size-[10px]" />
      </div>
      <IconX
        v-else
        class="absolute -right-[25px] top-[5px] cursor-pointer text-white transition-all max-[320px]:-right-[10px] max-[320px]:top-[3px]"
        :class="{
          '!text-[#3B4854] z-20 top-[30px] right-[25px]':
            position === 'left' || position === 'right',
        }"
        @click="Emits('close')"
      />

      <div
        v-if="title"
        class="sticky top-0 z-10 bg-white p-5 flex justify-between items-start"
        :class="[
          { 'rounded-[20px]': position === 'center' },
          { 'border-b border-grey-highlight': position !== 'center' },
        ]"
      >
        <div class="flex flex-col">
          <p class="text-[20px] font-semibold">{{ title }}</p>
          <p class="whitespace-pre-line text-[15px]">{{ subtitle }}</p>
        </div>

        <div v-if="position !== 'center' && actionButton" class="flex gap-x-[15px] items-start">
          <button
            v-if="showActionCancel"
            class="h-[50px] w-[85px] rounded-[10px] text-[14px] font-semibold text-grey disabled:cursor-not-allowed disabled:bg-grey-light"
            @click="
              () => {
                Emits('secondary')
                Emits('close')
              }
            "
          >
            {{ actionTextCancel }}
          </button>

          <button
            :class="[
              'h-[50px] px-[30px] rounded-[8px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-grey-light',
              variant === 'danger'
                ? 'bg-danger hover:bg-danger-hover'
                : variant === 'success'
                  ? 'bg-success hover:bg-success/80'
                  : variant === 'warning'
                    ? 'bg-warning hover:bg-warning/80'
                    : variant === 'blue'
                      ? 'bg-blue hover:bg-blue/80'
                      : variant === 'black'
                        ? 'bg-[#0f182a] hover:bg-[#0f182a]/80'
                        : 'bg-primary hover:bg-primary/80',
            ]"
            @click="Emits('primary')"
            :disabled="disabled"
          >
            {{ actionText }}
          </button>
        </div>
      </div>

      <div v-if="showBody" class="flex-1 overflow-y-auto" :class="{ 'px-5 pb-3': actionButton }">
        <slot />
      </div>

      <div
        v-if="position === 'center' && actionButton"
        class="flex gap-x-[15px]"
        :class="[
          { 'p-5': actionButton },
          {
            'justify-center': positionAction === 'center',
            'justify-start': positionAction === 'left',
            'justify-end': positionAction === 'right',
          },
        ]"
      >
        <button
          v-if="actionButton"
          :class="[
            'h-[50px] px-[30px] rounded-[8px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-grey-light',
            variant === 'danger'
              ? 'bg-danger hover:bg-danger-hover'
              : variant === 'success'
                ? 'bg-success hover:bg-success/80'
                : variant === 'warning'
                  ? 'bg-warning hover:bg-warning/80'
                  : variant === 'blue'
                    ? 'bg-blue hover:bg-blue/80'
                    : variant === 'black'
                      ? 'bg-[#0f182a] hover:bg-[#0f182a]/80'
                      : 'bg-primary hover:bg-primary/80',
          ]"
          @click="Emits('primary')"
          :disabled="disabled"
        >
          {{ actionText }}
        </button>

        <button
          v-if="showActionCancel"
          class="h-[50px] w-[85px] rounded-[8px] text-[15px] font-semibold text-grey disabled:cursor-not-allowed disabled:bg-grey-light bg-[#EDEFF1]"
          @click="
            () => {
              Emits('secondary')
              Emits('close')
            }
          "
        >
          {{ actionTextCancel }}
        </button>
      </div>
    </div>
  </div>
</template>
