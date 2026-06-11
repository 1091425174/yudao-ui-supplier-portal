<template>
  <div class="page-panel">
    <PageHeader title="交易大厅" description="查看今日招标、计划项目与历史记录，进入竞价室参与报价" />

    <div class="tab-panel sp-card">
      <el-radio-group v-model="currentMenu" size="large" @change="handleMenuChange">
        <el-radio-button label="today">今日招标</el-radio-button>
        <el-radio-button label="plan">招标计划</el-radio-button>
        <el-radio-button label="history">历史项目</el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="card-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="project-card sp-card"
        @click="goDetail(item)"
      >
        <div class="card-top">
          <el-tag :type="getStatusTagType(item.status)" size="small">
            {{ item.statusText }}
          </el-tag>
          <span class="room-name">{{ item.name }}</span>
        </div>

        <el-descriptions :column="1" size="small" class="info-desc">
          <el-descriptions-item label="项目名称">{{ item.projectName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="标的名称">{{ item.targetName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="采购方式">{{ item.purchaseType }}</el-descriptions-item>
          <el-descriptions-item label="竞价开始">
            <span class="time-highlight">{{ item.startTime || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="竞价结束">
            <span class="time-highlight">{{ item.endTime || '--' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-if="!loading && list.length === 0" :description="emptyText" class="empty-block" />
    </div>

    <div v-if="total > 0" class="pagination-bar">
      <el-pagination
        v-model:current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { RoomApi, type Room } from '@/api/bid/room'
import { getRoomStatusText, formatDateTime } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({ name: 'SupplierTradeHall' })

interface ProjectItem {
  id: number
  roomId: number
  projectId?: number
  projectName?: string
  targetId?: number
  targetName?: string
  name: string
  buyer: string
  purchaseType: string
  startTime: string
  endTime: string
  status: number
  statusText: string
}

const router = useRouter()

const loading = ref(false)
const currentMenu = ref<'today' | 'plan' | 'history'>('today')

const list = ref<ProjectItem[]>([])
const pageNo = ref(1)
const pageSize = ref(8)
const total = ref(0)

const getStatusTagType = (status: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'danger'
    default:
      return 'warning'
  }
}

const emptyText = computed(() => {
  switch (currentMenu.value) {
    case 'today':
      return '今日暂无可参与的招标项目'
    case 'plan':
      return '暂无招标计划，敬请关注'
    case 'history':
      return '暂无历史项目记录'
    default:
      return '暂无数据'
  }
})

const convertRoomToProjectItem = (room: Room): ProjectItem => {
  return {
    id: room.id,
    roomId: room.id,
    projectId: room.projectId,
    projectName: room.projectName,
    targetId: room.targetId,
    targetName: room.targetName,
    name: room.name || '未命名竞价室',
    buyer: '******',
    purchaseType: '竞价采购',
    startTime: formatDateTime(room.startTime),
    endTime: formatDateTime(room.endTime),
    status: room.status,
    statusText: getRoomStatusText(room.status)
  }
}

const getRoomList = async () => {
  const res = await RoomApi.getRoomPage({
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    hallType: currentMenu.value
  })

  const pageList = res.list || res.data?.list || []
  list.value = pageList.map((item: Room) => convertRoomToProjectItem(item))
  total.value = res.total || res.data?.total || 0
}

const loadData = async () => {
  loading.value = true
  try {
    await getRoomList()
  } catch (error) {
    console.error('获取交易大厅数据失败', error)
    ElMessage.error('获取交易大厅数据失败')
  } finally {
    loading.value = false
  }
}

const handleMenuChange = async () => {
  pageNo.value = 1
  await loadData()
}

const goDetail = (item: ProjectItem) => {
  router.push({
    name: 'RoomDetailView',
    query: { id: String(item.id) }
  })
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.page-panel {
  min-height: 100%;
}

.tab-panel {
  margin-bottom: 20px;
  padding: 16px 24px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  min-height: 200px;
}

.project-card {
  padding: 22px 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, var(--sp-brand-secondary), var(--sp-brand-accent));
    opacity: 0;
    transition: opacity 0.25s;
  }

  &:hover {
    transform: translateY(-3px);

    &::before {
      opacity: 1;
    }
  }
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.room-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--sp-text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-desc {
  :deep(.el-descriptions__label) {
    width: 72px;
  }
}

.time-highlight {
  color: var(--sp-brand-secondary);
  font-weight: 600;
}

.empty-block {
  grid-column: 1 / -1;
}

.pagination-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 960px) {
  .card-list {
    grid-template-columns: 1fr;
  }
}
</style>
