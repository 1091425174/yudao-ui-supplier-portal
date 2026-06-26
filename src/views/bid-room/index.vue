<template>
  <div class="bid-room-page" v-loading="loading">
    <div class="room-toolbar">
      <el-button link type="primary" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回详情
      </el-button>
      <span class="room-title">{{ roomInfo.name || '竞价室' }}</span>
      <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
    </div>
    <div class="content-wrap">
      <!-- 左侧主体 -->
      <div class="main-panel">
        <!-- 头部信息 -->
        <div class="panel header-panel">
          <div class="status-row">
            <div class="status-text">
              当前状态：
              <span class="status-value">{{ statusText }}</span>
            </div>
            <div class="time-range">
              竞价开始时间：{{ formatDateTime(roomInfo.startTime) }}
              <span class="divider">—</span>
              竞价结束时间：{{ formatDateTime(roomInfo.endTime) }}
            </div>
          </div>
          <div v-if="roomInfo.autoDelayEnabled === 1" class="delay-tip">
            {{ delayRuleText }}
            <span v-if="dashboardInfo.currentDelayTimes !== null && dashboardInfo.currentDelayTimes !== undefined">
              （已延时 {{ dashboardInfo.currentDelayTimes }}/{{ formatMaxDelayTimes(roomInfo.maxDelayTimes) }} 次）
            </span>
          </div>
          <div v-if="resultInfo.resultStatus !== undefined && resultInfo.resultStatus !== 0" class="result-summary">
            <div class="result-text">{{ resultInfo.resultText || getResultStatusText(resultInfo.resultStatus) }}</div>
            <div class="result-meta">
              <span>我的最终报价：{{ formatMoney(resultInfo.myFinalQuotePrice) }} 元</span>
              <span>我的排名：{{ resultInfo.myRank ?? '--' }}</span>
              <span v-if="resultInfo.resultStatus === 2">成交金额：{{ formatMoney(resultInfo.finalPrice) }} 元</span>
              <span v-if="resultInfo.confirmTime">确认时间：{{ formatDateTime(resultInfo.confirmTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 概况 + 倒计时 -->
        <div class="panel overview-panel">
          <div class="left-overview">
            <div class="section-title">竞价概况</div>

            <table class="overview-table overview-table--desktop">
              <thead>
              <tr>
                <th>采购方式</th>
                <th>供应商报价方式</th>
                <th>项目名称</th>
                <th>标的名称</th>
                <th>限价(元)</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>竞价采购</td>
                <td>报总价</td>
                <td>{{ roomInfo.projectName || '-' }}</td>
                <td>{{ roomInfo.targetName || '-' }}</td>
                <td>{{ roomInfo.priceLimit || '-' }}</td>
              </tr>
              </tbody>
            </table>

            <dl class="overview-cards">
              <div class="overview-card-item">
                <dt>采购方式</dt>
                <dd>竞价采购</dd>
              </div>
              <div class="overview-card-item">
                <dt>供应商报价方式</dt>
                <dd>报总价</dd>
              </div>
              <div class="overview-card-item">
                <dt>项目名称</dt>
                <dd>{{ roomInfo.projectName || '-' }}</dd>
              </div>
              <div class="overview-card-item">
                <dt>标的名称</dt>
                <dd>{{ roomInfo.targetName || '-' }}</dd>
              </div>
              <div class="overview-card-item">
                <dt>限价(元)</dt>
                <dd>{{ roomInfo.priceLimit || '-' }}</dd>
              </div>
            </dl>

            <!-- 报价记录图表 -->
            <div class="chart-area">
              <div class="section-title">报价记录</div>
              <div v-if="hasTrendData" ref="chartRef" class="quote-chart"></div>
              <div v-else class="chart-placeholder">
                <div class="chart-placeholder-text">暂无报价趋势数据</div>
              </div>
            </div>
          </div>

          <div class="right-overview">
            <div class="countdown-title">距竞价截止时间：</div>

            <div class="countdown-box">
              <div class="time-card">{{ countdown.hours }}</div>
              <span class="time-unit">时</span>
              <div class="time-card">{{ countdown.minutes }}</div>
              <span class="time-unit">分</span>
              <div class="time-card">{{ countdown.seconds }}</div>
              <span class="time-unit">秒</span>
            </div>

            <div class="lowest-price-block">
              <div class="lowest-label">当前最低报价：</div>
              <div class="lowest-value">
                {{ formatMoney(dashboardInfo.currentMinPrice) }}<span class="yuan">元</span>
              </div>
            </div>

            <div class="my-quote-card">
              <div class="rank-badge">
                <div class="rank-text">当前排名</div>
                <div class="rank-num">{{ dashboardInfo.myRank ?? '-' }}</div>
              </div>

              <div class="my-quote-label">我的报价：</div>
              <div class="my-quote-value">
                {{ formatMoney(dashboardInfo.myQuotePrice) }}<span class="yuan">元</span>
              </div>

              <div class="quote-action-row">
                <el-button
                  :type="isLeading ? 'success' : 'primary'"
                  class="leading-btn"
                  :disabled="statusText !== '竞价中'"
                  @click="openQuoteDialog"
                >
                  {{ quoteButtonText }}
                </el-button>
                <el-tooltip v-if="!isMobile" placement="top" effect="dark" popper-class="bid-rule-tooltip">
                  <template #content>
                    <div class="bid-rule-tip">
                      <div>1. 竞价开始后、结束前可进行报价。</div>
                      <div>2. 报价金额必须大于 0。</div>
                      <div>3. 新报价需低于当前最低报价。</div>
                      <div>4. {{ delayRuleText }}</div>
                      <div>5. 竞价结束后不可继续报价。</div>
                    </div>
                  </template>
                  <el-icon class="rule-tip-icon">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
                <el-icon v-else class="rule-tip-icon" @click="showBidRules">
                  <QuestionFilled />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧首次报价/报价动态 -->
      <div class="side-panel panel">
        <div
          class="side-title"
          :class="{ 'side-title--clickable': isMobile }"
          @click="toggleSidePanel"
        >
          <span>{{ isMobile ? '首次报价与动态' : '首次报价' }}</span>
          <el-icon v-if="isMobile" class="side-toggle-icon" :class="{ expanded: sidePanelOpen }">
            <ArrowDown />
          </el-icon>
        </div>

        <div v-show="!isMobile || sidePanelOpen" class="side-panel-body">
        <table class="first-quote-table">
          <thead>
          <tr>
            <th>报价(元)</th>
            <th>报价时间</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ formatMoney(dashboardInfo.firstQuotePrice) }}</td>
            <td>{{ formatDateTime(dashboardInfo.firstQuoteTime) }}</td>
          </tr>
          </tbody>
        </table>

        <div class="quote-log">
          <template v-if="(dashboardInfo.latestQuoteLogs ?? []).length > 0">
            <div
              class="quote-item"
              v-for="(item, index) in (dashboardInfo.latestQuoteLogs ?? [])"
              :key="index"
            >
              <div class="quote-text">
                {{ item.text || '有新的报价' }}
              </div>
              <div class="quote-time">
                {{ formatDateTime(item.time) }}
              </div>
            </div>
          </template>

          <div v-else class="quote-item">
            <div class="quote-text">暂无报价动态</div>
            <div class="quote-time">--</div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- 移动端吸底报价栏 -->
    <div class="mobile-quote-bar">
      <div class="mobile-quote-info">
        <span class="mobile-quote-rank">排名 {{ dashboardInfo.myRank ?? '-' }}</span>
        <span class="mobile-quote-mine">我的 {{ formatMoney(dashboardInfo.myQuotePrice) }} 元</span>
      </div>
      <div class="mobile-quote-actions">
        <el-button
          :type="isLeading ? 'success' : 'primary'"
          class="mobile-quote-btn"
          :disabled="statusText !== '竞价中'"
          @click="openQuoteDialog"
        >
          {{ quoteButtonText }}
        </el-button>
        <el-icon class="rule-tip-icon" @click="showBidRules">
          <QuestionFilled />
        </el-icon>
      </div>
    </div>

    <!-- 报价弹窗 -->
    <el-dialog
      v-model="quoteDialogVisible"
      title="供应商报价"
      :width="quoteDialogWidth"
      :fullscreen="isMobile"
      :close-on-click-modal="false"
      class="quote-dialog"
    >
      <el-form
        ref="quoteFormRef"
        :model="quoteForm"
        :rules="quoteRules"
        :label-width="isMobile ? undefined : '90px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="报价金额" prop="quotePrice">
          <el-input
            v-model="quoteForm.quotePrice"
            placeholder="请输入报价"
            clearable
            inputmode="decimal"
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="quoteForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="quoteDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="quoteSubmitting"
          @click="handleSubmitQuote"
        >
          确定报价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SupplierBidRoom'
})

