<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { userLoginApi, userRegisterApi } from '~/apis/userApi'
import {
  getVerificationCodeImageBase64Api,
  sendVerificationCodeToEmailApi,
} from '~/apis/verificationCodeApi'
import ShowLoginUtil from '~/utils/ShowLoginUtil'
import type { UserLoginForm } from '~/types/form/user/UserLoginForm'
import type { UserRegisterForm } from '~/types/form/user/UserRegisterForm'
import { ElTooltip } from '#components'

const loginVisible = ref(false)
onMounted(() => {
  const removeListener = ShowLoginUtil.registerShow(() => {
    loginVisible.value = true
  })
  onUnmounted(removeListener)
})
const loginForm = ref<UserLoginForm>({
  account: '',
  password: '',
})
const loginFormRef = ref<FormInstance>()
const loginFormRules = ref<FormRules<typeof loginForm>>({
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{2,30}$/,
      message: '需要2-30位的字母和数字',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z\d._*]{6,30}$/,
      message: '需要6-30位的数字、字母、_、.或*',
      trigger: 'blur',
    },
  ],
})
const login = () => {
  loginFormRef.value?.validate((isValid) => {
    if (!isValid) return

    userLoginApi(loginForm.value).then(({ data: token }) => {
      ElMessage.success('登录成功')
      TokenUtil.set(token)
      loginFormRef.value?.resetFields()
      loginVisible.value = false
    })
  })
}

const registerVisible = ref(false)
const autoLoginAfterRegister = ref(true)
const registerForm = ref<UserRegisterForm & { confirmPassword: string }>({
  name: '',
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  verificationCode: '',
})
const registerFormRef = ref<FormInstance>()
const registerFormRules = ref<FormRules<typeof registerForm>>({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^\S{2,30}$/,
      message: '需要2-30位的非空字符',
      trigger: 'blur',
    },
  ],
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{2,30}$/,
      message: '需要2-30位的字母和数字',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z\d._*]{6,30}$/,
      message: '需要6-30位的数字、字母、_、.和*',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'change' },
    {
      validator: (_: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) {
          callback(new Error())
          return
        }
        callback()
      },
      message: '密码和确认密码不一致',
      trigger: 'change',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'change' },
    {
      validator: (_: any, value: string, callback: Function) => {
        const pattern = /^[\w-]+@((\w+)\.)+([a-zA-Z]{2,4})$/
        if (!pattern.test(value)) {
          callback(new Error())
          emailValid.value = false
          return
        }

        emailValid.value = true
        callback()
      },
      message: '邮箱格式错误',
      trigger: 'change',
    },
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
})
const register = () => {
  registerFormRef.value?.validate((isValid) => {
    if (!isValid) return

    userRegisterApi(registerForm.value).then(() => {
      ElMessage.success('注册成功')
      switchForm()

      if (autoLoginAfterRegister.value) {
        loginForm.value.account = registerForm.value.account
        loginForm.value.password = registerForm.value.password
        login()
        return
      }

      registerFormRef.value?.resetFields()
    })
  })
}

const emailValid = ref(false)
const verificationCodeEffectiveSecond = ref(0)
const hasSentVerificationCode = computed(
  () => verificationCodeEffectiveSecond.value > 0,
)
const sendVerificationCode = () => {
  getVerificationCodeImageBase64Api().then(({ data: imageBase64 }) => {
    ElMessageBox.prompt('发送验证码到邮箱', {
      title: '发送验证码到邮箱',
      confirmButtonText: '发送验证码',
      cancelButtonText: '取消',
      inputPlaceholder: '输入图片中的验证码',
      inputPattern: /^\S+$/,
      inputErrorMessage: '请输入正确的图片验证码',
      message: () =>
        h(
          ElTooltip,
          {
            content: '点击刷新验证码',
            placement: 'right',
          },
          () =>
            h('img', {
              src: imageBase64,
              alt: '验证码',
              onClick: (e) => {
                e.preventDefault()
                getVerificationCodeImageBase64Api().then(
                  ({ data: newImageBase64 }) => {
                    ;(e.target as HTMLImageElement).src = newImageBase64
                  },
                )
              },
            }),
        ),
    })
      .then(({ value: imageCode }) => {
        sendVerificationCodeToEmailApi(
          registerForm.value.email,
          imageCode,
        ).then(({ data: effectiveSecond }) => {
          ElMessage.success('发送成功')
          verificationCodeEffectiveSecond.value = effectiveSecond
          const timer = setInterval(() => {
            if (verificationCodeEffectiveSecond.value <= 0) {
              clearInterval(timer)
              return
            }
            verificationCodeEffectiveSecond.value--
          }, 1000)
        })
      })
      .catch(() => {})
  })
}

const switchForm = () => {
  loginVisible.value = !loginVisible.value
  registerVisible.value = !loginVisible.value
}
</script>

<template>
  <div>
    <!--登录-->
    <el-dialog
      class="login"
      v-model="loginVisible"
      title="用户登录"
      :center="true"
      width="350"
      top="35vh"
      @closed="ShowLoginUtil.invokeCloseCallbacks()"
    >
      <el-form
        :status-icon="true"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <el-form-item prop="account" label="账号">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            @keydown.enter="login"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <div class="operation">
            <el-button type="danger" @click="switchForm">注册</el-button>
            <el-button type="primary" @click="login">登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--注册-->
    <el-dialog
      class="register"
      v-model="registerVisible"
      title="用户注册"
      :center="true"
      width="350"
      top="25vh"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerFormRules"
        label-position="left"
        label-width="80px"
        status-icon
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model.trim="registerForm.name" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model.trim="registerForm.account" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model.trim="registerForm.password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model.trim="registerForm.confirmPassword"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="registerForm.email" />
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code">
            <el-input
              v-model.trim="registerForm.verificationCode"
              :placeholder="emailValid ? '输入验证码' : '请先输入邮箱'"
              :disabled="!emailValid"
            />
            <el-button
              type="primary"
              :disabled="!emailValid || hasSentVerificationCode"
              @click="sendVerificationCode"
            >
              {{
                hasSentVerificationCode
                  ? `${verificationCodeEffectiveSecond.toString().padStart(2, '0')}s`
                  : '发送验证码'
              }}
            </el-button>
          </div>
        </el-form-item>
        <el-switch
          active-text="注册后自动登录"
          inactive-text="手动登录"
          v-model="autoLoginAfterRegister"
        ></el-switch>
        <div class="operation">
          <el-button type="danger" @click="switchForm">登录</el-button>
          <el-button type="primary" @click="register">注册</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.operation {
  display: flex;
  width: 100%;

  .el-button {
    width: 100%;
  }
}

.verification-code {
  display: flex;

  .el-input {
    margin-right: var(--maragin-base);
  }
}
</style>
