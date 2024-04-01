<script setup lang="ts">
import { sendVerificationCode, userRegister } from "@/api/UserApi.ts";
import type { FormInstance, FormRules } from "element-plus";
import type { Ref } from "vue";
import type { UserDTO } from "~/interfaces/entity/dto/UserDTO";

const storeShowRegister = useShowUserRegister();
const { value: showRegister }: { value: Ref<boolean> } =
  storeToRefs(storeShowRegister);

const registerFormRef = ref<FormInstance>();
const registerForm = ref<UserDTO>({
  name: "",
  account: "",
  password: "",
  password2: "",
  email: "",
  verificationCode: "",
});
const rules = ref<FormRules<UserDTO>>({
  name: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        let pattern = /^\w{2,30}$/g;
        if (!pattern.test(value)) callback(new Error());
        return true;
      },
      message: "2-30位的数字、字母或下划线",
      trigger: "blur",
    },
  ],
  account: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        let pattern = /^\w{6,30}$/g;
        if (!pattern.test(value)) callback(new Error());
        return true;
      },
      message: "6-30位的数字、字母或下划线",
      trigger: "blur",
    },
  ],
  password: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        let pattern = /^[\w\.\*]{6,30}$/g;
        if (!pattern.test(value)) callback(new Error());
        return true;
      },
      message: '6-30位的数字、字母、下划线、"."或"*"',
      trigger: "blur",
    },
  ],
  password2: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) callback(new Error());
        return true;
      },
      message: "密码和确认密码不一致",
      trigger: "blur",
    },
  ],
  email: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        let pattern = /^[\w-]+@((\w+)\.)+([a-zA-Z]{2,4})$/g;
        const isValidate = pattern.test(value);

        disableSend.value = !isValidate;

        if (!isValidate) {
          callback(new Error());
          return;
        }
        callback();
      },
      message: "邮箱格式错误",
      trigger: "blur",
    },
  ],
  verificationCode: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        const pattern = /^[a-zA-Z0-9]{4}$/g;
        if (!pattern.test(value)) callback(new Error());
        callback();
      },
      message: "验证码格式错误",
      trigger: "blur",
    },
  ],
});

/**
 * 提交表单
 */
const submitForm = () => {
  registerFormRef.value?.validate((valid) => {
    if (!valid) return;
    userRegister(registerForm.value).then((result) => {
      if (result.status !== 200) return;
      elPrompt.success("注册成功！");
      useShowUserRegister().hide();
      registerFormRef.value?.resetFields();
      useShowUserLogin().show();
    });
  });
};

/**
 * 重置表单
 */
const resetForm = () => {
  registerFormRef.value?.resetFields();
  sendStatus.value = getSendStatus().unSend;
};

const seconds = ref(60);
const disableSend = ref(true);
const getSendStatus = () => {
  return {
    unSend: 0,
    sending: 1,
    success: 2,
    failed: 3,
  };
};
const sendStatus = ref(getSendStatus().unSend);
/**
 * 发送验证码
 */
const send = () => {
  sendStatus.value = getSendStatus().sending;

  sendVerificationCode({ email: registerForm.value.email })
    .then((result) => {
      seconds.value = 60;
      sendStatus.value = getSendStatus().success;
      const secondsInterval = setInterval(() => {
        seconds.value--;

        if (seconds.value === 0) {
          clearInterval(secondsInterval);
          sendStatus.value = getSendStatus().unSend;
        }
      }, 1000);

      elPrompt.success(result.message);
    })
    .catch(() => {
      sendStatus.value = getSendStatus().failed;
    });
};
</script>

<template>
  <div class="container">
    <el-dialog
      v-model="showRegister"
      title="用户注册"
      :center="true"
      width="350"
      top="25vh"
      @close="storeShowRegister.hide()"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-position="left"
        label-width="70px"
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
        <el-form-item label="确认密码" prop="password2">
          <el-input type="password" v-model.trim="registerForm.password2" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="registerForm.email" />
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code">
            <el-input v-model.trim="registerForm.verificationCode" />
            <el-button
              :disabled="disableSend"
              :type="disableSend ? 'info' : ''"
              v-show="sendStatus === getSendStatus().unSend"
              @click="send"
              >发送验证码</el-button
            >
            <el-button disabled v-show="sendStatus === getSendStatus().sending"
              >发送中……</el-button
            >
            <el-button
              disabled
              type="success"
              v-show="sendStatus === getSendStatus().success"
              >{{ seconds }} S</el-button
            >
            <el-button
              :disabled="disableSend"
              type="danger"
              v-show="sendStatus === getSendStatus().failed"
              @click="send"
              >发送失败</el-button
            >
          </div>
        </el-form-item>
        <div class="operation">
          <el-button type="danger" @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm">注册</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.container {
  .el-form {
    .verification-code {
      .flex();

      .el-button {
        margin-left: 10px;
        width: 150px;
      }
    }

    .operation {
      .flex();

      .el-button {
        width: 50%;
        margin: 0;

        &:nth-child(1) {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
