<template>
  <div class="page-panel" v-loading="loading">
    <PageHeader
      title="竞价室详情"
      description="查看竞价室信息与结果，符合条件时可进入在线竞价"
      show-back
    />

    <template v-if="roomInfo">
      <div class="detail-card sp-card">
        <div class="detail-header">
          <div>
            <div class="project-name">{{ roomInfo.projectName || '--' }}</div>
            <div class="room-name">{{ roomInfo.name || '--' }}</div>
          </div>
          <el-tag :type="getStatusTagType(roomInfo.status)" size="large">
            {{ getStatusText(roomInfo.status) }}
          </el-tag>
        </div>

        <el-descriptions :column="2" border class="info-desc">
          <el-descriptions-item label="标的名称">{{ roomInfo.targetName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="竞价室名称">{{ roomInfo.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTime(roomInfo.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTime(roomInfo.endTime) }}</el-descriptions-item>
        </el-descriptions>

        <el-card
          v-if="resultInfo && resultInfo.resultStatus !== 0"
          shadow="never"
          class="result-card"
        >
          <template #header>
            <span class="result-title">竞价结果</span>
          </template>
          <div class="result-main">
            {{ resultInfo.resultText || getResultStatusText(resultInfo.resultStatus) }}
          </div>
          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="我的最终报价">
              {{ formatMoney(resultInfo.myFinalQuotePrice) }} 元
            </el-descriptions-item>
            <el-descriptions-item label="我的排名">
              {{ resultInfo.myRank ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="resultInfo.resultStatus === 2" label="成交金额">
              {{ formatMoney(resultInfo.finalPrice) }} 元
            </el-descriptions-item>
            <el-descriptions-item v-if="resultInfo.confirmTime" label="确认时间">
              {{ formatDateTime(resultInfo.confirmTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <div class="action-bar">
          <el-tooltip :disabled="canEnterRoom" :content="enterDisabledReason" placement="top">
            <el-button type="primary" size="large" :disabled="!canEnterRoom" @click="enterRoom">
              {{ enterButtonText }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <el-empty v-else-if="!loading" description="暂无竞价室详情数据" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '@vueuse/core'
import { getWsUrl } from '@/utils/auth'
import { RoomApi, type SupplierRoomResult } from '@/api/bid/room'
import { getRoomStatusText, formatDateTime, formatMoney } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({ name: 'SupplierRoomDetail' })

const route = useRoute()
const router = useRouter()
const loading = ref(false)

interface RoomDetailInfo {
  id: number
  projectName?: string
  targetName?: string
  name?: string
  status?: number
  startTime?: string | number | Date
  endTime?: string | number | Date
}

const roomInfo = ref<RoomDetailInfo | null>(null)
const resultInfo = ref<SupplierRoomResult | null>(null)

const roomId = computed(() => {
  const id = route.query.id
  return id ? Number(id) : 0
})


const getStatusText = (status?: number) => getRoomStatusText(status)

const getStatusTagType = (status?: number) => {
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

const getResultStatusText = (status?: number) => {
  const statusMap = {
    0: '竞价中',
    1: '结果待确认',
    2: '结果已确认',
    3: '流标'
  }
  return statusMap[status as keyof typeof statusMap] || '--'
}

const checkCanEnterRoom = (room?: RoomDetailInfo | null) => {
  if (!room?.id) return '竞价室信息不存在'

  switch (room.status) {
    case 1:
      return ''
    case 0:
      return '竞价室尚未开始，暂时无法进入'
    case 2:
      return '竞价室已结束，无法进入'
    case 3:
      return '竞价室已关闭，无法进入'
    default:
      return '当前竞价室状态异常'
  }
}

const canEnterRoom = computed(() => !checkCanEnterRoom(roomInfo.value))
const enterDisabledReason = computed(() => checkCanEnterRoom(roomInfo.value))

const enterButtonText = computed(() => {
  switch (roomInfo.value?.status) {
    case 1:
      return '进入竞价室'
    case 0:
      return '尚未开始'
    case 2:
      return '竞价已结束'
    case 3:
      return '竞价室已关闭'
    default:
      return '进入竞价室'
  }
})

const getDetail = async () => {
  if (!roomId.value) {
    ElMessage.error('竞价室ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await RoomApi.getRoom(roomId.value)
    roomInfo.value = res.data || res
    await loadRoomResult()
  } catch (e) {
    console.error(e)
    ElMessage.error('查询竞价室详情失败')
  } finally {
    loading.value = false
  }
}

const loadRoomResult = async () => {
  if (!roomId.value) return
  try {
    const res = await RoomApi.getRoomResult(roomId.value)
    resultInfo.value = res.data || res
  } catch (e) {
    console.error('查询竞价结果失败', e)
    resultInfo.value = null
  }
}

const enterRoom = () => {
  const msg = checkCanEnterRoom(roomInfo.value)
  if (msg) return ElMessage.warning(msg)

  router.push({
    name: 'SupplierBidRoom',
    query: { id: roomInfo.value?.id }
  })
}

const wsServer = ref(getWsUrl())

const { data: wsData, close: closeWs } = useWebSocket(wsServer.value, {
  autoReconnect: true,
  heartbeat: true
})

const MESSAGE_TYPE = {
  STATUS: 'bid-room-status-changed',
  DELAY: 'bid-room-delay',
  ENDED: 'bid-room-ended'
}

const lastWsTipKey = ref('')
const lastRoomStatus = ref<number | undefined>(undefined)

const buildWsTipKey = (type: string, content: any) => {
  return `${type}_${content?.roomId}_${content?.status}_${content?.endTime}`
}

const showWsNotice = (type: string, content: any) => {
  const key = buildWsTipKey(type, content)
  if (lastWsTipKey.value === key) return
  lastWsTipKey.value = key

  if (type === MESSAGE_TYPE.STATUS) {
    if (content?.status === 1 && lastRoomStatus.value !== 1) {
      ElMessage.success('竞价室已开启，可进入竞价室')
    } else if (content?.status === 2 && lastRoomStatus.value !== 2) {
      ElMessage.warning('竞价室已结束')
    } else if (content?.status === 3 && lastRoomStatus.value !== 3) {
      ElMessage.warning('竞价室已关闭')
    }
  }

  if (type === MESSAGE_TYPE.DELAY) {
    const time = content?.newEndTime ? formatDateTime(content.newEndTime) : ''
    ElMessage.info(time ? `结束时间延长至 ${time}` : '竞价室已延时')
  }

  if (type === MESSAGE_TYPE.ENDED) {
    ElMessage.warning('竞价室已结束')
  }
}

let reloadTimer: number | null = null

const reloadDetail = () => {
  if (reloadTimer) clearTimeout(reloadTimer)
  reloadTimer = window.setTimeout(getDetail, 200)
}

watchEffect(() => {
  if (!wsData.value || wsData.value === 'pong') return

  try {
    const msg = JSON.parse(wsData.value)
    const type = msg.type
    const content = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content

    if (content?.roomId && Number(content.roomId) !== roomId.value) return

    if (
      type === MESSAGE_TYPE.STATUS ||
      type === MESSAGE_TYPE.DELAY ||
      type === MESSAGE_TYPE.ENDED
    ) {
      showWsNotice(type, content)
      reloadDetail()

      if (type === MESSAGE_TYPE.STATUS && content?.status !== undefined) {
        lastRoomStatus.value = content.status
      }
    }
  } catch (e) {
    console.error('WS解析失败', e)
  }
})

onMounted(getDetail)

onBeforeUnmount(() => {
  if (reloadTimer) clearTimeout(reloadTimer)
  closeWs()
})
</script>

<style scoped lang="scss">
.page-panel {
  min-height: 100%;
}

.detail-card {
  padding: 28px 32px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--sp-border);
}

.project-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--sp-text-primary);
  margin-bottom: 6px;
}

.room-name {
  font-size: 14px;
  color: var(--sp-text-muted);
}

.info-desc {
  margin-bottom: 24px;
}

.result-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fafcff 0%, #fff9ee 100%);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: var(--sp-radius);
}

.result-title {
  font-weight: 700;
  color: var(--sp-text-primary);
}

.result-main {
  font-size: 18px;
  font-weight: 700;
  color: #b8860b;
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  justify-content: center;
  padding-top: 8px;

  .el-button {
    min-width: 200px;
    height: 44px;
    font-weight: 600;
    border-radius: 8px;
  }
}
</style>
