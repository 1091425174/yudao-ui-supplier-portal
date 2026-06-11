export interface UserLoginVO {
  username: string
  password: string
}

export interface TokenType {
  accessToken: string
  refreshToken: string
  userId?: number
  expiresTime?: number
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  mobile?: string
  supplierId?: number
}
