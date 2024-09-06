<script setup lang="ts">
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const {
  query: { toPath },
} = useRoute()

const loading = ref(false)
onMounted(() => {
  const t = setTimeout(() => {
    // 用户信息加载完毕
    if (userInfo.value) {
      useRouter().push(toPath as string)
      return
    }

    // 未登录
    if (!TokenUtil.get()) {
      ShowLoginUtil.show()
      const removeLoginListener = TokenUtil.onSet(() => {
        loading.value = true
        userStore.afterRefresh(() => {
          loading.value = false
          useRouter().push(toPath as string)
        }, true)
      })
      ShowLoginUtil.afterClose(() => {
        removeLoginListener()

        // 取消登录
        if (!TokenUtil.get()) {
          useRouter().push('/')
        }
      })
      return
    }

    // 已登录，但用户信息未加载完毕
    loading.value = true
    const removeAfterRefreshListener = userStore.afterRefresh(() => {
      loading.value = false
      useRouter().push(toPath as string)
    }, true)
    onUnmounted(removeAfterRefreshListener)
  })
})
</script>

<template>
  <div
    class="redirect"
    v-loading="loading"
    element-loading-text="获取用户信息..."
  ></div>
</template>

<style scoped lang="less">
.redirect {
  height: 100%;
  width: 100%;
}
</style>
