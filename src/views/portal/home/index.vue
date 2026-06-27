<template>
  <div class="portal-home">
    <section class="hero">
      <div class="hero-pattern" />
      <div class="hero-inner">
        <div class="hero-badge">官方采购 · 在线竞价</div>
        <h1 class="hero-title">供应商在线竞价门户</h1>
        <p class="hero-desc">
          集中发布采购与竞价信息，支持在线报名、实时报价与结果查询，全流程透明可追溯。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="hero-btn primary" @click="handlePrimaryAction">
            {{ isLoggedIn ? '进入业务中心' : '供应商登录' }}
          </el-button>
          <el-button size="large" class="hero-btn ghost" @click="router.push('/announcements')">
            查看通知公告
          </el-button>
        </div>
        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="sp-section-title">最新公告</h2>
          <router-link to="/announcements" class="more-link">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>

        <div class="announce-panel">
          <div
            v-for="item in latestAnnouncements"
            :key="item.id"
            class="announce-item"
            @click="router.push('/announcements')"
          >
            <div class="announce-dot" :class="{ pinned: item.pinned }" />
            <div class="announce-body">
              <div class="announce-title-row">
                <el-tag v-if="item.pinned" type="warning" size="small" effect="dark" round>置顶</el-tag>
                <span class="announce-title">{{ item.title }}</span>
              </div>
            </div>
            <span class="announce-date">{{ item.date }}</span>
            <el-icon class="announce-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-services">
      <div class="section-inner">
        <h2 class="sp-section-title section-title-center">核心服务</h2>
        <p class="section-subtitle">一站式供应商竞价业务入口</p>
        <div class="shortcuts">
          <div v-for="item in services" :key="item.name" class="shortcut-card" @click="item.action">
            <div class="shortcut-icon" :style="{ background: item.gradient }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="shortcut-name">{{ item.name }}</div>
            <div class="shortcut-desc">{{ item.desc }}</div>
            <div class="shortcut-link">
              立即进入
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Bell, DataLine, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAccessToken } from '@/utils/auth'
import { portalAnnouncements } from '@/data/portalAnnouncements'

const router = useRouter()
const isLoggedIn = computed(() => !!getAccessToken())

const latestAnnouncements = computed(() => portalAnnouncements.slice(0, 5))

const stats = [
  { value: '7×24', label: '全天候服务' },
  { value: '实时', label: '在线竞价' },
  { value: '全流程', label: '透明可追溯' }
]

const requireLogin = (path: string) => {
  if (!getAccessToken()) {
    ElMessage.info('请先登录')
    router.push({ path: '/login', query: { redirect: path } })
    return false
  }
  router.push(path)
  return true
}

const handlePrimaryAction = () => {
  if (isLoggedIn.value) {
    router.push('/target-hall')
  } else {
    router.push('/login')
  }
}

const services = [
  {
    name: '标的大厅',
    desc: '浏览可报名标的，提交资质材料',
    icon: Document,
    gradient: 'linear-gradient(135deg, #0d6b8f 0%, #0a4a80 100%)',
    action: () => requireLogin('/target-hall')
  },
  {
    name: '交易大厅',
    desc: '查看进行中竞价，进入竞价室',
    icon: DataLine,
    gradient: 'linear-gradient(135deg, #c9a227 0%, #a68520 100%)',
    action: () => requireLogin('/trade-hall')
  },
  {
    name: '通知公告',
    desc: '平台通知、采购说明与公示',
    icon: Bell,
    gradient: 'linear-gradient(135deg, #3d6b8f 0%, #2a5070 100%)',
    action: () => router.push('/announcements')
  }
]
</script>

<style scoped lang="scss">
.portal-home {
  background: var(--sp-bg-page);
}

.hero {
  position: relative;
  background: linear-gradient(135deg, #072d52 0%, #0a4a80 40%, #0d6b8f 100%);
  color: #fff;
  padding: 64px 28px 72px;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image:
    linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
    linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
    linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
    linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff);
  background-size: 80px 140px;
  background-position: 0 0, 0 0, 40px 70px, 40px 70px;
}

.hero-inner {
  max-width: 1320px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  background: rgba(201, 162, 39, 0.2);
  border: 1px solid rgba(201, 162, 39, 0.45);
  border-radius: 20px;
  color: #f5ecd4;
}

.hero-title {
  margin: 0 0 16px;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.2;
}

.hero-desc {
  margin: 0 0 36px;
  font-size: 17px;
  line-height: 1.8;
  opacity: 0.88;
  max-width: 580px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.hero-btn {
  padding: 12px 32px;
  font-weight: 600;
  border-radius: 8px;

  &.primary {
    background: linear-gradient(135deg, #c9a227 0%, #dbb84a 100%);
    border: none;
    color: #1a2332;

    &:hover {
      background: linear-gradient(135deg, #dbb84a 0%, #e8c96a 100%);
    }
  }

  &.ghost {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

.hero-stats {
  display: flex;
  gap: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--sp-brand-accent);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.75;
}

.section {
  padding: 48px 28px;
}

.section-services {
  background: #fff;
  border-top: 1px solid var(--sp-border);
}

.section-inner {
  max-width: 1320px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.more-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--sp-brand-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: var(--sp-brand-primary);
  }
}

.announce-panel {
  background: #fff;
  border-radius: var(--sp-radius-lg);
  border: 1px solid var(--sp-border);
  box-shadow: var(--sp-shadow-sm);
  overflow: hidden;
}

.announce-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--sp-border);
  cursor: pointer;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: linear-gradient(90deg, rgba(13, 107, 143, 0.04) 0%, transparent 100%);

    .announce-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
}

.announce-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sp-brand-secondary);
  flex-shrink: 0;

  &.pinned {
    background: var(--sp-brand-accent);
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.25);
  }
}

.announce-body {
  flex: 1;
  min-width: 0;
}

.announce-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.announce-title {
  color: var(--sp-text-primary);
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announce-date {
  color: var(--sp-text-muted);
  font-size: 13px;
  flex-shrink: 0;
}

.announce-arrow {
  color: var(--sp-text-muted);
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.section-title-center {
  text-align: center;
  padding-left: 0;

  &::before {
    left: 50%;
    transform: translate(-50%, -50%);
    top: auto;
    bottom: -12px;
    width: 40px;
    height: 3px;
  }
}

.section-subtitle {
  text-align: center;
  color: var(--sp-text-muted);
  font-size: 14px;
  margin: 24px 0 36px;
}

.shortcuts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.shortcut-card {
  background: #fff;
  border: 1px solid var(--sp-border);
  border-radius: var(--sp-radius-lg);
  padding: 32px 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--sp-shadow-sm);

  &:hover {
    border-color: rgba(13, 107, 143, 0.3);
    box-shadow: var(--sp-shadow-lg);
    transform: translateY(-4px);

    .shortcut-link {
      color: var(--sp-brand-secondary);
    }
  }
}

.shortcut-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  box-shadow: var(--sp-shadow-md);
}

.shortcut-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--sp-text-primary);
  margin-bottom: 8px;
}

.shortcut-desc {
  font-size: 13px;
  color: var(--sp-text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.shortcut-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sp-text-muted);
  transition: color 0.2s;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 30px;
  }

  .hero-stats {
    gap: 24px;
    flex-wrap: wrap;
  }

  .shortcuts {
    grid-template-columns: 1fr;
  }
}
</style>
