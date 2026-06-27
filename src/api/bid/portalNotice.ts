import request from '@/config/axios'

export interface PortalNotice {
  id: number
  title?: string
  summary?: string
  content?: string
  pinned?: boolean
  publishTime?: string
  createTime?: string
}

export const PortalNoticeApi = {
  getPortalNoticePage: (params: { pageNo?: number; pageSize?: number; title?: string }) => {
    return request.get<{ list: PortalNotice[]; total: number }>({
      url: '/bid/supplier/portal-notice/page',
      params
    })
  },

  getPortalNotice: (id: number) => {
    return request.get<PortalNotice>({ url: '/bid/supplier/portal-notice/get?id=' + id })
  }
}
