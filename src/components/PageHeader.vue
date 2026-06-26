<template>
  <div class="page-header">
    <div class="header-main">
      <el-button v-if="showBack" link type="primary" class="back-btn" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        {{ backText }}
      </el-button>
      <div class="header-text">
        <h1 class="header-title">{{ title }}</h1>
        <p v-if="description" class="header-desc">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.extra" class="header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    description?: string
    showBack?: boolean
    backText?: string
  }>(),
  {
    showBack: false,
    backText: '返回'
  }
)

const router = useRouter()

const handleBack = () => router.back()
</script>

<style scoped lang="scss">
@use '@/styles/breakpoints.scss' as *;

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #fff 0%, #f8fbfd 100%);
  border: 1px solid var(--sp-border);
  border-radius: var(--sp-radius-lg);
  box-shadow: var(--sp-shadow-sm);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(13, 107, 143, 0.04));
    pointer-events: none;
  }
}

.header-main {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.back-btn {
  padding-left: 0;
  margin-bottom: 8px;
  font-weight: 500;
}

.header-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--sp-text-primary);
  letter-spacing: 0.5px;
}

.header-desc {
  margin: 0;
  font-size: 14px;
  color: var(--sp-text-secondary);
  line-height: 1.6;
}

.header-extra {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

@include sp-mobile {
  .page-header {
    padding: 14px 14px 16px;
    margin-bottom: 12px;
    border-radius: var(--sp-radius);

    &::after {
      width: 120px;
    }
  }

  .header-title {
    font-size: 18px;
    letter-spacing: 0.2px;
  }

  .header-desc {
    font-size: 13px;
    line-height: 1.5;
  }

  .back-btn {
    margin-bottom: 6px;
    font-size: 13px;
  }
}
</style>
