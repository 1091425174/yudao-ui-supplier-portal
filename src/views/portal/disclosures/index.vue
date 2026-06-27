<template>
  <div class="disclosures-page">
    <div class="page-banner">
      <div class="banner-inner">
        <h1 class="banner-title">交易公示</h1>
        <p class="banner-desc">采购公告、成交公示、流标公示等依法公开信息</p>
      </div>
    </div>

    <div class="page-inner">
      <div class="type-filter sp-card">
        <button
          v-for="tab in typeTabs"
          :key="String(tab.value)"
          type="button"
          class="type-filter-item"
          :class="{ 'is-active': queryParams.type === tab.value }"
          @click="selectType(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-loading="loading" class="disclosure-list">
        <div
          v-for="item in list"
          :key="item.id"
          class="disclosure-card sp-card"
          @click="goDetail(item.id)"
        >
          <div class="card-head">
            <el-tag size="small" effect="plain" round>{{ typeLabel(item.type) }}</el-tag>
            <span class="notice-no">{{ item.noticeNo }}</span>
          </div>
          <h3 class="card-title">{{ item.title }}</h3>
          <p v-if="item.summary" class="card-summary">{{ item.summary }}</p>
          <div class="card-meta">
            <span>发布时间：{{ formatDate(item.publishTime) }}</span>
            <span v-if="item.publishEndTime">公示至：{{ formatDate(item.publishEndTime) }}</span>
          </div>
        </div>
        <el-empty v-if="!loading && list.length === 0" description="暂无公示" />
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
import { DisclosureApi, DISCLOSURE_TYPE_MAP, type Disclosure } from '@/api/bid/disclosure'

const router = useRouter()
const loading = ref(false)
const list = ref<Disclosure[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  type: undefined as number | undefined
})

const typeTabs = [
  { label: '全部', value: undefined as number | undefined },
  { label: '采购公告', value: 1 },
  { label: '成交公示', value: 2 },
  { label: '流标公示', value: 3 }
]

const typeLabel = (type?: number) => (type ? DISCLOSURE_TYPE_MAP[type] || '公示' : '公示')
const formatDate = (time?: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '--')

const goDetail = (id: number) => router.push(`/disclosures/${id}`)

const selectType = (value: number | undefined) => {
  if (queryParams.type === value) {
    return
  }
  queryParams.type = value
  handleTypeChange()
}

const handleTypeChange = () => {
  queryParams.pageNo = 1
  loadList()
}

const loadList = async () => {
  loading.value = true
  try {
    const data = await DisclosureApi.getDisclosurePage(queryParams)
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
.disclosures-page {
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

.type-filter {
  display: flex;
  gap: 8px;
  padding: 8px;
  margin-bottom: 20px;
}

.type-filter-item {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--sp-text-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;

  &:hover:not(.is-active) {
    color: var(--sp-brand-primary);
    background: rgba(10, 61, 107, 0.06);
  }

  &.is-active {
    color: #fff;
    font-weight: 600;
    background: linear-gradient(135deg, var(--sp-brand-primary) 0%, var(--sp-brand-secondary) 100%);
    box-shadow: 0 4px 14px rgba(10, 61, 107, 0.22);
  }
}

@media (max-width: 640px) {
  .type-filter {
    flex-wrap: wrap;
  }

  .type-filter-item {
    flex: 1 1 calc(50% - 4px);
  }
}

.disclosure-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 120px;
}

.disclosure-card {
  padding: 22px 28px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: var(--sp-shadow-md);
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.notice-no {
  font-size: 13px;
  color: var(--sp-text-muted);
}

.card-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-text-primary);
}

.card-summary {
  margin: 0 0 12px;
  color: var(--sp-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--sp-text-muted);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}
</style>
