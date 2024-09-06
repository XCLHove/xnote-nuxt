<script setup lang="ts">
import Vditor from 'vditor/dist/method'
import 'vditor/src/assets/less/index.less'
import type { Ref } from 'vue'

const content = defineModel('content', {
  default: '',
  type: String,
})
const markdownRef = ref() as Ref<HTMLDivElement>
const render = (text: string) => {
  Vditor.preview(markdownRef.value, text, {
    cdn: `${location.origin}/vditor`,
    mode: 'light',
  })
}
watch(
  () => content.value,
  () => {
    render(content.value)
  },
)

// 复制时提示
onMounted(() => {
  const listener = (_: ClipboardEvent) => {
    ElMessage.success('复制成功')
  }
  markdownRef.value.addEventListener('copy', listener)

  onMounted(() => {
    markdownRef.value.removeEventListener('copy', listener)
  })
})

const boxRef = ref() as Ref<HTMLDivElement>
const height = defineModel('height', {
  default: 0,
  type: Number,
})
const width = defineModel('width', {
  default: 0,
  type: Number,
})
const updateSize = () => {
  if (width.value > 0) {
    boxRef.value.style.width = `${width.value}px`
  }
  if (height.value > 0) {
    boxRef.value.style.height = `${height.value}px`
  }
}
onMounted(updateSize)
watch([width, height], updateSize)
</script>

<template>
  <div ref="boxRef" class="markdown-preview">
    <div ref="markdownRef" class="preview-content"></div>
  </div>
</template>

<style scoped lang="less">
.markdown-preview {
  height: 100%;
  width: 100%;
  position: relative;

  .preview-content {
    height: 100%;
    width: 100%;
  }
}
</style>
