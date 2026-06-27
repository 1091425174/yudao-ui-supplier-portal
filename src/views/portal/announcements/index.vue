<template>
  <div class="announcements-page">
    <div class="page-banner">
      <div class="banner-inner">
        <h1 class="banner-title">通知公告</h1>
        <p class="banner-desc">平台通知、采购说明与相关公告信息</p>
      </div>
    </div>

    <div class="page-inner">
      <div v-loading="loading" class="announce-card-list">
        <div
          v-for="item in list"
          :key="item.id"
          class="announce-card sp-card"
          @click="goDetail(item.id)"
        >
          <div class="card-accent" :class="{ pinned: item.pinned }" />
          <div class="card-body">
            <div class="card-head">
              <div class="card-title-row">
                <el-tag v-if="item.pinned" type="warning" size="small" effect="dark" round>置顶</el-tag>
                <h3 class="card-title">{{ item.title }}</h3>
              </div>
              <span class="card-date">{{ formatDate(item) }}</span>
            </div>
            <p v-if="item.summary" class="card-summary">{{ item.summary }}</p>
          </div>
        </div>
        <el-empty v-if="!loading && list.length === 0" description="暂无公告" />
      </div>

      <div v-if="total > queryParams.pageSize" class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="loadList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { PortalNoticeApi, type PortalNotice } from '@/api/bid/portalNotice'

const router = useRouter()
const loading = ref(false)
const list = ref<PortalNotice[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

const formatDate = (item: PortalNotice) => {
  const time = item.publishTime || item.createTime
  return time ? dayjs(time).format('YYYY-MM-DD') : ''
}

const goDetail = (id: number) => {
  router.push(`/announcements/${id}`)
}

const loadList = async () => {
  loading.value = true
  try {
    const data = await PortalNoticeApi.getPortalNoticePage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(loadList)
</script>

<style scoped lang="scss">
.announcements-page {
  background: var(--sp-bg-page);
}

.page-banner {
  background: linear-gradient(135deg, #072d52 0%, #0a4a80 100%);
  color: #fff;
  padding: 48px 28px;
}

.banner-inner {
  max-width: 960px;
  margin: 0 auto;
}

.banner-title {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.banner-desc {
  margin: 0;
  font-size: 15px;
  opacity: 0.85;
}

.page-inner {
  max-width: 960px;
  margin: -24px auto 0;
  padding: 0 28px 56px;
  position: relative;
  z-index: 1;
}

.announce-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 120px;
}

.announce-card {
  display: flex;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: var(--sp-shadow-md);
  }
}

.card-accent {
  width: 4px;
  flex-shrink: 0;
  background: var(--sp-border);

  &.pinned {
    background: linear-gradient(180deg, var(--sp-brand-accent), #a68520);
  }
}

.card-body {
  flex: 1;
  padding: 22px 28px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 10px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 17px;
  color: var(--sp-text-primary);
  font-weight: 700;
}

.card-date {
  color: var(--sp-text-muted);
  font-size: 13px;
  flex-shrink: 0;
}

.card-summary {
  margin: 0;
  color: var(--sp-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}
</style>
