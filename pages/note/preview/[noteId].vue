<script setup lang="ts">
import { getNoteByIdApi } from '~/apis/noteApi'
import type { Note } from '~/types/table/Note'
import type { ShareNoteComponent } from '~/components'

definePageMeta({
  layout: PageMetaUtil.layout(),
})

const route = useRoute()
const {
  params: { noteId },
  query: { shareCode },
} = route
const defaultNote = <Note>{
  title: 'loading...',
  content: '# loading...',
  id: 0,
  isPublic: '公开',
  releaseTime: '',
  updateTime: '',
  userId: 0,
  typeId: 0,
}
const note = ref<Note>(defaultNote)

const getNoteById = () => {
  getNoteByIdApi(noteId as string, shareCode as string)
    .then((result) => {
      note.value = result.data
      useHead({
        title: note.value.title,
      })
    })
    .catch(() => {
      note.value = defaultNote
    })
}

onMounted(() => {
  const timeout = setTimeout(() => {
    getNoteById()
    clearTimeout(timeout)
  })
})
onMounted(() => {
  const stop = TokenUtil.onSet(getNoteById)
  onBeforeUnmount(stop)
})
onMounted(() => {
  const stop = TokenUtil.onRemove(getNoteById)
  onBeforeUnmount(stop)
})
onUnmounted(() => {
  useHead({
    title: 'XNote',
  })
})

const shareNoteRef = ref<ShareNoteComponent>()
const share = () => {
  shareNoteRef.value?.share(note.value)
}
</script>

<template>
  <div class="preview">
    <ShareNote ref="shareNoteRef" />
    <div class="info" v-show="note.id !== defaultNote.id">
      <el-text>
        最近更新：{{ new Date(note.updateTime).toLocaleString() }}
      </el-text>
      <div class="share-button">
        <el-tooltip content="分享">
          <img @click="share" src="/icon/share.svg" alt="share.svg" />
        </el-tooltip>
      </div>
    </div>
    <div class="markdown">
      <MarkdownPreview v-model:content="note.content" />
    </div>
  </div>
</template>

<style scoped lang="less">
.preview {
  height: 100%;
  display: flex;
  flex-direction: column;

  & > * {
    padding: var(--padding-base);
  }

  .info {
    height: 34px;
    display: flex;
    align-items: center;

    .el-text {
      margin-right: var(--padding-base);
    }

    .share-button {
      position: absolute;
      right: 0;
      padding-right: var(--padding-base);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;

        &:hover {
          opacity: 0.5;
        }
      }
    }
  }

  .markdown {
    height: 100%;
    flex-grow: 1;
    overflow: auto;
  }
}
</style>
