<script setup lang="ts">
import { searchNoteApi } from '~/apis/noteApi'
import type { PageVO } from '~/types/vo/PageVO'
import type { Note } from '~/types/table/Note'

definePageMeta({
  layout: PageMetaUtil.layout(),
})

const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - 200)

const page = ref<PageVO<Note>>({
  current: 1,
  size: 10,
  total: 0,
  records: [],
})

const searchText = ref('')
const loading = ref(false)

const search = debounce(
  () => {
    searchNoteApi({
      current: page.value.current,
      size: page.value.size,
      search: searchText.value,
      heightLightPreTag: '<span style="color: var(--color-danger)">',
      heightLightPostTag: '</span>',
    })
      .then((result) => {
        page.value = result.data
      })
      .finally(() => {
        setTimeout(() => {
          loading.value = false
        }, 300)
      })
  },
  500,
  () => {
    loading.value = true
  },
)
onMounted(search)
</script>

<template>
  <div>
    <div class="search">
      <el-input
        v-model="searchText"
        placeholder="搜索"
        @keydown.enter="search"
        @input="search"
      ></el-input>
      <el-button type="primary" @click="search" :disabled="loading"
        >搜索</el-button
      >
    </div>
    <div class="list">
      <el-table :data="page.records" :height="tableHeight" v-loading="loading">
        <el-table-column prop="title">
          <template #default="{ row: note }: { row: Note }">
            <a
              :href="`/note/preview/${note.id}`"
              target="_blank"
              class="el-link item"
            >
              <h2 class="title" v-safe-html="note.title"></h2>
              <p class="content" v-safe-html="note.content"></p>
            </a>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <Pagination
      v-model:page-size="page.size"
      v-model:current-page="page.current"
      :total="page.total"
      @change="search"
      :disabled="loading"
    ></Pagination>
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

.list {
  .item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .title {
      //font-size: 25px;
    }

    .content {
      width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