import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowDown, QuestionFilled } from '@element-plus/icons-vue'
import { useWebSocket } from '@vueuse/core'
import * as echarts from 'echarts'

import { useRoute, useRouter } from 'vue-router'
import { useDevice } from '@/composables/useDevice'
import { getWsUrl } from '@/utils/auth'
import { RoomApi, type SupplierRoomResult } from '@/api/bid/room'
import { SupplierQuoteApi } from '@/api/bid/quote'
import { formatDelayRuleText, formatMaxDelayTimes } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { isMobile } = useDevice()

const goBack = () => router.back()
const roomId = Number(route.query.id || 0)

const sidePanelOpen = ref(false)
const quoteDialogWidth = computed(() => (isMobile.value ? '92%' : '420px'))

const loading = ref(false)
const dashboardRefreshing = ref(false)

const countdownTimer = ref<number | null>(null)

const quoteDialogVisible = ref(false)
const quoteSubmitting = ref(false)
const quoteFormRef = ref<FormInstance>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const currentTime = ref(Date.now())
let timer: any = null

const quoteForm = reactive({
  roomId,
  quotePrice: '',
  remark: ''
})

const quoteRules: FormRules = {
  quotePrice: [
    { required: true, message: '请输入报价金额', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        const num = Number(value)

        if (value === '' || value === null || value === undefined) {
          callback(new Error('请输入报价金额'))
          return
        }
        if (Number.isNaN(num)) {
          callback(new Error('报价金额必须为数字'))
          return
        }
        if (num <= 0) {
          callback(new Error('报价金额必须大于0'))
          return
        }

        callback()
      },
      trigger: 'blur'
    }
  ]
}

