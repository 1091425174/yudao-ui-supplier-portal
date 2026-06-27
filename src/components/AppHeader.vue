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

      <nav class="nav nav-desktop">
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
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div v-if="displayName" class="user-chip">
              <el-icon><UserFilled /></el-icon>
              <span class="user-name">{{ displayName }}</span>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <el-button v-else class="action-btn login-btn" @click="router.push('/login')">
          <span class="login-text">供应商登录</span>
        </el-button>

        <button
          type="button"
          class="menu-toggle"
          aria-label="打开菜单"
          @click="mobileMenuOpen = true"
        >
          <el-icon><Menu /></el-icon>
        </button>
      </div>
    </div>

    <el-drawer
      v-model="mobileMenuOpen"
      direction="rtl"
      size="78%"
      :with-header="false"
      append-to-body
      class="mobile-nav-drawer"
    >
      <div class="mobile-nav">
        <div class="mobile-nav-head">
          <div class="mobile-nav-title">导航菜单</div>
          <button type="button" class="mobile-nav-close" aria-label="关闭菜单" @click="mobileMenuOpen = false">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <nav class="mobile-nav-list">
          <a
            v-for="item in navItems"
            :key="item.path"
            href="javascript:void(0)"
            class="mobile-nav-item"
            :class="{ active: isNavActive(item) }"
            @click="goNav(item)"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="mobile-nav-footer">
          <template v-if="isLoggedIn">
            <div v-if="displayName" class="mobile-user-name">{{ displayName }}</div>
            <el-button class="mobile-action-btn" @click="handleMobileProfile">个人中心</el-button>
            <el-button class="mobile-action-btn" @click="handleLogout">退出登录</el-button>
          </template>
          <el-button v-else type="primary" class="mobile-action-btn" @click="handleMobileLogin">
            供应商登录
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">
import { ArrowDown, Close, Menu, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
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
const mobileMenuOpen = ref(false)

const navItems: NavItem[] = [
  { label: '首页', path: '/', exact: true, public: true },
  { label: '通知公告', path: '/announcements', public: true },
  { label: '交易公示', path: '/disclosures', public: true },
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

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
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
  mobileMenuOpen.value = false
  if (!item.public && !getAccessToken()) {
    router.push({ path: '/login', query: { redirect: item.path } })
    return
  }
  router.push(item.path)
}

const goHome = () => {
  mobileMenuOpen.value = false
  router.push('/')
}

const handleUserCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
    return
  }
  if (command === 'logout') {
    handleLogout()
  }
}

const handleMobileLogin = () => {
  mobileMenuOpen.value = false
  router.push('/login')
}

const handleMobileProfile = () => {
  mobileMenuOpen.value = false
  router.push('/profile')
}

const handleLogout = async () => {
  mobileMenuOpen.value = false
  await userStore.loginOutAction()
  router.replace('/login')
}
</script>

<style scoped lang="scss">
@use '@/styles/breakpoints.scss' as *;

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
  min-width: 0;
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
  flex-shrink: 0;
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-text {
  min-width: 0;
}

.brand-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-brand-primary);
  line-height: 1.25;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-sub {
  font-size: 11px;
  color: var(--sp-text-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav-desktop {
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
  margin-left: auto;
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
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(13, 107, 143, 0.35);
    color: var(--sp-brand-secondary);
  }

  .user-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.user-arrow {
  font-size: 12px;
  color: var(--sp-text-muted);
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--sp-border);
  border-radius: 8px;
  background: var(--sp-bg-page);
  color: var(--sp-text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--sp-brand-secondary);
    border-color: rgba(13, 107, 143, 0.35);
  }

  .el-icon {
    font-size: 20px;
  }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.mobile-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--sp-border);
}

.mobile-nav-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--sp-text-primary);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--sp-text-muted);
  cursor: pointer;

  &:hover {
    background: var(--sp-bg-page);
    color: var(--sp-text-secondary);
  }
}

.mobile-nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-nav-item {
  padding: 14px 12px;
  border-radius: 10px;
  color: var(--sp-text-secondary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    color: var(--sp-brand-primary);
    font-weight: 600;
    background: linear-gradient(135deg, rgba(13, 107, 143, 0.1) 0%, rgba(201, 162, 39, 0.08) 100%);
  }
}

.mobile-nav-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--sp-border);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.mobile-user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--sp-text-primary);
  margin-bottom: 4px;
}

.mobile-nav-footer :deep(.mobile-action-btn.el-button) {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.mobile-nav-footer :deep(.mobile-action-btn.el-button + .el-button) {
  margin-left: 0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

@include sp-mobile {
  .header-inner {
    padding: 0 12px;
    gap: 10px;
    height: 56px;
  }

  .brand {
    flex: 1;
    min-width: 0;
  }

  .brand-logo-wrap {
    width: 36px;
    height: 36px;
  }

  .brand-logo {
    width: 26px;
    height: 26px;
  }

  .brand-title {
    font-size: 15px;
  }

  .brand-sub {
    display: none;
  }

  .nav-desktop {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }

  .header-actions .login-btn {
    display: none;
  }

  .user-chip {
    padding: 8px 10px;

    .user-name,
    .user-arrow {
      display: none;
    }
  }
}
</style>
