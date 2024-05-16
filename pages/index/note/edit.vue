<script setup lang="ts">
import type { Ref } from "vue";
import type { Note } from "~/interfaces/entity/Note";
import NoteIsPublic from "~/enums/NoteIsPublic";
import { addNote, getNoteById, updateNote } from "~/api/NoteApi";
import { uploadImage } from "~/api/ImageApi";
import Vditor from "vditor";
import "vditor/src/assets/less/index.less";
import type { Result } from "~/interfaces/Result";
import ResultStatus from "~/enums/ResultStatus";

/**当前正在编辑的笔记*/
const note: Ref<Note> = ref({
  title: "",
  keywords: [],
  content: "",
  isPublic: NoteIsPublic.NO,
  accessCode: "",
});

/**输入的关键词*/
const keywordInput = ref("");

/**获取笔记，发布新笔记时不会获取*/
const getNote = async () => {
  // 从url获取笔记id
  const { noteId } = <string>useRoute().query;
  if (!noteId) {
    return;
  }
  note.value.id = parseInt(noteId);

  // 通过笔记id获取笔记
  await getNoteById({
    noteId: note.value.id,
    accessCode: "",
  }).then((result) => {
    note.value = result.data;
  });
};

let vditor: Vditor = void 0;
const vditorCacheId = "vditorCacheId";
process.client &&
  onMounted(() => {
    getNote().then(() => {
      vditor = new Vditor("vditor", {
        cdn: `${location.origin}/cdn/vditor`,
        width: "100%",
        height: window.innerHeight - 300,
        after() {
          note.value.content && vditor.setValue(note.value.content);
        },
        cache: {
          id: vditorCacheId,
        },
        upload: {
          async handler(files: File[]): Promise<string> {
            return (await handleUploadImage)(files);
          },
        },
      });
    });
  });

/**保存笔记*/
const save = async () => {
  note.value.content = vditor.getValue();

  // 检查访问码格式
  if (!validateAccessCode()) return;

  saveStatus.value = SaveStatus.saving;

  //开始保存笔记，id存在则为修改，不存在则为保存
  try {
    if (note.value.id) {
      await updateNote(note.value).then(() => {
        elPrompt.success("修改成功！");
        saveStatus.value = SaveStatus.saved;
      });
    } else {
      await addNote(note.value).then((result) => {
        note.value.id = result.data.id;
        note.value.title ||= result.data.title;
        elPrompt.success("保存成功！");
        saveStatus.value = SaveStatus.saved;
      });
    }
  } catch (e: Result<any>) {
    if (e.status === ResultStatus.USER_TOKEN_EXCEPTION) {
      saveStatus.value = SaveStatus.unSave;
      const remove = onLogin(() => {
        save();
        remove();
      });
      return;
    }
    saveStatus.value = SaveStatus.failed;
  }
};

/**是否展示关键词*/
const showKeywords = computed(() => {
  return note.value.keywords?.length > 0;
});

/**添加关键词*/
const addKeyword = () => {
  const newKeyword = keywordInput.value.trim();
  if (!newKeyword) {
    elPrompt.warning("关键词不能为空！");
    return;
  }
  if (newKeyword.length > 30) {
    elPrompt.warning("关键词不能超过30个字符！");
    return;
  }
  if (note.value.keywords.length + 1 >= 30) {
    elPrompt.warning("关键词数据不能超过30个！");
    return;
  }
  note.value.keywords.push(newKeyword);

  // 对关键词去重
  note.value.keywords = [...new Set(note.value.keywords)];

  // 清空关键词输入框
  keywordInput.value = "";
};

/**
 * 移除关键词
 * @param removeKeyword 要移除的关键词
 */
const removeKeyword = (removeKeyword: string) => {
  note.value.keywords = note.value.keywords.filter((keyword: string) => {
    return removeKeyword != keyword;
  });
};

/**
 * 处理上传图片
 */
const handleUploadImage = (async () => {
  const { serverUrl } = await getConfig();

  return async (files: File[]) => {
    for (const imageFile of files) {
      if (imageFile.size > Math.pow(1024, 2) * 10) {
        elPrompt.warning("图片不能超过10MB");
        continue;
      }

      await uploadImage(imageFile).then((result) => {
        const image = result.data;
        const imageUrl = `${serverUrl}/image/downloadByName/${image.name}`;
        vditor.setValue(vditor.getValue() + `![${image.name}](${imageUrl})`);
      });
    }
    return "";
  };
})();

// 笔记存储状态
const SaveStatus = {
  unSave: {
    type: "info",
    description: "未保存",
  },
  saving: {
    type: "warning",
    description: "保存中",
  },
  saved: {
    type: "success",
    description: "保存成功",
  },
  failed: {
    type: "danger",
    description: "保存失败",
  },
};
const saveStatus = ref(SaveStatus.unSave);
watch(
  () => note.value,
  () => {
    saveStatus.value = SaveStatus.unSave;
  },
);