const roomInfo = reactive({
  id: undefined as number | undefined,
  projectId: undefined as number | undefined,
  projectName: '',
  targetId: undefined as number | undefined,
  targetName: '',
  name: '',
  code: '',
  status: undefined as number | undefined,
  startTime: '',
  endTime: '',
  creatorId: undefined as number | undefined,
  creatorName: '',
  createTime: '',
  priceLimit: undefined as number | undefined,
  autoDelayEnabled: undefined as number | undefined,
  delayTriggerMinutes: undefined as number | undefined,
  delayMinutes: undefined as number | undefined,
  maxDelayTimes: undefined as number | undefined
})

const delayRuleText = computed(() => formatDelayRuleText(roomInfo))

const dashboardInfo = reactive({
  currentMinPrice: null as number | string | null,
  currentMinSupplierName: '',
  myQuotePrice: null as number | string | null,
  myRank: null as number | null,
  leading: false,
  firstQuotePrice: null as number | string | null,
  firstQuoteTime: '',
  latestQuoteLogs: [] as Array<{ text?: string; time?: number | string }>,
  quoteTrends: [] as Array<{ time?: string; price?: number | string }>,
  endTime: '',
  currentDelayTimes: null as number | null,
  quoteCount: null as number | null
})

const resultInfo = reactive<SupplierRoomResult>({
  resultStatus: undefined,
  won: false
})

const countdown = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00'
})

/** ==================== WebSocket ==================== */
const wsServer = ref(getWsUrl())

const {
  data: wsData,
  close: closeWs,
  open: openWs
} = useWebSocket(wsServer.value, {
  autoReconnect: true,
  heartbeat: true
})

const BID_WS_MESSAGE_TYPE = {
  ROOM_NEW_QUOTE: 'bid-room-new-quote',
  ROOM_STATUS_CHANGED: 'bid-room-status-changed',
  ROOM_DELAY: 'bid-room-delay',
  ROOM_ENDED: 'bid-room-ended'
}

