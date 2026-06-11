import request from '@/config/axios'

export interface Room {
  id: number
  projectId?: number
  projectName?: string
  targetId: number
  targetName?: string
  name?: string
  code?: string
  status: number
  startTime?: string
  endTime?: string
  priceLimit?: number
}

export interface RoomDashboard {
  currentMinPrice?: number
  currentMinSupplierName?: string
  myQuotePrice?: number
  myRank?: number
  leading?: boolean
  firstQuotePrice?: number
  firstQuoteTime?: string
  latestQuoteLogs?: Array<{ text?: string; time?: number | string }>
  quoteTrends?: Array<{ time?: string; price?: number | string }>
  endTime?: string
  quoteCount?: number | null
}

export interface SupplierRoomResult {
  roomId?: number
  targetId?: number
  resultStatus?: number
  myFinalQuotePrice?: number
  myFinalQuoteTime?: string
  myRank?: number
  won?: boolean
  winnerSupplierName?: string
  finalPrice?: number
  confirmTime?: string
  resultText?: string
}

export const RoomApi = {
  getRoomPage: (params: any) => request.get({ url: '/bid/supplier/room/page', params }),
  getRoom: (id: number) => request.get({ url: '/bid/supplier/room/get?id=' + id }),
  getRoomDashboard: (id: number) => request.get({ url: '/bid/supplier/room/dashboard?roomId=' + id }),
  getRoomResult: (id: number) => request.get({ url: '/bid/supplier/room/result?roomId=' + id })
}
