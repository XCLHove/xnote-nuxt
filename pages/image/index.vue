<script setup lang="ts">
import type { PageVO } from '~/types/vo/PageVO'
import type { SearchUserImageVO } from '~/types/vo/SearchUserImageVO'
import { deleteImageApi, searchSelfImageApi } from '~/apis/imageApi'

definePageMeta({
  layout: PageMetaUtil.layout(),
  middleware: 'auth',
})

const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - 200)

const searchText = ref('')
const page = ref<PageVO<SearchUserImageVO>>({
  current: 1,
  size: 10,
  total: 0,
  records: [],
})
const selectedIds = ref<number[]>([])
const loading = ref(false)

const searchSelfImage = () => {
  loading.value = true
  searchSelfImageApi({
    current: page.value.current,
    size: page.value.size,
    search: searchText.value,
  })
    .then(({ data }) => {
      page.value = data
    })
    .finally(() => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        loading.value = false
      }, 200)
    })
}
onMounted(() => {
  searchSelfImage()

  const removeOnSetCallback = TokenUtil.onSet(searchSelfImage)
  onUnmounted(removeOnSetCallback)
})

const deleteUserImages = (ids: number[]) => {
  loading.value = true
  deleteImageApi(ids)
    .then(() => {
      ElMessage.success('删除成功')
      searchSelfImage()
    })
    .finally(() => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        loading.value = false
      }, 200)
    })
}
</script>

<template>
  <div class="image-index">
    <div class="search">
      <el-input
        v-model="searchText"
        @keydown.enter="searchSelfImage"
        placeholder="搜索图片别名"
        :disabled="loading"
      />
      <el-button type="primary" @click="searchSelfImage" :disabled="loading"
        >搜索</el-button
      >
    </div>
    <el-table
      :height="tableHeight"
      v-loading="loading"
      :data="page.records"
      @selection-change="
        (list: SearchUserImageVO[]) =>
          (selectedIds = list.map((searchUserImageVO) => searchUserImageVO.id))
      "
    >
      <el-table-column type="selection" width="30" />
      <el-table-column prop="alias" label="图片别名">
        <template #header>
          <el-popconfirm
            @confirm="deleteUserImages(selectedIds)"
            title="确认删除吗？"
            cancel-button-text="取消"
            confirm-button-text="确认"
          >
            <template #reference>
              <el-button type="danger" link :disabled="selectedIds.length === 0"
                >批量删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
        <template
          #default="{ row: searchUserImageVO }: { row: SearchUserImageVO }"
        >
          <el-scrollbar>
            <el-text class="alias">{{ searchUserImageVO.alias }}</el-text>
          </el-scrollbar>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastDownloadTime"
        label="最后一次访问时间"
        width="160"
        align="center"
      >
        <template
          #default="{ row: searchUserImageVO }: { row: SearchUserImageVO }"
        >
          {{ new Date(searchUserImageVO.lastDownloadTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column width="60" fixed="right" label="操作" align="center">
        <template
          #default="{ row: searchUserImageVO }: { row: SearchUserImageVO }"
        >
          <el-button
            type="danger"
            link
            @click="deleteUserImages([searchUserImageVO.id])"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      @change="searchSelfImage"
      :disabled="loading"
    />
  </div>
</template>

<style scoped lang="less">
.search {
  display: flex;
  margin: var(--maragin-base);

  & > * {
    margin-right: var(--maragin-base);

    &:last-child {
      margin-right: 0;
    }
  }
}

.alias {
  white-space: nowrap;
  overflow: hidden;
}
</style>
