<template>
  <div class="login-page">
    <div class="login-brand">
      <div class="brand-pattern" />
      <div class="brand-content">
        <img src="@/assets/imgs/zdjt.png" alt="logo" class="brand-logo" />
        <h1 class="brand-title">{{ title }}</h1>
        <p class="brand-desc">供应商在线竞价服务平台</p>
        <ul class="brand-features">
          <li><el-icon><CircleCheck /></el-icon> 在线报名 · 资质审核</li>
          <li><el-icon><CircleCheck /></el-icon> 实时竞价 · 透明公正</li>
          <li><el-icon><CircleCheck /></el-icon> 结果查询 · 全程可追溯</li>
        </ul>
      </div>
    </div>

    <div class="login-form-wrap">
      <div class="login-card">
        <div class="login-header">
          <h2>供应商登录</h2>
          <p>请使用授权账号登录系统</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              type="password"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
          <div class="login-footer-link">
            <el-link type="primary" :underline="false" @click="router.push('/')">
              <el-icon><ArrowLeft /></el-icon>
              返回门户首页
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/login'
import { setToken } from '@/utils/auth'
import { useUserStoreWithOut } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStoreWithOut()
const title = import.meta.env.VITE_APP_TITLE

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true
  try {
    const token = await login({ ...form })
    setToken(token)
    userStore.resetState()
    await userStore.setUserInfoAction()
    const redirect = (route.query.redirect as string) || '/target-hall'
    await router.replace(redirect)
  } catch (e: any) {
    if (e?.message) ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-brand {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #072d52 0%, #0a4a80 50%, #0d6b8f 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  overflow: hidden;
}

.brand-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: radial-gradient(circle at 2px 2px, #fff 1px, transparent 0);
  background-size: 32px 32px;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.brand-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 24px;
}

.brand-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-desc {
  margin: 0 0 36px;
  font-size: 16px;
  opacity: 0.85;
}

.brand-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    opacity: 0.9;

    .el-icon {
      color: var(--sp-brand-accent);
      font-size: 18px;
    }
  }
}

.login-form-wrap {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--sp-bg-page);
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: var(--sp-radius-lg);
  padding: 40px 36px 32px;
  box-shadow: var(--sp-shadow-lg);
  border: 1px solid var(--sp-border);
}

.login-header {
  margin-bottom: 32px;

  h2 {
    margin: 0 0 8px;
    font-size: 26px;
    font-weight: 700;
    color: var(--sp-text-primary);
  }

  p {
    margin: 0;
    color: var(--sp-text-muted);
    font-size: 14px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  border-radius: 8px;
}

.login-footer-link {
  text-align: center;
  margin-top: -8px;

  .el-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
}

@media (max-width: 900px) {
  .login-page {
    flex-direction: column;
  }

  .login-brand {
    padding: 40px 28px;
  }

  .brand-features {
    display: none;
  }

  .login-form-wrap {
    width: 100%;
    flex: 1;
  }
}
</style>
