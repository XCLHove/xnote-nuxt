<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<template>
  <NuxtLayout>
    <el-config-provider :locale="zhCn">
      <NuxtPage />
    </el-config-provider>
  </NuxtLayout>
</template>

<style scoped lang="less"></style>
