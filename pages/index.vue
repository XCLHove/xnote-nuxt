<script setup lang="ts">
import type { Ref } from "vue";
import { pageNote } from "~/api/NoteApi";
import type { Note } from "~/interfaces/entity/Note";
import "element-plus/dist/index.css";
import NoteIsPublic from "~/enums/NoteIsPublic";
import onClient from "~/utils/onClient";

// 表格高度
const tableHeight = (() => {
  const { height } = useWindowSize();
  return computed(() => {
    return height.value - 210;
  });
})();
// 是否加载(搜索)中
const loading = ref(false);

// 搜索文本
const searchText = ref({
  title: "",
  content: "",
  keywords: "",
});
watch(searchText.value, () => {
  searchNoteLocked = false;
  loading.value = true;
  debounceSearchNote();
});

/** 获取路由参数 */
const getRouterParam = () => {
  const { title, content, keywords } = useRoute().query as {
    title: string;
    keywords: string;
    content: string;
  };
  searchText.value.title = title || "";
  searchText.value.content = content || "";
  searchText.value.keywords = keywords || "";
};

// 搜索加锁以保证搜索不会重复请求
let searchNoteLocked = false;
/** 搜索笔记 */
const searchNote = async () => {
  if (searchNoteLocked) {
    loading.value = false;
    return;
  }
  searchNoteLocked = true;

  loading.value = true;
  await pageNote({
    current: page.value.current,
    size: page.value.size,
    searchContent: searchText.value.content,
    searchKeyword: searchText.value.keywords,
    searchTitle: searchText.value.title,
  })
    .then((res) => {
      notes.value = res.data.list || [];
      page.value.total = res.data.total || page.value.total;
    })
    .finally(() => {
      loading.value = false;
    });
};
/** 搜索笔记防抖 */
const debounceSearchNote = debounce(searchNote, 1.5);

/** 分页 */
const page: Ref<{
  total: number;
  current: number;
  size: number;
  layout: string;
  sizes: number[];
  handleSizeChange: (value: number) => void;
  handleCurrentChange: (value: number) => void;
}> = ref({
  total: 0,
  current: 1,
  size: 10,
  layout: computed(() => {
    const type = {
      phone: "total, sizes, prev, next",
      computer: "total, sizes, prev, pager, next, jumper",
    };
    if (useDevice().isDesktop) return type.computer;
    return type.phone;
  }),
  sizes: computed(() => getSizes(page.value.total)),
  handleSizeChange: (value: number) => {
    page.value.size = value;
  },
  handleCurrentChange: (value: number) => {
    page.value.current = value;
  },
});
watch([() => page.value.current, () => page.value.size], () => {
  searchNoteLocked = false;
  searchNote();
});

/** 笔记列表 */
const notes: Ref<Note[]> = ref([]);

/**
 * 预览笔记
 * @param noteId 笔记id
 */
const preview = (noteId: number) => {
  const url = `${window.location.origin}/note/preview/${noteId}`;
  window.open(url, "_blank");
};

onClient(() => {
  onMounted(() => {
    getRouterParam();
    searchNote();
  });
});
</script>

<template>
  <div class="container">
    <!--搜索输入框-->
    <div class="search-part">
      <el-input
        v-model="searchText.title"
        placeholder="搜索标题"
        @keyup.enter="searchNote"
      />
      <el-input
        v-model="searchText.keywords"
        placeholder="搜索关键词"
        @keyup.enter="searchNote"
      />
      <el-input
        v-model="searchText.content"
        placeholder="搜索笔记内容"
        @keyup.enter="searchNote"
      />
      <el-button type="primary" @click="searchNote">搜索</el-button>
    </div>
    <!--数据展示-->
    <client-only>
      <div class="table-data" v-loading="loading">
        <el-table :data="notes" :height="tableHeight">
          <el-table-column prop="title" label="笔记">
            <template #default="scope">
              <el-link @click="preview(scope.row.id)" target="_blank">
                {{ scope.row.title }}
              </el-link>
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
    </client-only>
    <!--分页-->
    <div class="page">
      <el-pagination
        :layout="page.layout"
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :disabled="loading"
        :page-sizes="page.sizes"
        :background="true"
        :total="page.total"
        @size-change="page.handleSizeChange"
        @current-change="page.handleCurrentChange"
      />
    </div>
  </div>
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

  .note-list {
    .note-row {
      border-bottom: 1px solid var(--el-border-color);
      margin: 0;
      font-size: 2em;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
