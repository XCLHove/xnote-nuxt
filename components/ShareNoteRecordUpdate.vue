<script setup lang="ts">
import type { ShareNoteRecordVO } from '~/types/vo/ShareNoteRecordVO'
import type { ShareNoteRecordUpdateForm } from '~/types/form/shareNoteRecord/ShareNoteRecordUpdateForm'
import { updateShareNoteRecordApi } from '~/apis/shareNoteRecordApi'

const emit = defineEmits(['update-success'])

const visible = ref(false)
const shareNoteRecord = ref<ShareNoteRecordVO>({
  id: 0,
  code: '',
  noteId: 0,
  userId: 0,
  expireTime: '',
  title: '',
})
const show = (record: ShareNoteRecordVO) => {
  visible.value = true
  shareNoteRecord.value = record
}
defineExpose({
  show,
})

const form = ref<ShareNoteRecordUpdateForm>({
  id: 0,
  expireTime: new Date(),
})
watch(
  () => shareNoteRecord.value,
  () => {
    form.value = {
      id: shareNoteRecord.value.id,
      expireTime: new Date(shareNoteRecord.value.expireTime),
    }
  },
)
const updateShareNoteRecord = () => {
  updateShareNoteRecordApi(form.value).then(() => {
    ElMessage.success('修改成功')
    visible.value = false
    emit('update-success')
  })
}
</script>

<template>
  <el-dialog v-model="visible" width="300" title="分享笔记">
    <el-form label-width="75">
      <el-form-item label="笔记标题">
        <el-text v-text="shareNoteRecord.title" type="info"></el-text>
      </el-form-item>
      <el-form-item label="有效期至">
        <el-date-picker
          :editable="false"
          v-model="form.expireTime"
          type="date"
        ></el-date-picker>
      </el-form-item>
      <el-button type="primary" @click="updateShareNoteRecord">修改</el-button>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="less">
.el-button {
  width: 100%;
}
</style>
