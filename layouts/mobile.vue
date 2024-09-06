<script setup lang="ts">
const showMenu = ref(false)
</script>

<template>
  <div class="layout">
    <div class="header">
      <i class="menu-button" @click="showMenu = true">
        <img src="/icon/menu.svg" alt="menu.svg" />
      </i>
      <h1>
        <el-text>XNote</el-text>
      </h1>
      <div class="avatar">
        <Avatar />
      </div>
    </div>
    <el-drawer
      size="150"
      class="menu"
      v-model="showMenu"
      direction="ltr"
      title="菜单"
    >
      <Menu />
    </el-drawer>
    <div class="body">
      <div class="content">
        <slot />
      </div>
    </div>
    <div class="footer">
      <Footer />
    </div>
  </div>
</template>

<style scoped lang="less">
@headerHeight: 60px;
@bodyHeight: calc(100vh - @headerHeight - @footerHeight);
@footerHeight: 30px;

.layout {
  width: 100vw;
  height: 100vh;

  .header {
    height: @headerHeight;
    width: 100%;
    border-bottom: var(--border);
    display: flex;
    align-items: center;
    position: relative;

    .menu-button {
      height: 100%;
      display: flex;
      align-items: center;
      margin-left: var(--maragin-base);

      @keyframes fade {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }

      img {
        height: 30px;
        width: 30px;
        animation: fade 3s infinite;
      }
    }

    h1 {
      margin-left: var(--maragin-base);
      * {
        font-size: 32px;
      }
    }

    .avatar {
      position: absolute;
      right: 0;
      margin-right: var(--maragin-base);
    }
  }

  .body {
    height: @bodyHeight;
    width: 100%;
    display: flex;
    position: relative;

    .el-drawer {
      width: 300px;
    }

    .content {
      width: 100%;
      height: 100%;

      & > * {
        width: 100%;
        height: 100%;
      }
    }
  }

  .footer {
    height: @footerHeight;
    width: 100%;
    border-top: var(--border);
  }
}
</style>
