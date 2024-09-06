<script setup lang="ts">
import { addNoteApi, getNoteByIdApi, updateNoteApi } from '~/apis/noteApi'
import type { NoteType } from '~/types/table/NoteType'
import { getUserNoteTypesApi } from '~/apis/noteTypeApi'
import type { Note } from '~/types/table/Note'
import KeydownUtil from '~/utils/KeydownUtil'

definePageMeta({
  layout: PageMetaUtil.layout(),
})
const {
  query: { noteId },
} = useRoute()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const loading = ref(false)

const defaultNoteType: NoteType = {
  name: '默认',
  id: 0,
  userId: 0,
}
const noteTypes = ref<NoteType[]>([defaultNoteType])
const getNoteTypes = () => {
  if (!userInfo.value) {
    return
  }
  getUserNoteTypesApi(userInfo.value.id).then(({ data }) => {
    noteTypes.value = data
    note.value.typeId = data[0].id
  })
}
onMounted(() => {
  if (userInfo.value) {
    getNoteTypes()
    return
  }
  const removeCallback = userStore.afterRefresh(getNoteTypes)
  onUnmounted(removeCallback)
})

const note = ref<Note>({
  id: 0,
  title: '',
  content: '',
  isPublic: '公开',
  typeId: 0,
  releaseTime: '',
  updateTime: '',
  userId: 0,
})
const getNoteById = () => {
  if (!noteId) {
    return
  }
  getNoteByIdApi(<string>noteId).then(({ data }) => {
    data.typeId ||= note.value.typeId
    note.value = data
  })
}
onMounted(getNoteById)

const saveOrUpdate = async () => {
  loading.value = true
  if (note.value.id > 0) {
    await updateNote().finally(() => {
      loading.value = false
    })
    return
  }

  await addNote().finally(() => {
    loading.value = false
  })
}

const addNote = async () => {
  await addNoteApi({
    content: note.value.content,
    isPublic: note.value.isPublic,
    title: note.value.title,
    typeId: <number>note.value.typeId,
  }).then(({ data: id }) => {
    note.value.id = id
    ElMessage.success('保存成功')
  })
}

const updateNote = async () => {
  await updateNoteApi({
    id: note.value.id,
    content: note.value.content,
    isPublic: note.value.isPublic,
    title: note.value.title,
    typeId: note.value.typeId,
  }).then(() => {
    ElMessage.success('保存成功')
  })
}

const titleInputFocus = ref(false)
</script>

<template>
  <div class="edit-box" v-loading="loading">
    <div class="exclude-content-edit">
      <el-input
        v-model="note.title"
        placeholder="标题"
        @focus="titleInputFocus = true"
        @blur="titleInputFocus = false"
        @keydown.ctrl="KeydownUtil.ifCtrlS($event, saveOrUpdate)"
      ></el-input>
      <el-select v-show="!titleInputFocus" v-model="note.isPublic">
        <template #header>
          <el-text style="display: flex; justify-content: center"
            >是否公开</el-text
          >
        </template>
        <el-option label="公开" value="公开">
          <el-text type="success">公开</el-text>
        </el-option>
        <el-option label="非公开" value="非公开">
          <el-text type="danger">非公开</el-text>
        </el-option>
      </el-select>
      <el-select v-show="!titleInputFocus" v-model="note.typeId">
        <template #header>
          <el-text style="display: flex; justify-content: center"
            >笔记类型</el-text
          >
        </template>
        <el-tooltip v-for="noteType in noteTypes" :content="noteType.name">
          <el-option :value="noteType.id" :label="noteType.name"></el-option>
        </el-tooltip>
      </el-select>
      <el-button v-show="!titleInputFocus" type="primary" @click="saveOrUpdate"
        >保存</el-button
      >
    </div>
    <div class="content-edit">
      <MarkdownEdit v-model="note.content" @save="saveOrUpdate" />
    </div>
  </div>
</template>

<style scoped lang="less">
.edit-box {
  display: flex;
  flex-direction: column;
  padding: var(--padding-base);

  & > * {
    padding-bottom: var(--padding-base);

    &:last-child {
      padding-bottom: 0;
    }
  }

  .exclude-content-edit {
    display: flex;

    .el-select {
      min-width: 100px;
      max-width: 100px;
    }

    & > * {
      margin-right: var(--maragin-base);
    }

    *:last-child {
      margin-right: 0;
    }
  }

  .content-edit {
    //height: calc(100% - 52px);
    width: 100%;
    flex-grow: 1;
    overflow: auto;
  }
}
</style>
