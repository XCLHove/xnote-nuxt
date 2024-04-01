<script setup lang="ts">
import {
  deleteNoteById,
  getNoteById,
  pageSelfNote,
  updateNote,
} from "@/api/NoteApi.ts";
import type { Ref } from "vue";
import type { NotePageDTO } from "~/interfaces/entity/dto/NotePageDTO";
import type { Result } from "~/interfaces/Result";
import type { Note } from "~/interfaces/entity/Note";
import NoteIsPublic from "~/enums/NoteIsPublic";

const loading = ref(false);

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
  sizes: computed(() => {
    return getSizes(page.value.total);
  }),
  layout: computed(() => {
    const type = {
      phone: "total, sizes, prev, next",
      computer: "total, sizes, prev, pager, next, jumper",
    };
    if (window.innerWidth > 450) return type.computer;
    return type.phone;
  }),
  handleSizeChange: (value: number) => {
    page.value.size = value;
  },
  handleCurrentChange: (value: number) => {
    page.value.current = value;
  },
});
watch([() => page.value.current, () => page.value.size], () => {
  searchLocked = false; //分页数据发生变化，关闭搜索锁
  searchNote();
});

/** 搜索文本 */
const searchText = ref<{ title: string; content: string; keywords: string }>({
  title: "",
  content: "",
  keywords: "",
});
watch([searchText.value], () => {
  searchLocked = false; //搜索内容发生变化，关闭搜索锁
  loading.value = true;
  debounceSearchNote();
});

onMounted(() => {
  searchNote();
});

let searchLocked = false;

/** 搜索笔记（防抖） */
const debounceSearchNote = debounce(searchNote, 1.5);

/** 搜索笔记 */
async function searchNote() {
  if (searchLocked) return; //检测搜索锁是否开启
  searchLocked = true; //开启搜索锁
  loading.value = true;
  const notePageDTO: NotePageDTO = {
    searchContent: searchText.value.content,
    searchKeyword: searchText.value.keywords,
    searchTitle: searchText.value.title,
    current: page.value.current,
    size: page.value.size,
  };
  await pageSelfNote(notePageDTO)
    .then((result) => {
      page.value.total = result.data.total
        ? result.data.total
        : page.value.total;
      page.value.list = result.data.list ? result.data.list : page.value.list;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 删除笔记
 * @param noteId 笔记id
 */
function removeNote(noteId: number) {
  deleteNoteById(noteId).then(() => {
    elPrompt.success("删除成功！");
    page.value.list = page.value.list.filter((note: Note) => {
      if (note.id !== noteId) return note;
    });
    page.value.total--;
  });
}

/**
 * 预览笔记
 * @param noteId 笔记id
 */
function preview(noteId: number) {
  window.open(`/note/preview/${noteId}`, "_blank");
}

const tableHeight = computed(() => {
  return window.innerHeight - 210;
});

const changeNotePublicStatus = (note: Note) => {
  let newNote = { ...note };

  // 改为公开
  if (newNote.isPublic === NoteIsPublic.NO) {
    newNote.isPublic = NoteIsPublic.YES;
    updateNote(newNote).then((result: Result<Note>) => {
      elPrompt.success(result.message);
      note.isPublic = result.data.isPublic;
    });
    return;
  }

  // 改为非公开
  newNote.isPublic = NoteIsPublic.NO;

  // 判断是否有访问码，没有则需要设置
  if (!newNote.id) return;
  getNoteById({
    noteId: newNote.id,
  }).then((result: Result<Note>) => {
    if (result.data.accessCode) {
      updateNote(newNote).then((result: Result<Note>) => {
        elPrompt.success(result.message);
        note.isPublic = result.data.isPublic;
      });
      return;
    }

    ElMessageBox.prompt(
      "请设置访问码(为空则不可其他用户被搜索)",
      "未设置访问码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /[a-zA-Z0-9]{0,20}/,
        inputErrorMessage: "仅支持不超过20位的数字和字母",
        inputPlaceholder: "访问码为空则不可其他用户被搜索",
      },
    )
      .then(({ value }) => {
        // 确定
        newNote.accessCode = value;
        updateNote(newNote).then((result: Result<Note>) => {
          elPrompt.success(result.message);
          note.isPublic = result.data.isPublic;
        });
      })
      .catch(() => {
        // 取消
      });
  });
};

const removeLoginListener = onLogin(() => {
  searchLocked = false;
  searchNote();
});
const removeLogoutListener = onLogout(() => {
  page.value.list = [];
});
onUnmounted(() => {
  removeLoginListener();
  removeLogoutListener();
});
</script>

<template>
  <client-only>
    <div class="container">
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
      <div class="user-notes" v-loading="loading">
        <el-table :data="page.list" style="width: 100%" :height="tableHeight">
          <el-table-column fixed prop="title" label="笔记">
            <template #default="scope">
              <div @click="preview(scope.row.id)">
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
                @click="changeNotePublicStatus(scope.row)"
                class="public-status"
              >
                {{ scope.row.isPublic }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="150"
            class="operation"
          >
            <template #default="scope">
              <el-button link type="primary" @click="preview(scope.row.id)"
                >查看</el-button
              >
              <el-button
                link
                type="success"
                @click="
                  useRouter().push({
                    path: `/note/edit`,
                    query: {
                      noteId: scope.row.id,
                    },
                  })
                "
                >修改</el-button
              >
              <el-button link type="danger" @click="removeNote(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
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

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .search-part {
    display: flex;
    margin: 10px 0;

    .el-input {
      margin-right: 10px;
    }
  }

  .user-notes {
    .public-status:hover {
      text-decoration: underline @color-info;
      font-weight: bold;
      color: @color-primary;
    }

    .operation {
      .el-button {
        width: fit-content;
        margin: 0;
        padding: 0;
      }
    }
  }

  .page {
    margin-top: 5px;
  }
}
</style>
