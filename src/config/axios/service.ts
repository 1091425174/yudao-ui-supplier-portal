import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import qs from 'qs'
import { config } from '@/config/axios/config'
import errorCode from '@/config/axios/errorCode'
import { getAccessToken, getRefreshToken, removeToken, setToken } from '@/utils/auth'

const { result_code, base_url, request_timeout } = config

const ignoreMsgs = ['无效的刷新令牌', '刷新令牌已过期']
export const isRelogin = { show: false }

let requestList: Array<() => void> = []
let isRefreshToken = false
const whiteList = ['/login', '/refresh-token']

const service: AxiosInstance = axios.create({
  baseURL: base_url,
  timeout: request_timeout,
  withCredentials: false,
  paramsSerializer: (params) => qs.stringify(params, { allowDots: true })
})

service.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    let isToken = (cfg.headers || {}).isToken === false
    whiteList.some((v) => {
      if (cfg.url && cfg.url.indexOf(v) > -1) {
        isToken = false
      }
    })
    if (getAccessToken() && !isToken) {
      cfg.headers.Authorization = 'Bearer ' + getAccessToken()
    }
    if (cfg.method?.toUpperCase() === 'GET') {
      cfg.headers['Cache-Control'] = 'no-cache'
      cfg.headers['Pragma'] = 'no-cache'
    }
    return cfg
  },
  (error: AxiosError) => Promise.reject(error)
)

service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    let { data } = response
    const cfg = response.config

    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      if (response.data.type !== 'application/json') {
        return response.data
      }
      data = await new Response(response.data).json()
    }

    const code = data.code || result_code
    const msg = data.msg || errorCode[code as keyof typeof errorCode] || errorCode.default

    if (ignoreMsgs.indexOf(msg) !== -1) {
      return Promise.reject(msg)
    }

    if (code === 401) {
      if (!isRefreshToken) {
        isRefreshToken = true
        if (!getRefreshToken()) {
          return handleAuthorized()
        }
        try {
          const refreshTokenRes = await refreshToken()
          setToken((await refreshTokenRes).data.data)
          cfg.headers!.Authorization = 'Bearer ' + getAccessToken()
          requestList.forEach((cb) => cb())
          requestList = []
          return service(cfg)
        } catch {
          requestList.forEach((cb) => cb())
          return handleAuthorized()
        } finally {
          requestList = []
          isRefreshToken = false
        }
      }
      return new Promise((resolve) => {
        requestList.push(() => {
          cfg.headers!.Authorization = 'Bearer ' + getAccessToken()
          resolve(service(cfg))
        })
      })
    }

    if (code === 500) {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }

    if (code !== 200) {
      if (msg === '无效的刷新令牌') {
        return handleAuthorized()
      }
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }

    return data
  },
  (error: AxiosError) => {
    let message = error.message || '请求失败'
    if (message === 'Network Error') {
      message = '网络异常，请检查网络连接'
    } else if (message.includes('timeout')) {
      message = '请求超时，请稍后重试'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const refreshToken = async () => {
  return axios.post(
    base_url + '/bid/supplier/auth/refresh-token?refreshToken=' + getRefreshToken()
  )
}

const handleAuthorized = () => {
  if (!isRelogin.show) {
    if (window.location.href.includes('login')) {
      return Promise.reject('登录已过期')
    }
    isRelogin.show = true
    ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
      showCancelButton: false,
      closeOnClickModal: false,
      showClose: false,
      closeOnPressEscape: false,
      confirmButtonText: '重新登录',
      type: 'warning'
    }).then(() => {
      removeToken()
      isRelogin.show = false
      window.location.href = '/login'
    })
  }
  return Promise.reject('登录已过期')
}

export { service }
