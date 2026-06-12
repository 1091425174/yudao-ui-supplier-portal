<template>
  <div class="page-panel" v-loading="loading">
    <PageHeader title="个人中心" description="查看与维护账号、企业信息，快速进入业务功能">
      <template #extra>
        <el-button @click="openPasswordDialog">修改密码</el-button>
        <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</el-button>
      </template>
    </PageHeader>

    <div class="profile-grid">
      <section class="info-card sp-card">
        <h3 class="card-title">账号信息</h3>
        <el-form :model="profileForm" label-width="88px">
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
            <span>{{ formatDateTime(user.loginDate) }}</span>
          </el-form-item>
        </el-form>
      </section>

      <section class="info-card sp-card">
        <h3 class="card-title">企业信息</h3>
        <el-descriptions :column="1" border>
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
        <el-alert
          class="enterprise-tip"
          type="info"
          :closable="false"
          show-icon
          title="企业档案由采购方维护，供应商门户仅展示，暂不支持自行修改。"
        />
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

    <el-dialog v-model="passwordVisible" title="修改密码" width="420px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="88px">
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
import { useUserStoreWithOut } from '@/store/user'

defineOptions({ name: 'SupplierProfile' })

const router = useRouter()
const userStore = useUserStoreWithOut()
const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const passwordVisible = ref(false)
const passwordFormRef = ref<FormInstance>()

const user = computed(() => userStore.getUser)
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
  margin-top: 16px;
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
