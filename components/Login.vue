<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { userLogin } from "~/api/UserApi";
import LocalStorageKey from "~/enums/LocalStorageKey";

const user = ref({
  account: "",
  password: "",
});

const formRef = ref<FormInstance>();

const formValidateRules = ref<FormRules<typeof user>>({
  account: [
    {
      validator(rule, value, callback, source, options) {
        const regExp = /^[a-zA-Z0-9]{6,30}$/;
        if (!regExp.test(value)) {
          callback(new Error("仅支持6-30位的数字字母"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  password: [
    {
      validator(rule, value, callback, source, options) {
        const regExp = /^[a-zA-Z0-9.*_]{6,128}$/;
        if (!regExp.test(value)) {
          callback(new Error("仅支持6-128位的数字、字母、'.'、'*'和'_'"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
});

const { value: showLogin } = storeToRefs(useShowUserLogin());

/**用户登录*/
const login = () => {
  formRef.value?.validate((isValid: boolean) => {
    if (!isValid) return;

    userLogin({
      account: user.value.account,
      password: user.value.password,
    }).then((result) => {
      localStorage.setItem(LocalStorageKey.TOKEN, result.data);
      elPrompt.success(result.message);
      useShowUserLogin().hide();

      formRef.value?.resetFields();
    });
  });
};

const showRegister = () => {
  useShowUserLogin().hide();
  useShowUserRegister().show();
};

const showUserLoginStore = useShowUserLogin();
</script>

<template>
  <div class="container">
    <el-dialog
      v-model="showLogin"
      title="用户登录"
      :center="true"
      width="350"
      top="35vh"
      @close="showUserLoginStore.hide()"
    >
      <el-form
        :status-icon="true"
        ref="formRef"
        :model="user"
        :rules="formValidateRules"
      >
        <el-form-item prop="account">
          <div class="form-item">
            <div class="description">账号：</div>
            <el-input
              v-model="user.account"
              placeholder="请输入账号"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <div class="form-item">
            <div class="description">密码：</div>
            <el-input
              type="password"
              v-model="user.password"
              placeholder="请输入密码"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="operation">
            <el-button type="success" @click="showRegister()">注册</el-button>
            <el-button type="primary" @click="login">登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.container {
  .el-dialog {
    .el-form {
      .el-form-item {
        .form-item {
          display: flex;
          width: 100%;

          .description {
            width: 60px;
          }
        }

        .operation {
          display: flex;
          width: 100%;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