watchEffect(async () => {
  if (!wsData.value) return

  try {
    if (wsData.value === 'pong') {
      return
    }

    const jsonMessage = JSON.parse(wsData.value)
    const type = jsonMessage.type
    const content =
      typeof jsonMessage.content === 'string'
        ? JSON.parse(jsonMessage.content)
        : jsonMessage.content

    if (!type) {
      return
    }

    // 只处理当前竞价室消息
    if (content?.roomId && Number(content.roomId) !== roomId) {
      return
    }

    // 新报价
    if (type === BID_WS_MESSAGE_TYPE.ROOM_NEW_QUOTE) {
      handleWsNewQuote(content)
      return
    }

    if (type === BID_WS_MESSAGE_TYPE.ROOM_DELAY) {
      handleWsDelay(content)
      return
    }
  } catch (error) {
    console.error('WebSocket 消息处理异常', error, wsData.value)
  }
})

const handleWsNewQuote = async (content: any) => {
  // 1. 更新最低价
  if (content.currentLowestPrice !== null && content.currentLowestPrice !== undefined) {
    dashboardInfo.currentMinPrice = content.currentLowestPrice
  }

  // 2. 插入报价动态
  if (!Array.isArray(dashboardInfo.latestQuoteLogs)) {
    dashboardInfo.latestQuoteLogs = []
  }
  dashboardInfo.latestQuoteLogs.unshift({
    text: `有新的报价，报价为 ${formatMoney(content.quotePrice)} 元`,
    time: content.quoteTime || new Date().getTime()
  })

  if (dashboardInfo.latestQuoteLogs.length > 20) {
    dashboardInfo.latestQuoteLogs = dashboardInfo.latestQuoteLogs.slice(0, 20)
  }

  // 3. 更新报价趋势
  if (!Array.isArray(dashboardInfo.quoteTrends)) {
    dashboardInfo.quoteTrends = []
  }
  dashboardInfo.quoteTrends.push({
    time: formatChartTime(content.quoteTime),
    price: content.quotePrice
  })

  // 4. 更新报价总数
  if (content.quoteCount !== null && content.quoteCount !== undefined) {
    dashboardInfo.quoteCount = content.quoteCount
  }

  // 5. 如果后端有自动延时，仪表盘里 endTime 可能变化，所以这里兜底刷新一次
  await loadDashboardSummary()

  // 6. 图表更新
  await updateTrendChart()
}
/** ==================== WebSocket End ==================== */

const statusText = computed(() => {
  const now = currentTime.value
  const start = roomInfo.startTime ? new Date(roomInfo.startTime).getTime() : 0
  const end = roomInfo.endTime ? new Date(roomInfo.endTime).getTime() : 0

  if (!start || !end) return '未知'
  if (now < start) return '未开始'
  if (now >= start && now <= end) return '竞价中'
  return '已结束'
})

const statusTagType = computed(() => {
  switch (statusText.value) {
    case '竞价中':
      return 'success'
    case '未开始':
      return 'warning'
    case '已结束':
      return 'info'
    default:
      return 'info'
  }
})

const isLeading = computed(() => {
  if (dashboardInfo.leading !== null && dashboardInfo.leading !== undefined) {
    return dashboardInfo.leading
  }
  return dashboardInfo.myRank === 1
})

const toggleSidePanel = () => {
  if (!isMobile.value) return
  sidePanelOpen.value = !sidePanelOpen.value
}

const showBidRules = () => {
  ElMessageBox.alert(
    [
      '1. 竞价开始后、结束前可进行报价。',
      '2. 报价金额必须大于 0。',
      '3. 新报价需低于当前最低报价。',
      `4. ${delayRuleText.value}`,
      '5. 竞价结束后不可继续报价。'
    ].join('\n'),
    '报价规则',
    { confirmButtonText: '知道了' }
  )
}

const quoteButtonText = computed(() => {
  if (statusText.value !== '竞价中') {
    return isMobile.value ? '不可报价' : '当前不可报价'
  }
  if (isMobile.value) {
    return isLeading.value ? '再次报价' : '立即报价'
  }
  return isLeading.value ? '正在领先中 · 再次报价' : '暂未领先 · 立即报价'
})

const hasTrendData = computed(() => {
  return Array.isArray(dashboardInfo.quoteTrends) && dashboardInfo.quoteTrends.length > 0
})

