<script setup lang="ts">
// 搜索文本
import type { Ref } from "vue";
import NoteIsPublic from "~/enums/NoteIsPublic";
import { pageNote } from "~/api/NoteApi";

const searchText = ref({
  title: "",
  content: "",
  keywords: "",
});

watch(searchText.value, () => {
  debounceSearchNote();
});

const loading = ref(false);

function getRouterParam() {
  const title = useRoute().query.title as string;
  const keywords = useRoute().query.keywords as string;
  const content = useRoute().query.content as string;
  searchText.value.title = title ? title : "";
  searchText.value.content = content ? content : "";
  searchText.value.keywords = keywords ? keywords : "";
}

const searchNote = async () => {
  await pageNote({
    current: page.value.current,
    list: [],
    searchContent: "",
    searchKeyword: "",
    searchTitle: "",
    size: page.value.size,
  }).then((res) => {
    page.value.list = res.data.list;
    page.value.total = res.data.total || page.value.total;
  });
};
const debounceSearchNote = debounce(searchNote, 1.5);

onMounted(() => {
  getRouterParam();
  searchNote();
});

/**
 * 预览笔记
 * @param noteId 笔记id
 */
function preview(noteId: number) {
  window.open(`/note/preview/${noteId}`, "_blank");
}

/** 分页 */
const page: Ref<{
  total: number;
  current: number;
  size: number;
  list: any[];
  layout: string;
  sizes: number[];
  handleSizeChange: (value: number) => void;
  handleCurrentChange: (value: number) => void;
}> = ref({
  total: 0,
  current: 1,
  size: 10,
  list: [],
  layout: computed(() => {
    const type = {
      phone: "total, sizes, prev, next",
      computer: "total, sizes, prev, pager, next, jumper",
    };
    if (useDevice().isDesktop) return type.computer;
    return type.phone;
  }),
  sizes: computed(() => {
    return getSizes(page.value.total);
  }),
  handleSizeChange: (value: number) => {
    page.value.size = value;
  },
  handleCurrentChange: (value: number) => {
    page.value.current = value;
  },
});

watch([() => page.value.current, () => page.value.size], () => {
  searchNote();
});

const tableHeight = ref(500);
onMounted(() => {
  tableHeight.value = window.innerHeight - 210;
});
</script>

<template>
  <client-only>
    <div class="container">
      <!--搜索输入框-->
      <div class="search-part">
        <el-input
          v-model="searchText.title"
          placeholder="搜索标题"
          @keyup.enter="debounceSearchNote"
        />
        <el-input
          v-model="searchText.keywords"
          placeholder="搜索关键词"
          @keyup.enter="debounceSearchNote"
        />
        <el-input
          v-model="searchText.content"
          placeholder="搜索笔记内容"
          @keyup.enter="debounceSearchNote"
        />
        <el-button type="primary" @click="searchNote">搜索</el-button>
      </div>
      <!--数据展示-->
      <div class="table-data" v-loading="loading">
        <el-table :data="page.list" :height="tableHeight">
          <el-table-column prop="title" label="笔记">
            <template #default="scope">
              <div class="note-list-item" @click="preview(scope.row.id)">
                {{ scope.row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="isPublic" label="是否公开" width="80">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.isPublic === NoteIsPublic.YES ? 'success' : 'danger'
                "
                >{{ scope.row.isPublic }}</el-tag
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--分页-->
      <div class="page">
        <el-pagination
          :layout="page.layout"
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="page.sizes"
          :background="true"
          :total="page.total"
          @size-change="page.handleSizeChange"
          @current-change="page.handleCurrentChange"
        />
      </div>
    </div>
  </client-only>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .search-part {
    display: flex;
    text-align: center;
    margin: 10px 0;

    .el-input {
      margin-right: 10px;
    }
  }

  .table-data {
    display: block;
  }

  .page {
    margin-top: 5px;
  }
}
</style>
