<template>
  <div class="business-layout" :class="{ immersive: isImmersive }">
    <AppHeader variant="business" />

    <div class="business-body">
      <aside v-if="!isImmersive" class="business-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-label">业务中心</div>
          <div class="sidebar-welcome">欢迎回来</div>
        </div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="sidebar-item"
            active-class="active"
          >
            <div class="item-icon" :style="{ background: item.gradient }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="item-text">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-desc">{{ item.desc }}</span>
            </div>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </router-link>
        </nav>
      </aside>

      <main class="business-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, DataLine, Document } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  {
    path: '/target-hall',
    label: '标的大厅',
    desc: '报名与审核',
    icon: Document,
    gradient: 'linear-gradient(135deg, #0d6b8f, #0a4a80)'
  },
  {
    path: '/trade-hall',
    label: '交易大厅',
    desc: '竞价与交易',
    icon: DataLine,
    gradient: 'linear-gradient(135deg, #c9a227, #a68520)'
  }
]

const isImmersive = computed(() => !!route.meta.immersive)
</script>

<style scoped lang="scss">
.business-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sp-bg-page);
}

.business-body {
  flex: 1;
  max-width: 1320px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 28px 40px;
  display: flex;
  gap: 24px;
  box-sizing: border-box;
}

.business-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: var(--sp-radius-lg);
  border: 1px solid var(--sp-border);
  box-shadow: var(--sp-shadow-sm);
  padding: 20px 14px;
  height: fit-content;
  position: sticky;
  top: 88px;
}

.sidebar-header {
  padding: 4px 12px 16px;
  border-bottom: 1px solid var(--sp-border);
  margin-bottom: 12px;
}

.sidebar-label {
  font-size: 12px;
  color: var(--sp-text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.sidebar-welcome {
  font-size: 16px;
  font-weight: 700;
  color: var(--sp-text-primary);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  color: var(--sp-text-secondary);
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(13, 107, 143, 0.05);

    .item-arrow {
      opacity: 1;
      transform: translateX(2px);
    }
  }

  &.active {
    background: linear-gradient(135deg, rgba(13, 107, 143, 0.08) 0%, rgba(201, 162, 39, 0.06) 100%);
    box-shadow: inset 0 0 0 1px rgba(13, 107, 143, 0.12);

    .item-label {
      color: var(--sp-brand-primary);
      font-weight: 700;
    }

    .item-arrow {
      opacity: 1;
      color: var(--sp-brand-secondary);
    }
  }
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--sp-text-primary);
}

.item-desc {
  font-size: 11px;
  color: var(--sp-text-muted);
}

.item-arrow {
  opacity: 0;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.business-main {
  flex: 1;
  min-width: 0;
}

.business-layout.immersive .business-body {
  max-width: none;
  padding: 0;
}

.business-layout.immersive .business-main {
  padding: 0;
}

@media (max-width: 960px) {
  .business-body {
    flex-direction: column;
  }

  .business-sidebar {
    width: 100%;
    position: static;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-item {
    flex: 1;
    min-width: 140px;
  }
}
</style>
