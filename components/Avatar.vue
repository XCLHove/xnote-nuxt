<script setup lang="ts">
const userStore = useUserStore()

const { userInfo } = storeToRefs(userStore)
const avatarContent = computed(() => {
  if (userInfo.value) {
    return userInfo.value.name.substring(0, 1)
  }
  return '登录'
})

const logout = () => {
  TokenUtil.remove()
  ElMessage.success('注销成功')
}
</script>

<template>
  <el-dropdown>
    <el-avatar>
      <div>{{ avatarContent }}</div>
    </el-avatar>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="!userInfo">
          <el-text @click="ShowLoginUtil.show()">登录</el-text>
        </el-dropdown-item>
        <el-dropdown-item v-else>
          <el-text @click="logout">注销</el-text>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <Login />
</template>

<style scoped lang="less"></style>
