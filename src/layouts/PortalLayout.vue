<template>
  <div class="portal-layout">
    <AppHeader variant="portal" />
    <main class="portal-main">
      <router-view />
    </main>
    <footer class="portal-footer">
      <div class="footer-top">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="@/assets/imgs/zdjt.png" alt="logo" class="footer-logo" />
            <div>
              <div class="footer-title">{{ appTitle }}</div>
              <div class="footer-tagline">供应商在线竞价服务平台</div>
            </div>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <div class="link-title">快捷入口</div>
              <router-link to="/target-hall">标的大厅</router-link>
              <router-link to="/trade-hall">交易大厅</router-link>
              <router-link to="/announcements">通知公告</router-link>
            </div>
            <div class="link-group">
              <div class="link-title">服务说明</div>
              <span>在线报名</span>
              <span>实时竞价</span>
              <span>结果查询</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-inner">
          <span>{{ appTitle }} · 供应商在线竞价门户</span>
          <span class="footer-divider">|</span>
          <span>仅供授权供应商使用</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'

const appTitle = import.meta.env.VITE_APP_TITLE
</script>

<style scoped lang="scss">
.portal-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sp-bg-page);
}

.portal-main {
  flex: 1;
}

.portal-footer {
  margin-top: auto;
}

.footer-top {
  background: linear-gradient(180deg, #0a3d6b 0%, #072d52 100%);
  color: rgba(255, 255, 255, 0.85);
  padding: 48px 28px 40px;
}

.footer-inner {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: brightness(1.1);
}

.footer-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.footer-tagline {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-links {
  display: flex;
  gap: 64px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 10px;

  a,
  span {
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: var(--sp-brand-accent);
  }
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.footer-bottom {
  background: #051f38;
  padding: 16px 28px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.footer-bottom .footer-inner {
  justify-content: center;
  gap: 12px;
}

.footer-divider {
  opacity: 0.35;
}

@media (max-width: 768px) {
  .footer-links {
    gap: 32px;
  }
}
</style>
