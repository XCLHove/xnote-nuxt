<script setup lang="ts">
import { shareNoteApi } from '~/apis/shareNoteRecordApi'
import type { SearchNoteVO } from '~/types/vo/SearchNoteVO'
import type { ShareNoteComponent } from '~/components'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const {
  query: { shareCode },
} = useRoute()

const visible = ref(false)
const expiredTime = ref(new Date(new Date().getTime() + 1000 * 3600 * 24 * 7))
const url = ref('')
const note = ref<SearchNoteVO>({
  id: 0,
  isPublic: '非公开',
  releaseTime: '',
  title: '',
  updateTime: '',
  userId: 0,
  typeId: 0,
})

const share = (noteInfo: SearchNoteVO) => {
  url.value = ''
  visible.value = true
  note.value = { ...noteInfo }
}

const shareNote = () => {
  if (note.value.isPublic === '公开') {
    url.value = `${location.origin}/note/preview/${note.value.id}`
    copyUrl()
    return
  }

  if (!userInfo.value || userInfo.value.id !== note.value.userId) {
    url.value = `${location.origin}/note/preview/${note.value.id}`
    if (shareCode) {
      url.value += `?shareCode=${shareCode}`
    }
    copyUrl()
    return
  }

  shareNoteApi({
    noteId: note.value.id,
    expireTime: expiredTime.value,
  }).then(({ data: shareCode }) => {
    url.value = `${location.origin}/note/preview/${note.value.id}?shareCode=${shareCode}`
    copyUrl()
  })
  return
}

const copyUrl = () => {
  ClipboardUtil.copy(url.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制链接失败，请手动复制')
    })
}

defineExpose<ShareNoteComponent>({
  share,
})
</script>

<template>
  <div class="share-note">
    <el-dialog v-model="visible" width="300" title="分享笔记">
      <el-form label-width="75">
        <el-form-item label="笔记标题">
          <el-text v-text="note.title" type="info"></el-text>
        </el-form-item>
        <el-form-item label="是否公开">
          <el-text
            v-if="note.isPublic === '公开'"
            type="success"
            v-text="note.isPublic"
          ></el-text>
          <el-text v-else type="danger" v-text="note.isPublic"></el-text>
        </el-form-item>
        <el-form-item v-show="note.isPublic === '非公开'" label="有效期至">
          <el-date-picker
            :editable="false"
            v-model="expiredTime"
            type="date"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-show="url.length > 0" label-width="0">
          <el-input
            type="textarea"
            rows="1"
            v-model="url"
            disabled
            @click="copyUrl"
            @copy="() => ElMessage.success('复制成功')"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="shareNote">分享</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.share-note {
  .el-button {
    width: 100%;
  }
}
</style>
