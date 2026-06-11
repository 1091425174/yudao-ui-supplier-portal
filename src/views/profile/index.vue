<template>
  <div class="page-panel" v-loading="loading">
    <PageHeader title="个人中心" description="查看账号与企业信息，快速进入业务功能" />

    <div class="profile-grid">
      <section class="info-card sp-card">
        <h3 class="card-title">账号信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="登录账号">{{ user.username || '--' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ user.nickname || '--' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ user.mobile || '--' }}</el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ user.id || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="info-card sp-card">
        <h3 class="card-title">企业信息</h3>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          class="enterprise-tip"
          title="企业名称、资质状态等详细信息将在后续版本开放，当前仅展示关联标识。"
        />
        <el-descriptions :column="1" border>
          <el-descriptions-item label="供应商 ID">{{ user.supplierId ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">待接入</el-descriptions-item>
          <el-descriptions-item label="审核状态">待接入</el-descriptions-item>
        </el-descriptions>
      </section>
    </div>

    <section class="business-section">
      <h3 class="section-title">我的业务</h3>
      <div class="shortcut-grid">
        <div class="shortcut-card sp-card" @click="router.push('/target-hall')">
          <div class="shortcut-icon target">
            <el-icon><Document /></el-icon>
          </div>
          <div class="shortcut-body">
            <div class="shortcut-name">我的报名</div>
            <div class="shortcut-desc">查看可报名标的，提交材料并跟踪审核进度</div>
          </div>
          <el-icon class="shortcut-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="shortcut-card sp-card" @click="router.push('/trade-hall')">
          <div class="shortcut-icon trade">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="shortcut-body">
            <div class="shortcut-name">我的竞价</div>
            <div class="shortcut-desc">查看进行中与历史竞价项目，进入竞价室参与报价</div>
          </div>
          <el-icon class="shortcut-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, DataLine, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useUserStoreWithOut } from '@/store/user'

defineOptions({ name: 'SupplierProfile' })

const router = useRouter()
const userStore = useUserStoreWithOut()
const loading = ref(false)

const user = computed(() => userStore.getUser)

onMounted(async () => {
  loading.value = true
  try {
    await userStore.setUserInfoAction()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.page-panel {
  min-height: 100%;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.info-card {
  padding: 24px 28px;
}

.card-title {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-text-primary);
}

.enterprise-tip {
  margin-bottom: 16px;
}

.business-section {
  margin-top: 4px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: var(--sp-text-primary);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);

    .shortcut-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  flex-shrink: 0;

  &.target {
    background: linear-gradient(135deg, #0d6b8f, #0a4a80);
  }

  &.trade {
    background: linear-gradient(135deg, #c9a227, #a68520);
  }
}

.shortcut-body {
  flex: 1;
  min-width: 0;
}

.shortcut-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--sp-text-primary);
  margin-bottom: 6px;
}

.shortcut-desc {
  font-size: 13px;
  color: var(--sp-text-secondary);
  line-height: 1.6;
}

.shortcut-arrow {
  color: var(--sp-text-muted);
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .profile-grid,
  .shortcut-grid {
    grid-template-columns: 1fr;
  }
}
</style>
