const AccessTokenKey = 'SUPPLIER_ACCESS_TOKEN'
const RefreshTokenKey = 'SUPPLIER_REFRESH_TOKEN'

export interface TokenType {
  accessToken: string
  refreshToken: string
}

export const getAccessToken = () => localStorage.getItem(AccessTokenKey) || ''
export const getRefreshToken = () => localStorage.getItem(RefreshTokenKey) || ''

export const setToken = (token: TokenType) => {
  localStorage.setItem(AccessTokenKey, token.accessToken)
  localStorage.setItem(RefreshTokenKey, token.refreshToken)
}

export const removeToken = () => {
  localStorage.removeItem(AccessTokenKey)
  localStorage.removeItem(RefreshTokenKey)
  localStorage.removeItem('SUPPLIER_USER_INFO')
}

export const getWsUrl = () => {
  const base = import.meta.env.VITE_BASE_URL + '/infra/ws'
  return base.replace(/^http/, 'ws') + '?token=' + getRefreshToken()
}
