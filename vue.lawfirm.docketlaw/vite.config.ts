import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import Component from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/docketlaw/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Component({
      dts: true,
      dirs: ['src/components/**', 'src/stores/**'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
