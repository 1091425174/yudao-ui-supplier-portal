import { createPinia } from 'pinia'
import { defineStore } from 'pinia'
import { getAccessToken, removeToken } from '@/utils/auth'
import { getInfo, loginOut } from '@/api/login'

export interface UserVO {
  id: number
  username?: string
  nickname: string
  mobile?: string
  supplierId?: number
  status?: number
  loginIp?: string
  loginDate?: string
  supplierName?: string
  supplierCode?: string
  supplierStatus?: number
  contactPerson?: string
  contactPhone?: string
}

export const useUserStore = defineStore('supplier-user', {
  state: () => ({
    user: { id: 0, nickname: '' } as UserVO,
    isSetUser: false
  }),
  getters: {
    getUser: (state) => state.user,
    getIsSetUser: (state) => state.isSetUser
  },
  actions: {
    async setUserInfoAction() {
      if (!getAccessToken()) {
        this.resetState()
        return
      }
      const cached = localStorage.getItem('SUPPLIER_USER_INFO')
      let userInfo = cached ? JSON.parse(cached) : null
      try {
        userInfo = await getInfo()
        localStorage.setItem('SUPPLIER_USER_INFO', JSON.stringify(userInfo))
      } catch {
        if (!userInfo) throw new Error('获取用户信息失败')
      }
      this.user = userInfo.user
      this.isSetUser = true
    },
    async loginOutAction() {
      try {
        await loginOut()
      } finally {
        removeToken()
        this.resetState()
      }
    },
    resetState() {
      this.user = { id: 0, nickname: '' }
      this.isSetUser = false
    }
  }
})

const pinia = createPinia()
export { pinia }

export const useUserStoreWithOut = () => useUserStore(pinia)
