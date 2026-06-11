import request from '@/config/axios'

export interface SupplierQuote {
  roomId?: number
  quotePrice?: number
  remark?: string
}

export const SupplierQuoteApi = {
  createSupplierQuoteBySupplier: (data: SupplierQuote) => {
    return request.post({ url: '/bid/supplier/supplier-quote/create', data })
  }
}
