import request from '@/config/axios'
import type { TokenType, UserLoginVO } from './types'

export const login = (data: UserLoginVO) => {
  return request.post<TokenType>({
    url: '/bid/supplier/auth/login',
    data,
    headers: { isToken: false }
  })
}

export const loginOut = () => {
  return request.post({ url: '/bid/supplier/auth/logout' })
}

export const getInfo = async () => {
  const user = await request.get<any>({ url: '/bid/supplier/auth/get-info' })
  return {
    user: {
      id: user.userId,
      username: user.username,
      nickname: user.nickname || user.username,
      mobile: user.mobile,
      supplierId: user.supplierId
    },
    roles: user.roles || ['supplier'],
    permissions: user.permissions || []
  }
}
