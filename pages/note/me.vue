<script setup lang="ts">
definePageMeta({
  layout: PageMetaUtil.layout(),
  middleware: 'auth',
})

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const loading = ref(false)

onMounted(() => {
  if (userInfo.value) {
    navigateTo(`/note/user/${userInfo.value.id}`)
    return
  }
  loading.value = true
  ElMessage.error('获取用户信息失败，请尝试刷新页面')
})
</script>

<template>
  <div class="container" v-loading="loading"></div>
</template>

<style scoped lang="less">
.container {
}
</style>
