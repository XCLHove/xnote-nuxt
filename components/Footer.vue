<script setup lang="ts">
import { onMounted, ref } from "vue";

const icp = ref("");

onMounted(async () => {
  const config = await getConfig();
  icp.value = config.icp || "";
});
</script>

<template>
  <div class="footer">
    <span class="github"
      >power by
      <a target="_blank" href="https://github.com/xclhove/xnote-springboot"
        >xnote(springboot)</a
      >&
      <a target="_blank" href="https://github.com/xclhove/xnote-nuxt"
        >xnote(nuxt)</a
      >
    </span>
    <span class="icp" v-if="icp"
      >|<a target="_blank" href="https://beian.miit.gov.cn" v-text="icp"></a
    ></span>
  </div>
</template>

<style lang="less" scoped>
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 5px 0;
  background: white;
  z-index: 999;
  border-top: 1px solid @color-lightGray;

  @media screen and (max-width: 600px) {
    & {
      font-size: 10px;
    }
  }

  span > a {
    text-decoration: none;
    font-weight: bold;
    color: @color-gray;
    margin-right: 5px;

    &:hover {
      text-decoration: underline;
    }
  }

  .icp {
    a {
      margin: 0 5px;
    }
  }
}
</style>
