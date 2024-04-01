<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
// 复制成功提示
process.client &&
  onMounted(() => {
    const startListener = () => {
      const copyListener = () => {
        elPrompt.success("复制成功！");
      };
      document.addEventListener("copy", copyListener);

      return () => {
        document.removeEventListener("copy", copyListener);
      };
    };
    const removeListener = startListener();
    onUnmounted(() => {
      removeListener();
    });
  });
</script>

<style lang="less">
@import "/assets/css/base";
</style>
