import { defineStore } from 'pinia'
import axios from 'axios'
import { md5 } from 'js-md5'
import router from '@/router'
import type { userAdminType } from '@/type/userType'
import { UAParser } from 'ua-parser-js'
import { API } from '@/api'

export const useUserStore = defineStore('useUserStore', {
  state: () => ({
    class: 'amstx5\\User',
    url: import.meta.env.VITE_API_URL,
    api_key: import.meta.env.VITE_API_KEY,
    session_name: import.meta.env.VITE_SESSION_NAME,
    code: import.meta.env.VITE_API_CODE,

    currentUser: <userAdminType>{},
    currentClient: <userAdminType>{},
  }),
  actions: {
    async login(data: { username: string; password: string }) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'login',
            amstx5_api_key: this.api_key,
            username: data.username,
            password: md5(data.password),
            session_name: this.session_name,
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.response_status) {
          const role = response.data.response_data.role
          if (role === 'lawyer' || role === 'employee') {
            localStorage.setItem('lawyer_user_id', response.data.response_data.id)
            localStorage.setItem('lawyer_username', response.data.response_data.username)
            localStorage.setItem('lawyer_hash', response.data.response_data.hash)
          }
        }

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        //do something
      }
    },

    async logout() {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'logout',
            amstx5_api_key: this.api_key,
            session_name: this.session_name,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data.response_status) {
          const parser = new UAParser()
          const result = parser.getResult()
          const browser = result.browser.name || 'Unknown Browser'
          const os = result.os.name || 'Unknown OS'
          const device =
            result.device.model || (result.device.vendor ? `${result.device.vendor} Device` : '')
          const deviceInfo = [browser + ' on ' + os, device].filter(Boolean).join(', ')

          await API('specific\\lawfirm\\timeline', 'insert', {
            name: 'ออกจากระบบ',
            description: deviceInfo || 'ออกจากระบบเรียบร้อย',
            type: 'logout',
          })

          localStorage.removeItem('lawyer_user_id')
          localStorage.removeItem('lawyer_username')
          localStorage.removeItem('lawyer_hash')
          localStorage.removeItem('main_lawyer_id')

          if (!localStorage.getItem('lawyer_user_id')) {
            router.push('/login')
          }
        }

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // do something
      }
    },

    async verify() {
      try {
        if (!localStorage.getItem('lawyer_hash')) {
          router.push('/login?isRedirected=1')
          return
        }
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: 'specific\\lawfirm\\lawyer_user',
            amstx5_function: 'verify',
            amstx5_code: this.code,
            amstx5_api_key: this.api_key,
            // amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            // session_name: this.session_name,
            user_id: localStorage.getItem('lawyer_user_id'),
            username: localStorage.getItem('lawyer_username'),
            hash: localStorage.getItem('lawyer_hash'),
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (!response.data.response_status) {
          localStorage.removeItem('lawyer_user_id')
          localStorage.removeItem('lawyer_username')
          localStorage.removeItem('lawyer_hash')
          localStorage.removeItem('main_lawyer_id')
          router.push({ path: '/login' })
          throw new Error(response.data.response_message)
        } else {
            if (
            !localStorage.getItem('main_lawyer_id') ||
            localStorage.getItem('main_lawyer_id') !== response.data.response_data.main_lawyer_id
          ) {
            localStorage.setItem(
              'main_lawyer_id',
              response.data.response_data.main_lawyer_id || response.data.response_data.id,
            )
          }

          this.currentUser = response.data.response_data
        }

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something
      }
    },

    async select(where: string | object) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'select',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            columns: '*',
            where,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw response.data.response_message

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }D
      }
    },

    async updatePasswordByID(id: number, new_password: string) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'updatePasswordByID',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
            new_password: md5(new_password),
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw response.data.response_message

        if (response.data.response_status) {
          if (id === localStorage.lawyer_user_id) {
            localStorage.setItem('lawyer_user_id', id.toString())
            localStorage.setItem('lawyer_hash', md5(md5(new_password)))
          }
        }

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something
      }
    },

    async getByID(id: number) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'getByID',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw response.data.response_message

        this.currentClient = response.data.response_data

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async deleteByID(id: number) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'deleteByID',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw new Error(response.data.response_message)

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async insert(username: string, password: string, role: string, details: object) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'insert',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            username,
            password: md5(password),
            role,
            session_name: 'lawyer',
            details,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw new Error(response.data.response_message)

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async updateDetailByID(id: number, details: object, is_replace?: number) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'updateDetailByID',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
            details,
            is_replace,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw new Error(response.data.response_message)

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async isUsernameExists(username: string) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'isUsernameExists',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            username: username,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async ban(id: number) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'ban',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw new Error(response.data.response_message)

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },

    async unBan(id: number) {
      try {
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'unBan',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('lawyer_user_id')}|${localStorage.getItem('lawyer_username')}|${localStorage.getItem('lawyer_hash')}`,
            id: id,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw new Error(response.data.response_message)

        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        // Do something }
      }
    },
  },
})
