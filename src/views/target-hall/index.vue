<template>
  <div class="page-panel">
    <PageHeader title="标的大厅" description="查看可报名标的，提交报名材料并跟踪审核进度" />

    <div class="filter-panel sp-card">
      <el-form
        :inline="!isMobile"
        :label-position="isMobile ? 'top' : 'right'"
        class="filter-form"
        @submit.prevent
      >
        <el-form-item label="项目名称">
          <el-input
            v-model="queryParams.projectName"
            placeholder="项目名称"
            clearable
            class="filter-input"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="标的名称">
          <el-input
            v-model="queryParams.name"
            placeholder="标的名称"
            clearable
            class="filter-input"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="标的编号">
          <el-input
            v-model="queryParams.code"
            placeholder="标的编号"
            clearable
            class="filter-input"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select v-model="queryParams.signupStatus" placeholder="全部" clearable class="filter-input">
            <el-option label="待审核" :value="10" />
            <el-option label="审核通过" :value="20" />
            <el-option label="审核不通过" :value="30" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-loading="loading" class="target-list">
      <div v-for="item in list" :key="item.id" class="target-card sp-card">
        <div class="card-header">
          <div>
            <div class="target-name">{{ item.name || '--' }}</div>
            <div class="project-name">{{ item.projectName || '--' }}</div>
          </div>
          <el-tag :type="getSignupTagType(item.signupStatus)">
            {{ getSignupStatusText(item.signupStatus) }}
          </el-tag>
        </div>

        <div class="target-desc">{{ item.content || '暂无标的描述' }}</div>

        <el-descriptions :column="descColumn" border size="small" class="info-desc">
          <el-descriptions-item label="标的编号">{{ item.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="限价">{{ formatMoney(item.priceLimit) }} 元</el-descriptions-item>
          <el-descriptions-item label="竞价开始">{{ formatDateTime(item.roomStartTime) }}</el-descriptions-item>
          <el-descriptions-item label="竞价结束">{{ formatDateTime(item.roomEndTime) }}</el-descriptions-item>
        </el-descriptions>

        <el-alert
          v-if="item.auditRemark"
          :title="'审核意见：' + item.auditRemark"
          type="warning"
          :closable="false"
          show-icon
          class="audit-alert"
        />

        <div class="card-actions">
          <el-button v-if="!item.signupStatus" type="primary" @click="openSignup(item)">
            立即报名
          </el-button>
          <el-button v-else-if="item.signupStatus === 10" type="warning" plain disabled>
            审核中
          </el-button>
          <el-button
            v-else-if="item.signupStatus === 30"
            type="primary"
            plain
            @click="openSignup(item)"
          >
            重新报名
          </el-button>
          <el-button v-else type="success" :disabled="!item.roomId" @click="goRoomDetail(item)">
            查看竞价室
          </el-button>
        </div>
      </div>

      <el-empty v-if="!loading && list.length === 0" description="暂无可报名标的" />
    </div>

    <div v-if="total > 0" class="pagination-bar">
      <el-pagination
        v-model:current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        :layout="paginationLayout"
        :small="isMobile"
        background
        @current-change="getList"
      />
    </div>

    <el-dialog
      v-model="signupDialogVisible"
      title="供应商报名"
      :width="signupDialogWidth"
      :fullscreen="isMobile"
      class="signup-dialog"
    >
      <el-form
        ref="signupFormRef"
        :model="signupForm"
        :rules="signupRules"
        :label-width="isMobile ? undefined : '96px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="标的名称">
          <el-input :model-value="currentTarget?.name || '--'" disabled />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="signupForm.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactMobile">
          <el-input
            v-model="signupForm.contactMobile"
            placeholder="请输入联系电话"
            inputmode="tel"
          />
        </el-form-item>
        <el-form-item label="资质附件" prop="qualificationFiles">
          <UploadFile v-model="signupForm.qualificationFiles" :is-show-tip="false" />
        </el-form-item>
        <el-form-item label="报名备注" prop="remark">
          <el-input
            v-model="signupForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可填写供货能力、服务承诺等说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signupDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitSignup">提交报名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { SignupApi, type SupplierTarget } from '@/api/bid/signup'
import { formatDateTime, formatMoney } from '@/utils/format'
import { useDevice } from '@/composables/useDevice'
import UploadFile from '@/components/UploadFile/index.vue'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({ name: 'SupplierTargetHall' })

const router = useRouter()
const { isMobile } = useDevice()

const descColumn = computed(() => (isMobile.value ? 1 : 2))
const signupDialogWidth = computed(() => (isMobile.value ? '92%' : '560px'))
const paginationLayout = computed(() =>
  isMobile.value ? 'total, prev, pager, next' : 'prev, pager, next, total'
)

const loading = ref(false)
const submitting = ref(false)
const list = ref<SupplierTarget[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(8)

const queryParams = reactive({
  projectName: '',
  name: '',
  code: '',
  signupStatus: undefined as number | undefined
})

const signupDialogVisible = ref(false)
const signupFormRef = ref<FormInstance>()
const currentTarget = ref<SupplierTarget | null>(null)
const signupForm = reactive({
  targetId: 0,
  contactName: '',
  contactMobile: '',
  qualificationFiles: '',
  remark: ''
})

const signupRules: FormRules = {
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactMobile: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const getSignupStatusText = (status?: number) => {
  switch (status) {
    case 10:
      return '待审核'
    case 20:
      return '审核通过'
    case 30:
      return '审核不通过'
    default:
      return '未报名'
  }
}

const getSignupTagType = (status?: number) => {
  switch (status) {
    case 10:
      return 'warning'
    case 20:
      return 'success'
    case 30:
      return 'danger'
    default:
      return 'info'
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await SignupApi.getSupplierTargetPage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...queryParams
    })
    list.value = res.list || res.data?.list || []
    total.value = res.total || res.data?.total || 0
  } catch {
    ElMessage.error('获取标的大厅数据失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = async () => {
  pageNo.value = 1
  await getList()
}

const resetQuery = async () => {
  queryParams.projectName = ''
  queryParams.name = ''
  queryParams.code = ''
  queryParams.signupStatus = undefined
  await handleQuery()
}

const openSignup = (item: SupplierTarget) => {
  currentTarget.value = item
  signupForm.targetId = item.id
  signupForm.contactName = ''
  signupForm.contactMobile = ''
  signupForm.qualificationFiles = ''
  signupForm.remark = ''
  signupDialogVisible.value = true
}

const submitSignup = async () => {
  if (!signupFormRef.value) return
  await signupFormRef.value.validate()
  submitting.value = true
  try {
    await SignupApi.submitSignup({ ...signupForm })
    ElMessage.success('报名已提交，请等待审核')
    signupDialogVisible.value = false
    await getList()
  } finally {
    submitting.value = false
  }
}

const goRoomDetail = (item: SupplierTarget) => {
  if (!item.roomId) {
    ElMessage.warning('该标的暂未创建竞价室')
    return
  }
  router.push({ name: 'RoomDetailView', query: { id: item.roomId } })
}

onMounted(getList)
</script>

<style scoped lang="scss">
@use '@/styles/breakpoints.scss' as *;

.page-panel {
  min-height: 100%;
}

.filter-panel {
  margin-bottom: 20px;
  padding: 20px 24px 4px;
}

.filter-input {
  width: 160px;
}

.target-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.target-card {
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--sp-brand-secondary), var(--sp-brand-accent));
    opacity: 0;
    transition: opacity 0.25s;
  }

  &:hover::before {
    opacity: 1;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.target-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-text-primary);
  margin-bottom: 4px;
}

.project-name {
  font-size: 13px;
  color: var(--sp-text-muted);
}

.target-desc {
  margin-bottom: 14px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--sp-text-secondary);
  min-height: 44px;
}

