import router from '@/router'
import { getAccessToken } from '@/utils/auth'
import { isRelogin } from '@/config/axios/service'
import { useUserStoreWithOut } from '@/store/user'

const whiteList = ['/', '/announcements', '/login']

router.beforeEach(async (to, _from, next) => {
  document.title = (to.meta.title as string)
    ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
    : import.meta.env.VITE_APP_TITLE

  if (getAccessToken()) {
    if (to.path === '/login') {
      next({ path: '/target-hall', replace: true })
      return
    }
    const userStore = useUserStoreWithOut()
    if (!userStore.getIsSetUser) {
      isRelogin.show = true
      try {
        await userStore.setUserInfoAction()
      } catch {
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        return
      } finally {
        isRelogin.show = false
      }
    }
    next()
  } else if (whiteList.includes(to.path) || to.meta.public) {
    next()
  } else {
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