/**
 * 验证访问码的格式
 * @return {boolean} 验证是否通过
 */
const validateAccessCode = () => {
  const reg = /^[a-zA-Z0-9]{0,20}$/;
  const validatePass = reg.test(<string>note.value.accessCode);
  if (!validatePass) {
    elPrompt.error("访问码仅支持不超过20位的数字和字母", 2);
  }
  return validatePass;
};

// 预览图片
const imagePreview: Ref<{ show: boolean; src: string; alt?: string }> = ref({
  show: false,
  src: "",
  alt: "",
});
process.client &&
  onMounted(() => {
    const previewListener = () => {
      const listener = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== "img") return;

        const imgEl = target as HTMLImageElement;
        imagePreview.value.src = imgEl.src;
        imagePreview.value.alt = imgEl.alt;
        imagePreview.value.show = true;
      };
      window.addEventListener("click", listener);

      return () => {
        window.removeEventListener("click", listener);
      };
    };
    const removePreviewListener = previewListener();
    onUnmounted(() => {
      removePreviewListener();
    });
  });
</script>

<template>
  <client-only>
    <div class="edit">
      <!--标题输入框-->
      <div class="edit-item">
        <div class="edit">
          <el-input v-model="note.title" inline="true" placeholder="标题" />
        </div>
        <div class="save-status">
          <el-tag size="large" :type="saveStatus.type" @click="save">{{
            saveStatus.description
          }}</el-tag>
        </div>
      </div>
      <!--关键词输入框-->
      <div class="edit-item">
        <div class="edit">
          <el-input
            placeholder="关键词"
            v-model="keywordInput"
            @keydown.enter="addKeyword"
          ></el-input>
        </div>
        <div class="operation">
          <el-button type="primary" @click="addKeyword">添加关键词</el-button>
        </div>
      </div>
      <!--是否公开笔记-->
      <div class="edit-item is-public">
        <div class="edit">
          <el-input
            v-model="note.accessCode"
            placeholder="访问码为空则不可被其他用户搜索"
            :disabled="note.isPublic === NoteIsPublic.YES"
            @blur="validateAccessCode"
          />
        </div>
        <div class="operation">
          <div class="switch">
            <el-switch
              v-model="note.isPublic"
              inline-prompt
              size="large"
              :active-value="NoteIsPublic.YES"
              :active-text="NoteIsPublic.YES"
              :inactive-value="NoteIsPublic.NO"
              :inactive-text="NoteIsPublic.NO"
            />
          </div>
        </div>
      </div>
      <!--关键词展示-->
      <div v-show="showKeywords" class="show-keywords">
        <el-scrollbar height="32px">
          <el-tag
            v-for="keyword in note.keywords"
            :key="keyword"
            closable
            type="success"
            @close="removeKeyword(keyword)"
          >
            {{ keyword }}
          </el-tag>
        </el-scrollbar>
      </div>
      <!--没有关键词时的展示-->
      <div v-show="!showKeywords" class="show-keywords no-keywords">
        <el-text type="info">暂无关键词</el-text>
      </div>
      <!--笔记编辑区域-->
      <div class="markdown">
        <div id="vditor"></div>
      </div>
      <!--图片预览-->
      <ImagePreview
        v-model:show="imagePreview.show"
        v-model:src="imagePreview.src"
        v-model:alt="imagePreview.alt"
      />
    </div>
  </client-only>
</template>

<style scoped lang="less">
.edit {
  width: 100%;

  .edit-item {
    display: flex;
    margin: 10px 0;
    width: 100%;

    .edit {
      margin-right: 10px;
      width: calc(100% - 110px);
    }

    .save-status {
      display: flex;
      justify-content: flex-end;
      width: 100px;
      overflow: hidden;

      .el-tag {
        width: 100%;

        &:hover {
          color: @color-primary;
          font-weight: bold;
        }
      }
    }

    .operation {
      width: 100px;
    }
  }

  .is-public {
    .switch {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 100%;
      height: 100%;

      .el-switch {
        height: fit-content;
        --el-switch-on-color: @color-success;
        --el-switch-off-color: @color-danger;
      }
    }
  }

  .show-keywords {
    margin: 10px 0;
    height: 32px;

    .el-tag {
      height: 32px;
      margin-right: 10px;
      font-size: 16px;
    }
  }

  .no-keywords {
    display: flex;
    align-items: center;
  }

  .markdown {
    .v-md-editor {
      height: calc(100vh - 310px);
    }
  }
}
</style>