const formatDateTime = (value?: string | number | Date) => {
  if (!value && value !== 0) return '--'

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return String(value).replace('T', ' ')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/** 折线图横轴：仅显示时分秒，与后端 quoteTrends 一致 */
const formatChartTime = (value?: string | number | Date) => {
  if (!value && value !== 0) return '--'
  const date = new Date(value)
  if (!isNaN(date.getTime())) {
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${hour}:${minute}:${second}`
  }
  const str = String(value)
  const spaceIdx = str.indexOf(' ')
  if (spaceIdx > -1) return str.slice(spaceIdx + 1)
  return str
}

const formatMoney = (value: any) => {
  if (value === null || value === undefined || value === '') return '--'
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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

const updateCountdown = () => {
  if (!roomInfo.endTime) {
    countdown.hours = '00'
    countdown.minutes = '00'
    countdown.seconds = '00'
    return
  }

  const end = new Date(roomInfo.endTime).getTime()
  const now = Date.now()
  let diff = end - now

  if (diff <= 0) {
    countdown.hours = '00'
    countdown.minutes = '00'
    countdown.seconds = '00'
    handleRoomEnded()
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  diff %= 1000 * 60 * 60
  const minutes = Math.floor(diff / (1000 * 60))
  diff %= 1000 * 60
  const seconds = Math.floor(diff / 1000)

  countdown.hours = String(hours).padStart(2, '0')
  countdown.minutes = String(minutes).padStart(2, '0')
  countdown.seconds = String(seconds).padStart(2, '0')
}

const initChart = async () => {
  await nextTick()

  if (!chartRef.value) return
  if (chartInstance) return

  chartInstance = echarts.init(chartRef.value)
}

const updateTrendChart = async () => {
  await nextTick()

  const rawList = Array.isArray(dashboardInfo.quoteTrends) ? dashboardInfo.quoteTrends : []

  if (!rawList.length) {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    return
  }

  await initChart()
  if (!chartInstance) return

  const trendList = rawList
  const xData = trendList.map(item => item.time || '--')
  const yData = trendList.map(item => {
    const num = Number(item.price)
    return Number.isNaN(num) ? 0 : num
  })

  chartInstance.setOption(
    {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e6e8eb',
        borderWidth: 1,
        textStyle: {
          color: '#303133',
          fontSize: 13
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;',
        formatter(params: any) {
          const item = params?.[0]
          if (!item) return ''
          return `
            <div style="line-height: 1.8;">
              <div>时间：${item.axisValue}</div>
              <div>报价：${formatMoney(item.data)} 元</div>
            </div>
          `
        }
      },
      grid: {
        left: isMobile.value ? 48 : 70,
        right: isMobile.value ? 16 : 30,
        top: 35,
        bottom: isMobile.value ? 32 : 45
      },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#dcdfe6'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#606266',
          fontSize: 12,
          rotate: xData.length > 8 ? 25 : 0
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: '报价(元)',
        nameTextStyle: {
          color: '#606266',
          fontSize: 12,
          padding: [0, 0, 8, 0]
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#606266',
          fontSize: 12,
          formatter(value: number) {
            return Number(value).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f2f5',
            type: 'solid'
          }
        }
      },
      series: [
        {
          name: '报价',
          type: 'line',
          data: yData,
          smooth: false,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: true,
          lineStyle: {
            color: '#409eff',
            width: 3
          },
          itemStyle: {
            color: '#409eff',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.18)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          },
          label: {
            show: false
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 10,
            data: yData.length
              ? [
                {
                  coord: [xData[xData.length - 1], yData[yData.length - 1]],
                  value: formatMoney(yData[yData.length - 1])
                }
              ]
              : [],
            label: {
              show: true,
              color: '#303133',
              fontSize: 13,
              formatter(param: any) {
                return `${param.value}`
              },
              offset: [0, -18]
            },
            itemStyle: {
              color: '#409eff',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        }
      ]
    },
    true
  )
}

const handleResize = () => {
  chartInstance?.resize()
}

const loadRoomInfo = async () => {
  const roomRes = await RoomApi.getRoom(roomId)
  Object.assign(roomInfo, roomRes || {})
  updateCountdown()
}

const loadDashboardData = async (showError = false) => {
  if (!roomId) return
  if (dashboardRefreshing.value) return

  dashboardRefreshing.value = true
  try {
    const dashboardRes = await RoomApi.getRoomDashboard(roomId)
    Object.assign(dashboardInfo, dashboardRes || {})

    if (dashboardRes?.endTime) {
      roomInfo.endTime = dashboardRes.endTime
    }

    await updateTrendChart()

    if (statusText.value !== '竞价中') {
      await handleRoomEnded()
    }
  } catch (error) {
    console.error('加载竞价室面板数据失败', error)
    if (showError) {
      ElMessage.error('加载竞价数据失败')
    }
  } finally {
    dashboardRefreshing.value = false
  }
}

const loadRoomResult = async () => {
  if (!roomId) return
  try {
    const res = await RoomApi.getRoomResult(roomId)
    Object.assign(resultInfo, res || {})
  } catch (error) {
    console.error('加载竞价结果失败', error)
  }
}

const loadPageData = async () => {
  if (!roomId) {
    ElMessage.error('竞价室ID不能为空')
    return
  }

  loading.value = true
  try {
    await loadRoomInfo()
    await loadDashboardData(true)
  } finally {
    loading.value = false
  }
}

const startCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }

  countdownTimer.value = window.setInterval(() => {
    updateCountdown()
  }, 1000)
}

const openQuoteDialog = () => {
  if (!roomId) {
    ElMessage.warning('竞价室ID不能为空')
    return
  }

  if (statusText.value !== '竞价中') {
    ElMessage.warning('当前竞价室不在竞价中，无法报价')
    return
  }

  quoteForm.roomId = roomId
  quoteForm.quotePrice = ''
  quoteForm.remark = ''
  quoteDialogVisible.value = true
}

const handleSubmitQuote = async () => {
  if (!quoteFormRef.value) return

  await quoteFormRef.value.validate()

  const quotePriceNum = Number(quoteForm.quotePrice)

  if (
    dashboardInfo.currentMinPrice !== null &&
    dashboardInfo.currentMinPrice !== undefined &&
    dashboardInfo.currentMinPrice !== ''
  ) {
    const currentMin = Number(dashboardInfo.currentMinPrice)
    if (!Number.isNaN(currentMin) && quotePriceNum >= currentMin) {
      ElMessage.warning('报价必须低于当前最低报价')
      return
    }
  }

  quoteSubmitting.value = true
  try {
    await SupplierQuoteApi.createSupplierQuoteBySupplier({
      roomId: quoteForm.roomId,
      quotePrice: quotePriceNum,
      remark: quoteForm.remark
    })

    ElMessage.success('报价成功')
    quoteDialogVisible.value = false
  } catch (error) {
    console.error('报价失败', error)
  } finally {
    quoteSubmitting.value = false
  }
}

const hasEndNotified = ref(false)
const handleRoomEnded = async () => {
  if (hasEndNotified.value) return
  hasEndNotified.value = true

  quoteDialogVisible.value = false
  await loadRoomResult()

  await ElMessageBox.alert(resultInfo.resultText || '当前竞价室已结束，无法继续报价。', '竞价结束', {
    confirmButtonText: '确定',
    type: 'warning'
  })
}

const loadDashboardSummary = async () => {
  const res = await RoomApi.getRoomDashboard(roomId)

  dashboardInfo.myQuotePrice = res.myQuotePrice
  dashboardInfo.myRank = res.myRank
  dashboardInfo.leading = res.leading
  dashboardInfo.firstQuotePrice = res.firstQuotePrice
  dashboardInfo.firstQuoteTime = res.firstQuoteTime

  if (res.currentMinPrice !== null && res.currentMinPrice !== undefined) {
    dashboardInfo.currentMinPrice = res.currentMinPrice
  }

  if (res.quoteCount !== null && res.quoteCount !== undefined) {
    dashboardInfo.quoteCount = res.quoteCount
  }

  if (res.currentDelayTimes !== null && res.currentDelayTimes !== undefined) {
    dashboardInfo.currentDelayTimes = res.currentDelayTimes
  }
}

const handleWsDelay = async (content: any) => {
  const oldEndTime = roomInfo.endTime
  const newEndTime = content.newEndTime || content.endTime

  if (newEndTime) {
    roomInfo.endTime = newEndTime
    dashboardInfo.endTime = newEndTime
  }

  if (content?.currentDelayTimes !== null && content?.currentDelayTimes !== undefined) {
    dashboardInfo.currentDelayTimes = content.currentDelayTimes
  }

  if (oldEndTime && newEndTime && oldEndTime !== newEndTime) {
    ElMessage.warning(`有新报价触发延时，竞价结束时间已顺延至 ${formatDateTime(newEndTime)}`)
  }

  await loadDashboardSummary()
}

onMounted(async () => {
  await loadPageData()
  startCountdown()
  openWs()
  window.addEventListener('resize', handleResize)

  timer = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

watch(isMobile, () => {
  nextTick(() => {
    handleResize()
    if (hasTrendData.value) {
      updateTrendChart()
    }
  })
})

onBeforeUnmount(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }

  closeWs()

  window.removeEventListener('resize', handleResize)

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  clearInterval(timer)
})
</script>

<style scoped lang="scss">
@use '@/styles/breakpoints.scss' as *;

.bid-room-page {
  min-height: calc(100vh - 68px);
  background: var(--sp-bg-page);
  color: var(--sp-text-primary);
}

.mobile-quote-bar {
  display: none;
}

.overview-cards {
  display: none;
}

.room-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 28px;
  background: linear-gradient(180deg, #fff 0%, #fafcfe 100%);
  border-bottom: 1px solid var(--sp-border);
  box-shadow: var(--sp-shadow-sm);
}

.room-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.content-wrap {
  display: flex;
  gap: 16px;
  padding: 16px 20px 24px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
  width: 100%;
  max-width: 1520px;
  margin: 0 auto;
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-panel {
  width: 420px;
  flex-shrink: 0;
  padding: 16px;
}

.panel {
  background: #fff;
  border: 1px solid var(--sp-border);
  border-radius: var(--sp-radius);
  box-shadow: var(--sp-shadow-sm);
}

.header-panel {
  padding: 16px 20px;
}

.delay-tip {
  margin-top: 12px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--sp-text-secondary);
  background: var(--sp-bg-soft, #f5f7fa);
  border-radius: 6px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.result-summary {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #ebeef5;
}

.result-text {
  color: #e6a23c;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  color: #606266;
  font-size: 14px;
}

.status-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.status-value {
  color: #0d6b8f;
  font-weight: 700;
}

.time-range {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.divider {
  margin: 0 8px;
  color: #c0c4cc;
}

.overview-panel {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.left-overview {
  flex: 1;
}

.right-overview {
  width: 420px;
  flex-shrink: 0;
}

.section-title,
.side-title,
.countdown-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.side-title--clickable {
  cursor: pointer;
  user-select: none;
}

.side-toggle-icon {
  transition: transform 0.2s;
  color: #909399;

  &.expanded {
    transform: rotate(180deg);
  }
}

.rule-tip-icon {
  color: #909399;
  cursor: pointer;
  font-size: 18px;
  transition: color 0.2s;
}

.rule-tip-icon:hover {
  color: #0d6b8f;
}

:global(.bid-rule-tooltip) {
  max-width: 360px;
}

.bid-rule-tip {
  line-height: 1.8;
  white-space: nowrap;
}

.overview-table,
.first-quote-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.overview-table th,
.overview-table td,
.first-quote-table th,
.first-quote-table td {
  border: 1px solid #ebeef5;
  padding: 10px 8px;
  text-align: center;
  font-size: 13px;
  color: #606266;
}

.overview-table th,
.first-quote-table th {
  color: #303133;
  font-weight: 600;
  background: #fafafa;
}

.chart-area {
  margin-top: 24px;
}

.chart-placeholder {
  height: 280px;
  border: 1px dashed #dcdfe6;
  background: #fafafa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder-text {
  font-size: 14px;
  color: #909399;
}

.countdown-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 24px;
}

.time-card {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--sp-brand-primary) 0%, var(--sp-brand-secondary) 100%);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--sp-shadow-sm);
}

.time-unit {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
}

.lowest-price-block {
  margin-bottom: 24px;
}

.lowest-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.lowest-value {
  font-size: 36px;
  color: var(--sp-brand-accent);
  font-weight: 800;
}

.yuan {
  font-size: 16px;
  margin-left: 4px;
  color: #909399;
}

.my-quote-card {
  position: relative;
  background: linear-gradient(135deg, #f5faff 0%, #fff 100%);
  border: 1px solid rgba(13, 107, 143, 0.2);
  border-radius: var(--sp-radius);
  padding: 24px 20px 28px;
  min-height: 260px;
}

.rank-badge {
  position: absolute;
  top: 0;
  right: 16px;
  width: 52px;
  background: linear-gradient(180deg, var(--sp-brand-accent) 0%, #a68520 100%);
  color: #fff;
  text-align: center;
  padding: 8px 0 10px;
  clip-path: polygon(0 0, 100% 0, 100% 86%, 50% 100%, 0 86%);
}

.rank-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.rank-num {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-top: 4px;
}

.my-quote-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.my-quote-value {
  font-size: 36px;
  font-weight: 700;
  color: #0d4d85;
  margin-bottom: 16px;
  word-break: break-all;
}

.quote-action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.leading-btn {
  width: 100%;
  max-width: 280px;
  height: 40px;
  font-size: 15px;
}

.quote-log {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}

.quote-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
  border-bottom: 1px dashed #ebeef5;
  padding-bottom: 10px;
}

.quote-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quote-time {
  width: 148px;
  text-align: right;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  white-space: nowrap;
}

@media screen and (max-width: 1200px) {
  .content-wrap {
    flex-direction: column;
  }

  .overview-panel {
    flex-direction: column;
  }

  .right-overview {
    width: 100%;
  }

  .side-panel {
    width: 100%;
  }

  .quote-text {
    white-space: normal;
  }
}

.quote-chart {
  width: 100%;
  height: 280px;
}

@include sp-mobile {
  .bid-room-page {
    min-height: calc(100vh - 56px);
    padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  }

  .room-toolbar {
    padding: 10px 12px;
    gap: 8px;
  }

  .room-title {
    font-size: 15px;
  }

  .content-wrap {
    padding: 12px 12px 16px;
    gap: 12px;
    min-height: auto;
  }

  .header-panel,
  .overview-panel,
  .side-panel {
    padding: 14px 12px;
  }

  .status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-range {
    font-size: 13px;
    line-height: 1.6;
  }

  .overview-panel {
    flex-direction: column;
    gap: 16px;
  }

  .right-overview {
    order: -1;
    width: 100%;
  }

  .overview-table--desktop {
    display: none;
  }

  .overview-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 0;
  }

  .overview-card-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    dt {
      flex-shrink: 0;
      margin: 0;
      font-size: 13px;
      color: #909399;
      font-weight: 500;
    }

    dd {
      margin: 0;
      font-size: 13px;
      color: #303133;
      font-weight: 600;
      text-align: right;
      word-break: break-all;
    }
  }

  .countdown-box {
    justify-content: center;
    margin: 12px 0 16px;
  }

  .time-card {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .lowest-value,
  .my-quote-value {
    font-size: 28px;
  }

  .my-quote-card {
    min-height: auto;
    padding: 18px 14px 16px;
  }

  .quote-action-row {
    display: none;
  }

  .chart-area {
    margin-top: 16px;
  }

  .quote-chart,
  .chart-placeholder {
    height: 200px;
  }

  .quote-log {
    max-height: 240px;
  }

  .mobile-quote-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 180;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--sp-border);
    box-shadow: 0 -4px 16px rgba(10, 61, 107, 0.08);
  }

  .mobile-quote-info {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: #606266;
  }

  .mobile-quote-rank {
    font-weight: 600;
    color: var(--sp-brand-primary);
  }

  .mobile-quote-mine {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-quote-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-quote-btn {
    flex: 1;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .quote-chart,
    .chart-placeholder {
      height: 140px;
    }

    .mobile-quote-bar {
      flex-direction: row;
      align-items: center;
      padding-top: 8px;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    }

    .mobile-quote-info {
      flex-direction: column;
      gap: 2px;
      min-width: 88px;
    }

    .mobile-quote-btn {
      height: 40px;
    }

    .my-quote-card {
      padding-bottom: 12px;
    }
  }
}
</style>
