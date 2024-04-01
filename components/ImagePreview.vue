<script setup lang="ts">
import type { Ref } from "vue";

/**是否显示*/
const show = defineModel("show", {
  type: Boolean,
  required: true,
});
/**图片url*/
const src = defineModel("src", { type: String, required: true });
const alt = defineModel("alt", { type: String, required: false, default: "" });
const imagePreviewRef = ref() as Ref<HTMLElement>;

/**缩放比例*/
const scale = ref(1);
watch(
  () => scale.value,
  () => {
    imagePreviewRef.value.style.transform =
      imagePreviewRef.value.style.transform.replace(/scale(.*)/, "");
    imagePreviewRef.value.style.transform += `scale(${scale.value})`;
  },
);
/**是否在拖动中*/
const dragging = ref(false);
const position = {
  x: 0,
  y: 0,
};
const originPosition = {
  x: 0,
  y: 0,
};
const previewPrompt = interval(() => {
  let message = "点击图片以拖动，再次点击放下";
  if (!isMobile()) message += "，滚动滚轮进行缩放";
  elPrompt.warning(message, 3);
}, 3);
const closeImagePreview = () => {
  show.value = false;
};
const openImagePreview = () => {
  dragging.value = false;
  scale.value = 1;
  position.x = 0;
  position.y = 0;
  originPosition.x = 0;
  originPosition.y = 0;
  imagePreviewRef.value.style.transform = "";
  previewPrompt();
};
const switchDrag = (event: MouseEvent) => {
  if (!dragging.value) {
    originPosition.x = event.clientX;
    originPosition.y = event.clientY;
  }
  dragging.value = !dragging.value;
};
const handleDrag = interval((event: MouseEvent) => {
  if (!dragging.value) return;
  position.x += event.clientX - originPosition.x;
  position.y += event.clientY - originPosition.y;

  originPosition.x = event.clientX;
  originPosition.y = event.clientY;

  imagePreviewRef.value.style.transform =
    imagePreviewRef.value.style.transform.replace(
      /translate\(.*px, .*px\)/,
      "",
    );
  imagePreviewRef.value.style.transform =
    `translate(${position.x}px, ${position.y}px)` +
    imagePreviewRef.value.style.transform;
}, 0.01);
const handleWheelZoom = (event: WheelEvent) => {
  event.preventDefault();
  scale.value = parseFloat(
    (scale.value + (event.deltaY > 0 ? -0.01 : 0.01)).toFixed(2),
  );
};
</script>

<template>
  <div class="image-preview">
    <el-dialog
      v-model="show"
      @close="closeImagePreview"
      @click="closeImagePreview"
      @open="openImagePreview"
      fullscreen
      @mousemove="handleDrag"
      @wheel="handleWheelZoom"
    >
      <div class="preview-container">
        <div
          :class="{ 'image-container': true, opacity: dragging }"
          ref="imagePreviewRef"
        >
          <el-image :src="src" :alt="alt" @click.stop="switchDrag">
            <template #error>
              <i class="iconfont icon-Image" />
            </template>
          </el-image>
        </div>
      </div>
      <div class="scale" @click.stop>
        <span class="label">缩放比例：</span>
        <el-slider v-model="scale" :min="0.1" :step="0.1" :max="10"></el-slider>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.image-preview {
  .preview-container {
    display: flex;
    width: 100%;
    height: 100%;

    .image-container {
      margin: auto;
    }

    .opacity {
      opacity: 0.5;
    }
  }

  .scale {
    position: fixed;
    bottom: 15px;
    display: flex;
    flex-direction: row;
    width: 90dvw;
    align-items: center;
    height: 30px;

    .label {
      width: 100px;
    }
  }
}
</style>
