<template>
  <header class="app-header" :class="variant">
    <div class="header-accent" />
    <div class="header-inner">
      <div class="brand" @click="goHome">
        <div class="brand-logo-wrap">
          <img src="@/assets/imgs/zdjt.png" alt="logo" class="brand-logo" />
        </div>
        <div class="brand-text">
          <div class="brand-title">{{ appTitle }}</div>
          <div class="brand-sub">Supplier Portal</div>
        </div>
      </div>

      <nav class="nav">
        <a
          v-for="item in navItems"
          :key="item.path"
          href="javascript:void(0)"
          class="nav-item"
          :class="{ active: isNavActive(item) }"
          @click="goNav(item)"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="header-actions">
        <template v-if="isLoggedIn">
          <div v-if="displayName" class="user-chip">
            <el-icon><UserFilled /></el-icon>
            <span>{{ displayName }}</span>
          </div>
          <el-button class="logout-btn" @click="handleLogout">退出</el-button>
        </template>
        <el-button v-else class="action-btn login-btn" @click="router.push('/login')">
          供应商登录
        </el-button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { UserFilled } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { getAccessToken } from '@/utils/auth'
import { useUserStoreWithOut } from '@/store/user'

interface NavItem {
  label: string
  path: string
  public?: boolean
  exact?: boolean
  matchPaths?: string[]
}

withDefaults(
  defineProps<{
    variant?: 'portal' | 'business'
  }>(),
  { variant: 'portal' }
)

const route = useRoute()
const router = useRouter()
const userStore = useUserStoreWithOut()
const appTitle = import.meta.env.VITE_APP_TITLE

const navItems: NavItem[] = [
  { label: '首页', path: '/', exact: true, public: true },
  { label: '通知公告', path: '/announcements', public: true },
  { label: '标的大厅', path: '/target-hall' },
  {
    label: '交易大厅',
    path: '/trade-hall',
    matchPaths: ['/trade-hall', '/room-detail', '/bid-room']
  }
]

const isLoggedIn = computed(() => !!getAccessToken() && userStore.getIsSetUser)
const displayName = computed(
  () => userStore.getUser.nickname || userStore.getUser.username || ''
)

const isNavActive = (item: NavItem) => {
  if (item.matchPaths) {
    return item.matchPaths.some((p) => route.path === p || route.path.startsWith(`${p}/`))
  }
  if (item.exact) {
    return route.path === item.path
  }
  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

const goNav = (item: NavItem) => {
  if (!item.public && !getAccessToken()) {
    router.push({ path: '/login', query: { redirect: item.path } })
    return
  }
  router.push(item.path)
}

const goHome = () => router.push('/')

const handleLogout = async () => {
  await userStore.loginOutAction()
  router.replace('/login')
}
</script>

<style scoped lang="scss">
.app-header {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--sp-border), 0 4px 20px rgba(10, 61, 107, 0.06);
  position: sticky;
  top: 0;
  z-index: 200;

  &.business {
    background: linear-gradient(180deg, #fff 0%, #fafcfe 100%);
  }
}

.header-accent {
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--sp-brand-primary) 0%,
    var(--sp-brand-secondary) 45%,
    var(--sp-brand-accent) 100%
  );
}

.header-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 28px;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-logo-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e8f4fa 0%, #fff 100%);
  border: 1px solid var(--sp-border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--sp-shadow-sm);
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-brand-primary);
  line-height: 1.25;
  letter-spacing: 0.3px;
}

.brand-sub {
  font-size: 11px;
  color: var(--sp-text-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav {
  display: flex;
  gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

.nav-item {
  padding: 9px 18px;
  color: var(--sp-text-secondary);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: var(--sp-brand-secondary);
    background: rgba(13, 107, 143, 0.06);
  }

  &.active {
    color: var(--sp-brand-primary);
    font-weight: 600;
    background: linear-gradient(135deg, rgba(13, 107, 143, 0.1) 0%, rgba(201, 162, 39, 0.08) 100%);
    box-shadow: inset 0 0 0 1px rgba(13, 107, 143, 0.12);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 8px;
}

.login-btn {
  border-color: var(--sp-brand-secondary);
  color: var(--sp-brand-secondary);

  &:hover {
    background: var(--el-color-primary-light-9);
  }
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--sp-bg-page);
  border-radius: 20px;
  font-size: 13px;
  color: var(--sp-text-secondary);
  border: 1px solid var(--sp-border);

  span {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.logout-btn {
  border-radius: 8px;
}
</style>
