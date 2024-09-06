<script setup lang="ts">
import type { SearchNoteVO } from '~/types/vo/SearchNoteVO'
import type { PageVO } from '~/types/vo/PageVO'
import type { NoteType } from '~/types/table/NoteType'
import {
  batchUpdateNoteOfTypeApi,
  deleteNoteByIdsApi,
  searchUserNoteApi,
  updateNoteApi,
} from '~/apis/noteApi'
import { deleteNoteTypeByIdsApi, getUserNoteTypesApi } from '~/apis/noteTypeApi'
import type { ShareNoteComponent } from '~/components'
import ShareNote from '~/components/ShareNote.vue'

definePageMeta({
  layout: PageMetaUtil.layout(),
})

const {
  params: { userId },
  query: { current, size },
} = useRoute()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const inputFocus = ref(false)

const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - 200)
const page = ref<PageVO<SearchNoteVO>>({
  current: current ? parseInt(current as string) : 1,
  size: size ? parseInt(size as string) : 10,
  total: 0,
  records: [],
})
const searchText = ref('')

const loading = ref(false)

const noteTypes = ref<NoteType[]>([])
const typeId = ref<number | null>(null)
const getNoteTypes = async () => {
  await getUserNoteTypesApi(userId as string).then(({ data }) => {
    noteTypes.value = data
  })
}

const searchUserNote = () => {
  if (!userId) {
    ShowLoginUtil.show()
    return
  }

  loading.value = true
  searchUserNoteApi(<string>userId, {
    current: page.value.current,
    size: page.value.size,
    typeId: typeId.value,
    search: searchText.value,
  })
    .then(({ data }) => {
      page.value = data
    })
    .finally(() => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        loading.value = false
      }, 300)
    })
}
onMounted(() => {
  getNoteTypes().then(searchUserNote)

  const removeOnSetListener = TokenUtil.onSet(searchUserNote)
  const removeOnRemoveListener = TokenUtil.onRemove(searchUserNote)
  onUnmounted(() => {
    removeOnSetListener()
    removeOnRemoveListener()
  })
})
watch(typeId, searchUserNote)

const editNote = (noteId: number | string) => {
  open(`/note/edit?noteId=${noteId}`, '_blank')
}
const selectIds = ref<number[]>([])
const deleteNoteByIds = (noteIds: number[]) => {
  deleteNoteByIdsApi(noteIds).then(() => {
    searchUserNote()
    ElMessage.success('删除成功')
  })
}

const updateNote = (note: SearchNoteVO) => {
  updateNoteApi({
    id: note.id,
    typeId: note.typeId,
    isPublic: note.isPublic,
  }).then(() => {
    ElMessage.success('修改成功')
  })
}

const batchNoteType = ref<number | null>(null)
const batchUpdateNoteOfType = (noteIds: number[], typeId: number) => {
  batchUpdateNoteOfTypeApi({
    noteIds,
    typeId,
  })
    .then(() => {
      ElMessage.success('修改成功')
    })
    .then(searchUserNote)
}

const disableChangeType = ref(false)
const deleteNoteType = (noteType: NoteType) => {
  disableChangeType.value = true
  deleteNoteTypeByIdsApi([noteType.id])
    .then(() => {
      ElMessage.success('删除成功')
    })
    .then(getNoteTypes)
    .finally(() => {
      disableChangeType.value = false
    })
}

const addNoteType = () => {
  NoteTypeUtil.add()
    .then(getNoteTypes)
    .catch(() => {})
}

const updateNoteType = (noteType: NoteType) => {
  NoteTypeUtil.update({
    id: noteType.id,
    name: noteType.name,
  })
    .then(getNoteTypes)
    .catch(() => {})
}

const shareNoteRef = ref<ShareNoteComponent>()
</script>

