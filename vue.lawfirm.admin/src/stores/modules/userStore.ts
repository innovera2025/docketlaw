import { defineStore } from 'pinia'
import axios from 'axios'
import { md5 } from 'js-md5'
import router from '@/router'
import type { userAdminType } from '@/type/userType'

export const useUserStore = defineStore('useUserStore', {
  state: () => ({
    class: 'amstx5\\User',
    url: import.meta.env.VITE_API_URL,
    api_key: import.meta.env.VITE_API_KEY,
    session_name: import.meta.env.VITE_SESSION_NAME,

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

        if (!response.data.response_status) throw response.data.response_message

        if (response.data.response_status) {
          if (response.data.response_data.role === 'admin') {
            localStorage.setItem('wloves_user_id', response.data.response_data.id)
            localStorage.setItem('wloves_username', response.data.response_data.username)
            localStorage.setItem('wloves_hash', response.data.response_data.hash)
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
            session_name: this.session_name,
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw response.data.response_message

        if (response.data.response_status) {
          localStorage.removeItem('wloves_user_id')
          localStorage.removeItem('wloves_username')
          localStorage.removeItem('wloves_hash')
          if (!localStorage.getItem('wloves_user_id')) {
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
        if (!localStorage.getItem('wloves_hash')) {
          router.push('/login?isRedirected=1')
          return
        }
        const response = await axios({
          method: 'post',
          url: this.url,
          data: {
            amstx5_class: this.class,
            amstx5_function: 'verify',
            amstx5_api_key: this.api_key,
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
            session_name: this.session_name,
            user_id: localStorage.getItem('wloves_user_id'),
            username: localStorage.getItem('wloves_username'),
            hash: localStorage.getItem('wloves_hash'),
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (!response.data.response_status) {
          localStorage.removeItem('wloves_user_id')
          localStorage.removeItem('wloves_username')
          localStorage.removeItem('wloves_hash')
          router.push({ path: '/login' })
          throw new Error(response.data.response_message)
        } else {
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
            id: id,
            new_password: md5(new_password),
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response.data.response_status) throw response.data.response_message

        if (response.data.response_status) {
          if (id === localStorage.wloves_user_id) {
            localStorage.setItem('wloves_user_id', id.toString())
            localStorage.setItem('wloves_hash', md5(md5(new_password)))
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
            username,
            password: md5(password),
            role,
            session_name: 'ccm_wloves',
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
            amstx5_auto_session: `${this.session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
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
