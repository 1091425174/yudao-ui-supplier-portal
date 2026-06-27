import request from '@/config/axios'

export interface Disclosure {
  id: number
  noticeNo?: string
  type?: number
  title?: string
  summary?: string
  content?: string
  publishTime?: string
  publishEndTime?: string
}

export const DISCLOSURE_TYPE_MAP: Record<number, string> = {
  1: '采购公告',
  2: '成交公示',
  3: '流标公示',
  4: '更正公告'
}

export const DisclosureApi = {
  getDisclosurePage: (params: { pageNo?: number; pageSize?: number; title?: string; type?: number }) => {
    return request.get<{ list: Disclosure[]; total: number }>({
      url: '/bid/supplier/disclosure/page',
      params
    })
  },

  getDisclosure: (id: number) => {
    return request.get<Disclosure>({ url: '/bid/supplier/disclosure/get?id=' + id })
  }
}
