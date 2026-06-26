import { useBreakpoints } from '@vueuse/core'

/** 与 styles/breakpoints.scss 保持一致 */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 960
} as const

export function useDevice() {
  const breakpoints = useBreakpoints({
    mobile: BREAKPOINTS.mobile,
    tablet: BREAKPOINTS.tablet
  })

  const isMobile = breakpoints.smaller('mobile')
  const isTablet = breakpoints.between('mobile', 'tablet')
  const isDesktop = breakpoints.greaterOrEqual('tablet')

  return {
    isMobile,
    isTablet,
    isDesktop
  }
}