.info-desc {
  margin-bottom: 14px;
}

.audit-alert {
  margin-bottom: 14px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.pagination-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@include sp-tablet-down {
  .target-list {
    grid-template-columns: 1fr;
  }
}

@include sp-mobile {
  .filter-panel {
    margin-bottom: 12px;
    padding: 14px 12px 2px;
  }

  .filter-form {
    :deep(.el-form-item) {
      display: block;
      margin-right: 0;
      width: 100%;
    }
  }

  .filter-input {
    width: 100%;
  }

  .filter-actions {
    :deep(.el-form-item__content) {
      display: flex;
      gap: 8px;
    }

    .el-button {
      flex: 1;
      margin: 0;
    }
  }

  .target-list {
    gap: 12px;
  }

  .target-card {
    padding: 14px 14px 16px;

    &::before {
      opacity: 1;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-bottom: 10px;
  }

  .target-name {
    font-size: 16px;
    word-break: break-all;
  }

  .target-desc {
    margin-bottom: 12px;
    min-height: auto;
    font-size: 13px;
  }

  .info-desc {
    margin-bottom: 12px;

    :deep(.el-descriptions__label),
    :deep(.el-descriptions__content) {
      font-size: 12px;
    }
  }

  .audit-alert {
    margin-bottom: 12px;
  }

  .card-actions {
    flex-direction: column;
    gap: 8px;
    padding-top: 0;

    .el-button {
      width: 100%;
      margin: 0;
    }
  }

  .pagination-bar {
    margin-top: 16px;
    padding-bottom: 4px;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 4px;
    }
  }
}
</style>
