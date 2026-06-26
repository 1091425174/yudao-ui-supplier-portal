<template>
  <div class="page-panel" v-loading="loading">
    <PageHeader
      v-if="!isMobile"
      title="个人中心"
      description="查看与维护账号、企业信息，快速进入业务功能"
    >
      <template #extra>
        <el-button @click="openPasswordDialog">修改密码</el-button>
        <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</el-button>
      </template>
    </PageHeader>

    <div v-if="isMobile" class="mobile-profile-hero sp-card">
      <div class="hero-main">
        <div class="hero-avatar">{{ avatarText }}</div>
        <div class="hero-text">
          <div class="hero-name">{{ displayName }}</div>
          <div class="hero-sub">{{ user.supplierName || '暂无企业名称' }}</div>
          <div class="hero-tags">
            <el-tag size="small" :type="user.status === 0 ? 'success' : 'danger'">
              {{ user.status === 0 ? '账号正常' : '账号禁用' }}
            </el-tag>
            <el-tag size="small" :type="getSupplierStatusType(user.supplierStatus)">
              {{ getSupplierStatusText(user.supplierStatus) }}
            </el-tag>
          </div>
        </div>
      </div>
      <el-button link type="primary" class="hero-link-btn" @click="openPasswordDialog">
        修改密码
      </el-button>
    </div>

    <div class="profile-grid">
      <section class="info-card sp-card">
        <h3 class="card-title">账号信息</h3>

        <template v-if="isMobile">
          <dl class="profile-info-list">
            <div class="profile-info-item">
              <dt>登录账号</dt>
              <dd>{{ user.username || '--' }}</dd>
            </div>
            <div class="profile-info-item">
              <dt>最后登录</dt>
              <dd>{{ formatDateTime(user.loginDate) }}</dd>
            </div>
          </dl>

          <div class="profile-edit-block">
            <div class="edit-block-title">可编辑资料</div>
            <el-form :model="profileForm" label-position="top" class="mobile-edit-form">
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input
                  v-model="profileForm.mobile"
                  placeholder="请输入手机号"
                  inputmode="tel"
                />
              </el-form-item>
            </el-form>
          </div>
        </template>

        <el-form v-else :model="profileForm" label-width="88px">
          <el-form-item label="登录账号">
            <el-input :model-value="user.username" disabled />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="profileForm.mobile" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="账号状态">
            <el-tag :type="user.status === 0 ? 'success' : 'danger'">
              {{ user.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </el-form-item>
          <el-form-item label="最后登录">
            <span class="login-date">{{ formatDateTime(user.loginDate) }}</span>
          </el-form-item>
        </el-form>
      </section>

      <section class="info-card sp-card">
        <h3 class="card-title">企业信息</h3>

        <dl v-if="isMobile" class="profile-info-list">
          <div class="profile-info-item">
            <dt>企业名称</dt>
            <dd>{{ user.supplierName || '--' }}</dd>
          </div>
          <div class="profile-info-item">
            <dt>企业编号</dt>
            <dd>{{ user.supplierCode || '--' }}</dd>
          </div>
          <div class="profile-info-item">
            <dt>审核状态</dt>
            <dd>
              <el-tag size="small" :type="getSupplierStatusType(user.supplierStatus)">
                {{ getSupplierStatusText(user.supplierStatus) }}
              </el-tag>
            </dd>
          </div>
          <div class="profile-info-item">
            <dt>联系人</dt>
            <dd>{{ user.contactPerson || '--' }}</dd>
          </div>
          <div class="profile-info-item">
            <dt>联系电话</dt>
            <dd>{{ user.contactPhone || '--' }}</dd>
          </div>
          <div class="profile-info-item">
            <dt>供应商 ID</dt>
            <dd>{{ user.supplierId ?? '--' }}</dd>
          </div>
        </dl>

        <el-descriptions v-else :column="1" border class="enterprise-desc">
          <el-descriptions-item label="企业名称">{{ user.supplierName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="企业编号">{{ user.supplierCode || '--' }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getSupplierStatusType(user.supplierStatus)">
              {{ getSupplierStatusText(user.supplierStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ user.contactPerson || '--' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ user.contactPhone || '--' }}</el-descriptions-item>
          <el-descriptions-item label="供应商 ID">{{ user.supplierId ?? '--' }}</el-descriptions-item>
        </el-descriptions>

        <div class="enterprise-tip">
          企业档案由采购方维护，供应商门户仅展示，暂不支持自行修改。
        </div>
      </section>
    </div>

    <section class="business-section">
      <h3 class="section-title sp-section-title">我的业务</h3>
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

    <div class="mobile-action-bar">
      <el-button
        type="primary"
        class="mobile-save-btn"
        :loading="savingProfile"
        @click="saveProfile"
      >
        保存资料
      </el-button>
    </div>

    <el-dialog
      v-model="passwordVisible"
      title="修改密码"
      :width="passwordDialogWidth"
      :close-on-click-modal="false"
      align-center
      class="password-dialog"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        :label-width="isMobile ? undefined : '88px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPassword" @click="submitPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ArrowRight, DataLine, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { updatePassword, updateProfile } from '@/api/login'
import { formatDateTime } from '@/utils/format'
import { useDevice } from '@/composables/useDevice'
import { useUserStoreWithOut } from '@/store/user'

defineOptions({ name: 'SupplierProfile' })

const router = useRouter()
const userStore = useUserStoreWithOut()
const { isMobile } = useDevice()

const passwordDialogWidth = computed(() => (isMobile.value ? '360px' : '420px'))

const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const passwordVisible = ref(false)
const passwordFormRef = ref<FormInstance>()

const user = computed(() => userStore.getUser)
const displayName = computed(
  () => user.value.nickname || user.value.username || '供应商用户'
)
const avatarText = computed(() => {
  const name = displayName.value.trim()
  return name ? name.charAt(0).toUpperCase() : '供'
})

const profileForm = reactive({
  nickname: '',
  mobile: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 4, max: 16, message: '密码长度为 4-16 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const getSupplierStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return '禁用'
    case 1:
      return '正常'
    case 2:
      return '审核中'
    case 3:
      return '审核失败'
    default:
      return '--'
  }
}

const getSupplierStatusType = (status?: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

const syncProfileForm = () => {
  profileForm.nickname = user.value.nickname || ''
  profileForm.mobile = user.value.mobile || ''
}

const loadUser = async () => {
  loading.value = true
  try {
    await userStore.setUserInfoAction()
    syncProfileForm()
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  savingProfile.value = true
  try {
    await updateProfile({ ...profileForm })
    await userStore.setUserInfoAction()
    syncProfileForm()
    ElMessage.success('资料已保存')
  } finally {
    savingProfile.value = false
  }
}

const openPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

const submitPassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate()
  savingPassword.value = true
  try {
    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    passwordVisible.value = false
    await userStore.loginOutAction()
    router.replace('/login')
  } finally {
    savingPassword.value = false
  }
}

onMounted(loadUser)
</script>

<style scoped lang="scss">
@use '@/styles/breakpoints.scss' as *;

.page-panel {
  min-height: 100%;
}

.mobile-profile-hero,
.mobile-action-bar {
  display: none;
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

.login-date {
  color: var(--sp-text-secondary);
  word-break: break-all;
}

.enterprise-tip {
  margin-top: 16px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--sp-text-secondary);
  background: rgba(13, 107, 143, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(13, 107, 143, 0.1);
}

.business-section {
  margin-top: 4px;
}

.section-title {
  margin: 0 0 16px;
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

@include sp-tablet-down {
  .profile-grid,
  .shortcut-grid {
    grid-template-columns: 1fr;
  }
}

@include sp-mobile {
  .page-panel {
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-profile-hero {
    display: block;
    margin-bottom: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #fff 0%, #f5faff 100%);
    border: 1px solid rgba(13, 107, 143, 0.12);
  }

  .hero-main {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .hero-avatar {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, var(--sp-brand-secondary), var(--sp-brand-primary));
    box-shadow: var(--sp-shadow-sm);
  }

  .hero-text {
    flex: 1;
    min-width: 0;
  }

  .hero-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--sp-text-primary);
    line-height: 1.3;
    word-break: break-all;
  }

  .hero-sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--sp-text-muted);
    line-height: 1.4;
    word-break: break-all;
  }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .hero-link-btn {
    width: 100%;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--sp-border);
    justify-content: center;
    font-weight: 600;
  }

  .profile-grid {
    gap: 12px;
    margin-bottom: 16px;
  }

  .info-card {
    padding: 0;
    overflow: hidden;
  }

  .card-title {
    margin: 0;
    padding: 14px 14px 10px;
    font-size: 15px;
    border-bottom: 1px solid var(--sp-border);
    background: linear-gradient(180deg, #fafcfe 0%, #fff 100%);
  }

  .profile-info-list {
    margin: 0;
    padding: 4px 14px 0;
  }

  .profile-info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }

    dt {
      flex-shrink: 0;
      margin: 0;
      font-size: 13px;
      color: var(--sp-text-muted);
      font-weight: 500;
    }

    dd {
      margin: 0;
      font-size: 13px;
      color: var(--sp-text-primary);
      font-weight: 600;
      text-align: right;
      word-break: break-all;
    }
  }

  .profile-edit-block {
    margin: 0 14px 14px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid var(--sp-border);
    border-radius: 10px;
  }

  .edit-block-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--sp-brand-secondary);
  }

  .mobile-edit-form {
    :deep(.el-form-item) {
      margin-bottom: 14px;
    }

    :deep(.el-form-item:last-child) {
      margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
      padding-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--sp-text-secondary);
    }
  }

  .enterprise-tip {
    margin: 0 14px 14px;
    font-size: 12px;
  }

  .business-section {
    margin-top: 0;
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 16px;
  }

  .shortcut-grid {
    gap: 10px;
  }

  .shortcut-card {
    padding: 14px;
    border: 1px solid var(--sp-border);
    border-radius: var(--sp-radius);
    background: #fff;

    &:hover {
      transform: none;
    }
  }

  .shortcut-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 18px;
  }

  .shortcut-name {
    font-size: 15px;
    margin-bottom: 2px;
  }

  .shortcut-desc {
    font-size: 12px;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .shortcut-arrow {
    opacity: 0.65;
    color: var(--sp-brand-secondary);
  }

  .mobile-action-bar {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 180;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--sp-border);
    box-shadow: 0 -4px 16px rgba(10, 61, 107, 0.08);
  }

  .mobile-save-btn {
    width: 100%;
    height: 44px;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
  }

  :deep(.password-dialog) {
    max-width: calc(100vw - 32px);
    border-radius: 14px;
  }
}
</style>
