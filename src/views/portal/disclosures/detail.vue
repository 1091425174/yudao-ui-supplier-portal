<template>
  <div class="disclosure-detail-page">
    <div class="page-banner">
      <div class="banner-inner">
        <router-link to="/disclosures" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          返回公示列表
        </router-link>
        <div v-if="detail" class="banner-tags">
          <el-tag size="small" effect="dark" round>{{ typeLabel(detail.type) }}</el-tag>
          <span class="notice-no">{{ detail.noticeNo }}</span>
        </div>
        <h1 class="banner-title">{{ detail?.title || '公示详情' }}</h1>
        <div v-if="detail" class="banner-meta">
          <span>发布时间：{{ formatDate(detail.publishTime) }}</span>
          <span v-if="detail.publishEndTime">公示至：{{ formatDate(detail.publishEndTime) }}</span>
        </div>
      </div>
    </div>

    <div class="page-inner">
      <div v-loading="loading" class="detail-card sp-card">
        <template v-if="detail">
          <p v-if="detail.summary" class="detail-summary">{{ detail.summary }}</p>
          <div class="detail-content" v-html="safeContent"></div>
        </template>
        <el-empty v-else-if="!loading" description="公示不存在或已下线" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { DisclosureApi, DISCLOSURE_TYPE_MAP, type Disclosure } from '@/api/bid/disclosure'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

const route = useRoute()
const detail = ref<Disclosure | null>(null)
const loading = ref(true)

const typeLabel = (type?: number) => (type ? DISCLOSURE_TYPE_MAP[type] || '公示' : '公示')
const formatDate = (time?: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--')
const safeContent = computed(() => sanitizeHtml(detail.value?.content))

const loadDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    detail.value = null
    loading.value = false
    return
  }
  loading.value = true
  try {
    detail.value = await DisclosureApi.getDisclosure(id)
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadDetail, { immediate: true })
</script>

<style scoped lang="scss">
.disclosure-detail-page {
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
}

.banner-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.notice-no {
  font-size: 14px;
  opacity: 0.85;
}

.banner-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.35;
}

.banner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  opacity: 0.88;
}

.page-inner {
  max-width: 960px;
  margin: -24px auto 0;
  padding: 0 28px 56px;
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
  line-height: 1.8;
}

.detail-content {
  line-height: 1.9;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 1em;
  }

  :deep(img) {
    max-width: 100%;
  }
}
</style>