<template>
  <div>
    <div class="search">
      <el-input
        v-model="searchText"
        placeholder="搜索"
        @keydown.enter="searchUserNote"
        :disabled="loading"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
      ></el-input>
      <el-select
        class="type-select"
        v-show="!inputFocus"
        v-model="typeId"
        :disabled="loading"
      >
        <template #header>
          <el-text>笔记类型</el-text>
        </template>
        <el-option label="全部" value="null" @click="typeId = null" />
        <el-tooltip
          v-for="noteType in noteTypes"
          :content="noteType.name"
          :key="noteType.id"
          placement="left"
        >
          <el-option
            :value="noteType.id"
            :label="noteType.name"
            :disabled="noteType.id === typeId"
          />
        </el-tooltip>
      </el-select>
      <el-button
        v-show="!inputFocus"
        type="primary"
        @click="searchUserNote"
        :disabled="loading"
        >搜索</el-button
      >
    </div>
    <div class="list">
      <el-table
        v-if="userInfo?.id !== parseInt(<string>userId)"
        :data="page.records"
        :height="tableHeight"
        v-loading="loading"
      >
        <el-table-column prop="title">
          <template #default="{ row: note }: { row: SearchNoteVO }">
            <el-link :href="`/note/preview/${note.id}`" target="_blank">{{
              note.title
            }}</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-table
        v-else
        :data="page.records"
        :height="tableHeight"
        v-loading="loading"
        @selection-change="
          (notes: SearchNoteVO[]) => (selectIds = notes.map((note) => note.id))
        "
      >
        <el-table-column type="selection" width="30" />
        <el-table-column prop="title" fixed="left" min-width="130">
          <template #header>
            <el-select
              class="type-select"
              v-model="batchNoteType"
              @change="
                batchUpdateNoteOfType(selectIds, batchNoteType as number)
              "
              :disabled="selectIds.length === 0 || disableChangeType"
            >
              <template #header>
                <div class="change-note-type-header">
                  <el-text>批量修改类型</el-text>
                  <el-tooltip content="添加类型">
                    <img
                      @click="addNoteType()"
                      src="/icon/add.svg"
                      alt="add.svg"
                    />
                  </el-tooltip>
                </div>
              </template>
              <el-tooltip
                v-for="noteType in noteTypes"
                :key="noteType.id"
                :content="noteType.name"
                placement="right"
                effect="light"
              >
                <template #content>
                  <el-button
                    link
                    type="danger"
                    @click="deleteNoteType(noteType)"
                    >删除</el-button
                  >
                  <el-button
                    link
                    type="primary"
                    @click="updateNoteType(noteType)"
                  >
                    修改
                  </el-button>
                </template>
                <el-option
                  :value="noteType.id"
                  :label="noteType.name"
                  :disabled="noteType.id === batchNoteType"
                />
              </el-tooltip>
            </el-select>
            <el-popconfirm
              :title="`确认删除 ${selectIds.length} 条笔记吗？`"
              @confirm="deleteNoteByIds(selectIds)"
            >
              <template #reference>
                <el-button type="danger" link :disabled="selectIds.length === 0"
                  >批量删除</el-button
                >
              </template>
            </el-popconfirm>
          </template>
          <template #default="{ row: note }: { row: SearchNoteVO }">
            <el-scrollbar>
              <el-tooltip :content="note.title">
                <a class="el-link" :href="`/note/preview/${note.id}`">
                  {{ note.title }}
                </a>
              </el-tooltip>
            </el-scrollbar>
          </template>
        </el-table-column>
        <el-table-column prop="isPublic" label="公开笔记" width="80">
          <template #default="{ row: note }: { row: SearchNoteVO }">
            <el-switch
              v-model="note.isPublic"
              @change="updateNote(note)"
              :active-value="'公开' as typeof note.isPublic"
              :inactive-value="'非公开' as typeof note.isPublic"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="typeId" label="类型" width="130">
          <template #default="{ row: note }: { row: SearchNoteVO }">
            <el-select
              class="type-select"
              v-model="note.typeId"
              @change="updateNote(note)"
              :disabled="disableChangeType"
            >
              <template #header>
                <div class="change-note-type-header">
                  <el-text>修改类型</el-text>
                  <el-tooltip content="添加类型">
                    <img
                      @click="addNoteType()"
                      src="/icon/add.svg"
                      alt="add.svg"
                    />
                  </el-tooltip>
                </div>
              </template>
              <el-tooltip
                v-for="noteType in noteTypes"
                :key="noteType.id"
                :content="noteType.name"
                placement="right"
                effect="light"
              >
                <template #content>
                  <el-button
                    link
                    type="danger"
                    @click="deleteNoteType(noteType)"
                    >删除</el-button
                  >
                  <el-button
                    link
                    type="primary"
                    @click="updateNoteType(noteType)"
                  >
                    修改
                  </el-button>
                </template>
                <el-option
                  :value="noteType.id"
                  :label="noteType.name"
                  :disabled="noteType.id === batchNoteType"
                />
              </el-tooltip>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="150" label="操作" fixed="right">
          <template #default="{ row: note }: { row: SearchNoteVO }">
            <div class="operation">
              <el-button
                link
                type="success"
                @click="() => shareNoteRef?.share(note)"
                >分享</el-button
              >
              <el-button link type="primary" @click="editNote(note.id)">
                编辑
              </el-button>
              <el-button link type="danger" @click="deleteNoteByIds([note.id])">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ShareNote ref="shareNoteRef" />
    <Pagination
      v-model:page-size="page.size"
      v-model:current-page="page.current"
      :total="page.total"
      @change="searchUserNote"
    ></Pagination>
  </div>
</template>

<style scoped lang="less">
.type-select {
  min-width: 100px;
  max-width: 100px;
}

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

.change-note-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    height: 1em;
    width: 1em;

    &:hover {
      opacity: 0.5;
    }
  }
}

.list {
  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: 1px underline var(--color-info);
  }

  .operation {
    display: flex;
    justify-content: flex-end;
  }

  .header-operations {
    display: flex;

    .el-select {
      max-width: 100px;
      min-width: 100px;
    }
  }
}
</style>
