<script setup lang="ts">
import { getConfigApi } from '~/apis/nuxtServerApi'

const ipc = ref<string>()
onMounted(() => {
  getConfigApi().then((config) => {
    ipc.value = config.ipc
  })
})
</script>

<template>
  <div class="box">
    <el-text> power&nbsp;by&nbsp; </el-text>
    <el-link type="primary" href="https://github.com/xclhove/xnote-springboot"
      >xnote</el-link
    >
    <el-text v-if="ipc">&nbsp;|&nbsp;{{ ipc }}</el-text>
  </div>
</template>

<style lang="less" scoped>
.box {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  * {
    line-height: 100%;
    font-size: 16px;
  }
}
</style>
