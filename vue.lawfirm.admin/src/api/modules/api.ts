import axios from 'axios'

const url = import.meta.env.VITE_API_URL
const api_key = import.meta.env.VITE_API_KEY
const defaultCode = import.meta.env.VITE_API_CODE
const session_name = import.meta.env.VITE_SESSION_NAME

const API = async (
  className: string,
  functionName: string,
  data?: object,
  customCode?: string | null,
) => {
  try {
    const response = await axios({
      method: 'post',
      url: url,
      data: {
        amstx5_class: className,
        amstx5_function: functionName,
        amstx5_code: customCode ?? defaultCode,
        amstx5_api_key: api_key,
        // amstx5_auto_session: `${session_name}|${localStorage.getItem('wloves_user_id')}|${localStorage.getItem('wloves_username')}|${localStorage.getItem('wloves_hash')}`,
        ...data,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error(error)
  }
}

export default API
