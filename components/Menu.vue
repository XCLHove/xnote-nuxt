<script setup lang="ts">
import { ref } from "@vue/reactivity";

const menus = ref([
  {
    title: "笔记",
    index: "/note",
    children: [
      {
        title: "发布笔记",
        index: "/note/edit",
      },
      {
        title: "我的笔记",
        index: "/note/user",
      },
    ],
  },
  {
    title: "图片",
    index: "/image",
    children: [
      {
        title: "我的图片",
        index: "/image/user",
      },
    ],
  },
]);
</script>

<template>
  <div class="menu">
    <el-menu router>
      <el-menu-item index="/">首页</el-menu-item>
      <el-sub-menu v-for="menu in menus" :index="menu.index">
        <template #title>
          <span>{{ menu.title }}</span>
        </template>
        <el-menu-item
          v-for="menuChild in menu.children"
          :index="menuChild.index"
        >
          <span>{{ menuChild.title }}</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped lang="less">
.menu {
  height: 100%;

  .el-menu {
    border: none;
  }
}
</style>
