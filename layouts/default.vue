<script setup lang="ts"></script>

<template>
  <div class="layout">
    <div class="header">
      <h1>
        <el-text>XNote</el-text>
      </h1>
      <div class="avatar">
        <Avatar />
      </div>
    </div>
    <div class="body">
      <div class="menu">
        <Menu />
      </div>
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
@menuWidth: 150px;

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

    .menu {
      width: @menuWidth;
      border-right: var(--border);
    }

    .content {
      width: calc(100% - @menuWidth);
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
