/** 竞价室状态文案（与字典 bid_room_status 保持一致） */
const ROOM_STATUS_MAP: Record<number, string> = {
  0: '未开启',
  1: '已开启',
  2: '已结束',
  3: '已关闭'
}

export const getRoomStatusText = (status?: number) => {
  if (status === undefined || status === null) return '未知状态'
  return ROOM_STATUS_MAP[status] || '未知状态'
}

export const formatMoney = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return '--'
  const num = Number(value)
  if (Number.isNaN(num)) return '--'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export const formatDateTime = (value?: string | number | Date | null) => {
  if (!value && value !== 0) return '--'
  const date = new Date(value)
  if (isNaN(date.getTime())) return String(value).replace('T', ' ')
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}
