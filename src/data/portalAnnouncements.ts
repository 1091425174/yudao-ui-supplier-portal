export interface PortalAnnouncement {
  id: number
  title: string
  date: string
  summary?: string
  pinned?: boolean
}

/** 门户公告（静态数据，后续可接管理端发布接口） */
export const portalAnnouncements: PortalAnnouncement[] = [
  {
    id: 1,
    title: '欢迎使用供应商在线竞价门户',
    date: '2026-06-01',
    summary: '供应商可在此查看招标信息、在线报名并参与竞价采购。',
    pinned: true
  },
  {
    id: 2,
    title: '竞价参与须知',
    date: '2026-06-05',
    summary: '请使用采购方分配的账号登录，竞价开始前完成标的报名并通过审核。'
  },
  {
    id: 3,
    title: '系统维护通知',
    date: '2026-06-10',
    summary: '系统将于业务低峰时段进行例行维护，如有异常请联系采购方管理员。'
  }
]
