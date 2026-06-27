<template>
  <div class="announcement-detail-page">
    <div class="page-banner">
      <div class="banner-inner">
        <router-link to="/announcements" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          返回公告列表
        </router-link>
        <h1 class="banner-title">{{ notice?.title || '公告详情' }}</h1>
        <div v-if="notice" class="banner-meta">
          <el-tag v-if="notice.pinned" type="warning" size="small" effect="dark" round>置顶</el-tag>
          <span class="meta-date">{{ displayDate }}</span>
        </div>
      </div>
    </div>

    <div class="page-inner">
      <div v-loading="loading" class="detail-card sp-card">
        <template v-if="notice">
          <p v-if="notice.summary" class="detail-summary">{{ notice.summary }}</p>
          <div class="detail-content" v-html="safeContent" />
        </template>
        <el-empty v-else-if="!loading" description="公告不存在或已下线" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { PortalNoticeApi, type PortalNotice } from '@/api/bid/portalNotice'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

const route = useRoute()
const notice = ref<PortalNotice | null>(null)
const loading = ref(true)

const displayDate = computed(() => {
  if (!notice.value) return ''
  const time = notice.value.publishTime || notice.value.createTime
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : ''
})

const safeContent = computed(() => sanitizeHtml(notice.value?.content))

const loadDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    notice.value = null
    loading.value = false
    return
  }
  loading.value = true
  try {
    notice.value = await PortalNoticeApi.getPortalNotice(id)
  } catch {
    notice.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadDetail, { immediate: true })
</script>

<style scoped lang="scss">
.announcement-detail-page {
  background: var(--sp-bg-page);
  min-height: 60vh;
}

.page-banner {
  background: linear-gradient(135deg, #072d52 0%, #0a4a80 100%);
  color: #fff;
  padding: 40px 28px 48px;
}

.banner-inner {
  max-width: 960px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;

  &:hover {
    color: #fff;
  }
}

.banner-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.35;
}

.banner-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-date {
  font-size: 14px;
  opacity: 0.85;
}

.page-inner {
  max-width: 960px;
  margin: -24px auto 0;
  padding: 0 28px 56px;
  position: relative;
  z-index: 1;
}

.detail-card {
  padding: 32px 36px;
  min-height: 200px;
}

.detail-summary {
  margin: 0 0 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sp-border);
  color: var(--sp-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.detail-content {
  color: var(--sp-text-primary);
  font-size: 15px;
  line-height: 1.9;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 1em;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(a) {
    color: var(--sp-brand-secondary);
  }
}
</style>
