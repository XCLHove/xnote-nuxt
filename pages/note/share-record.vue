<script setup lang="ts">
import type { ShareNoteRecordVO } from '~/types/vo/ShareNoteRecordVO'
import type { PageVO } from '~/types/vo/PageVO'
import {
  deleteShareNoteRecordByIdsApi,
  getSelfShareRecordsApi,
} from '~/apis/shareNoteRecordApi'
import type { ShareNoteRecordUpdateComponent } from '~/components'

definePageMeta({
  layout: PageMetaUtil.layout(),
  middleware: 'auth',
})

const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - 150)

const page = ref<PageVO<ShareNoteRecordVO>>({
  current: 1,
  size: 10,
  total: 0,
  records: [],
})
const getSelfShareRecords = () => {
  getSelfShareRecordsApi({
    current: page.value.current,
    size: page.value.size,
  }).then(({ data }) => {
    page.value = data
  })
}
onMounted(() => {
  getSelfShareRecords()

  const removeCallback = TokenUtil.onSet(getSelfShareRecords)
  onUnmounted(removeCallback)
})

const selectedIds = ref<number[]>([])

const loading = ref(false)
const deleteShareNoteRecordByIds = (shareNoteRecordIds: number[]) => {
  loading.value = true
  deleteShareNoteRecordByIdsApi(shareNoteRecordIds)
    .then(() => {
      ElMessage.success('删除成功')
    })
    .then(getSelfShareRecords)
    .finally(() => {
      const timer = setTimeout(() => {
        loading.value = false
        clearTimeout(timer)
      }, 300)
    })
}

const shareNoteRecordUpdateRef = ref<ShareNoteRecordUpdateComponent>()

const copyNotePreviewUrlFormRecord = (record: ShareNoteRecordVO) => {
  const url = `${location.origin}/note/preview/${record.noteId}?shareCode=${record.code}`
  ClipboardUtil.copy(url)
    .then(() => {
      ElMessage.success('链接已复制')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const expired = (shareNoteRecord: ShareNoteRecordVO) => {
  const expireTime = new Date(shareNoteRecord.expireTime)
  const now = new Date()
  return expireTime < now
}
</script>

<template>
  <div class="share-record">
    <el-table
      v-loading="loading"
      :data="page.records"
      :height="tableHeight"
      @selection-change="
        (shareNoteRecords: ShareNoteRecordVO[]) =>
          (selectedIds = shareNoteRecords.map(
            (shareNoteRecord) => shareNoteRecord.id,
          ))
      "
    >
      <el-table-column type="selection" width="30" />
      <el-table-column prop="title" label="标题" min-width="130">
        <template #header>
          <el-popconfirm
            title="确认删除？"
            @confirm="deleteShareNoteRecordByIds(selectedIds)"
          >
            <template #reference>
              <el-button link type="danger" :disabled="selectedIds.length === 0"
                >批量删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
        <template
          #default="{ row: shareNoteRecord }: { row: ShareNoteRecordVO }"
        >
          <el-scrollbar>
            <div class="scroll-title">
              <a
                target="_blank"
                class="el-link"
                :href="`/note/preview/${shareNoteRecord.noteId}?shareCode=${shareNoteRecord.code}`"
                >{{ shareNoteRecord.title }}</a
              >
            </div>
          </el-scrollbar>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" align="center" width="100">
        <template
          #default="{ row: shareNoteRecord }: { row: ShareNoteRecordVO }"
        >
          <el-text :type="expired(shareNoteRecord) ? 'danger' : 'success'">{{
            new Date(shareNoteRecord.expireTime).toLocaleDateString()
          }}</el-text>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="180" align="center" label="操作">
        <template
          #default="{ row: shareNoteRecord }: { row: ShareNoteRecordVO }"
        >
          <el-button
            link
            type="success"
            @click="copyNotePreviewUrlFormRecord(shareNoteRecord)"
            >复制链接</el-button
          >
          <el-button
            link
            type="primary"
            @click="() => shareNoteRecordUpdateRef?.show(shareNoteRecord)"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="deleteShareNoteRecordByIds([shareNoteRecord.id])"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <ShareNoteRecordUpdate
      ref="shareNoteRecordUpdateRef"
      @close="getSelfShareRecords"
    />
    <Pagination
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      @change="getSelfShareRecords"
    />
  </div>
</template>

<style scoped lang="less">
.share-record {
  .scroll-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .el-link {
      text-decoration: 1px underline var(--color-info);
    }
  }
}
</style>
