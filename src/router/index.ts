import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const businessLayout = () => import('@/layouts/BusinessLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PortalLayout.vue'),
    children: [
      {
        path: '',
        name: 'PortalHome',
        component: () => import('@/views/portal/home/index.vue'),
        meta: { title: '首页', public: true }
      },
      {
        path: 'announcements',
        name: 'PortalAnnouncements',
        component: () => import('@/views/portal/announcements/index.vue'),
        meta: { title: '通知公告', public: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/target-hall',
    component: businessLayout,
    children: [
      {
        path: '',
        name: 'SupplierTargetHall',
        component: () => import('@/views/target-hall/index.vue'),
        meta: { title: '标的大厅' }
      }
    ]
  },
  {
    path: '/trade-hall',
    component: businessLayout,
    children: [
      {
        path: '',
        name: 'TradeHall',
        component: () => import('@/views/trade-hall/index.vue'),
        meta: { title: '交易大厅' }
      }
    ]
  },
  {
    path: '/room-detail',
    component: businessLayout,
    children: [
      {
        path: '',
        name: 'RoomDetailView',
        component: () => import('@/views/room-detail/index.vue'),
        meta: { title: '竞价室详情' }
      }
    ]
  },
  {
    path: '/bid-room',
    component: businessLayout,
    children: [
      {
        path: '',
        name: 'SupplierBidRoom',
        component: () => import('@/views/bid-room/index.vue'),
        meta: { title: '在线竞价室', immersive: true }
      }
    ]
  },
  {
    path: '/profile',
    component: businessLayout,
    children: [
      {
        path: '',
        name: 'SupplierProfile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes
})

export default router
