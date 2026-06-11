import request from '@/config/axios'

export interface SupplierTarget {
  id: number
  projectId?: number
  projectName?: string
  name?: string
  code?: string
  content?: string
  priceLimit?: number
  status?: number
  signupId?: number
  signupStatus?: number
  auditRemark?: string
  roomId?: number
  roomStatus?: number
  roomStartTime?: string
  roomEndTime?: string
}

export interface SignupSubmitReq {
  targetId: number
  contactName: string
  contactMobile: string
  qualificationFiles?: string
  remark?: string
}

export const SignupApi = {
  getSupplierTargetPage: (params: any) => {
    return request.get({ url: '/bid/supplier/signup/target-page', params })
  },
  getMySignupByTarget: (targetId: number) => {
    return request.get({ url: '/bid/supplier/signup/get-by-target?targetId=' + targetId })
  },
  submitSignup: (data: SignupSubmitReq) => {
    return request.post({ url: '/bid/supplier/signup/submit', data })
  }
}
