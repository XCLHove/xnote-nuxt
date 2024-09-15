<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/src/assets/less/index.less'
import type { Ref } from 'vue'
import { uploadImageApi } from '~/apis/imageApi'

const emit = defineEmits(['save'])
const modelValue = defineModel('modelValue', {
  type: String,
  default: '',
})

const editRef = ref() as Ref<HTMLElement>
// 监听 ctrl + s
onMounted(() => {
  const saveListener = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      emit('save')
    }
  }
  editRef.value.addEventListener('keydown', saveListener)
  onUnmounted(() => {
    document.removeEventListener('keydown', saveListener)
  })
})

const uploadImage = (files: File[]) => {
  return new Promise<null>(async (resolve, reject) => {
    let imagesUrl = ''

    for (const file of files) {
      await uploadImageApi(file)
        .then(({ data: imageName }) => {
          imagesUrl += `![${file.name}](/api/image/name/${imageName})\n`
        })
        .catch(() => {})
    }

    if (!imagesUrl) {
      reject()
      return
    }
    useClipboard()
      .copy(imagesUrl)
      .then(() => {
        ElMessage.success('图片上传成功，url已复制到剪贴板，直接粘贴即可')
      })
    resolve(null)
  })
}

let vditor: Vditor
onMounted(() => {
  vditor = new Vditor(editRef.value, {
    height: '100%',
    width: '100%',
    cdn: '/vditor',
    cache: {
      enable: false,
    },
    input(value: string) {
      modelValue.value = value
    },
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      '|',
      'upload',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: ['export', 'outline', 'preview'],
      },
    ],
    upload: {
      handler(files: File[]) {
        return uploadImage(files)
      },
    },
    outline: {
      enable: true,
      position: 'left',
    },
    after() {
      updateValue()
      watch(modelValue, updateValue)
    },
  })
})

const updateValue = () => {
  if (modelValue.value === vditor.getValue()) {
    return
  }
  vditor.setValue(modelValue.value)
}

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
    boxRef.value.style.width = `${Math.min(width.value, 1200)}px`
  }
  if (height.value > 0) {
    boxRef.value.style.height = `${height.value}px`
  }
}
onMounted(updateSize)
watch([width, height], updateSize)
</script>

<template>
  <div ref="boxRef" class="markdown-edit">
    <div ref="editRef"></div>
  </div>
</template>

<style scoped lang="less">
.markdown-edit {
  width: 100%;
  height: 100%;
}
</style>
