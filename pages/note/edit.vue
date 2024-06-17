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

// 剪贴板
const { copy } = useClipboard();

/**当前正在编辑的笔记*/
const note: Ref<Note> = ref({
  title: "",
  keywords: [],
  content: "",
  isPublic: NoteIsPublic.NO,
  accessCode: "",
});

/**监听笔记变化*/
const watchNoteChange = (() => {
  let watched = false;
  return () => {
    if (watched) return;
    watched = true;
    watch(note.value, () => {
      saveStatus.value = SaveStatus.unSave;
    });
  };
})();

// 笔记存储状态
const SaveStatus = {
  unSave: {
    type: "info",
    description: "点我保存",
  },
  saving: {
    type: "warning",
    description: "正在保存",
  },
  saved: {
    type: "success",
    description: "无需保存",
  },
  failed: {
    type: "danger",
    description: "保存失败",
  },
};
const saveStatus = ref(SaveStatus.unSave);

/**是否展示关键词*/
const showKeywords = computed(() => {
  return note.value.keywords?.length > 0;
});

/**输入的关键词*/
const keywordInput = ref("");

/**获取笔记，发布新笔记时不会获取*/
const getNote = async () => {
  // 解析url中的参数
  const urlSearchParams = new URLSearchParams(window.location.search);
  const noteId = urlSearchParams.get("noteId");

  if (!noteId) return;
  note.value.id = parseInt(noteId);

  // 通过笔记id获取笔记
  await getNoteById({
    noteId: note.value.id,
  }).then(({ data }) => {
    note.value = data;
    saveStatus.value = SaveStatus.saved;
  });
};

let vditor: Vditor | null = null;
/**渲染markdown编辑器*/
const renderMarkdownEditor = () => {
  vditor = new Vditor("vditor", {
    cdn: `${location.origin}/cdn/vditor`,
    width: "100%",
    height: window.innerHeight - 300,
    after() {
      vditor?.setValue(note.value.content || "");
    },
    cache: {
      enable: false,
    },
    upload: {
      async handler(files: File[]): Promise<string> {
        return (await handleUploadImage)(files);
      },
    },
    input(value: string) {
      note.value.content = value;
    },
    toolbar: [
      "emoji",
      "headings",
      "bold",
      "italic",
      "strike",
      "link",
      "|",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "|",
      "quote",
      "line",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "upload",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      "fullscreen",
      "edit-mode",
      {
        name: "more",
        toolbar: ["export", "outline", "preview"],
      },
    ],
    image: {
      isPreview: false,
    },
  });
};

onMounted(() => {
  onClient(() => {
    getNote().then(() => {
      renderMarkdownEditor();
      watchNoteChange();
    });
  });
});

/**保存笔记*/
const save = async () => {
  // 检查访问码格式
  if (!validateAccessCode()) return;

  saveStatus.value = SaveStatus.saving;

  //开始保存笔记，id存在则为修改，不存在则为保存
  try {
    if (note.value.id) {
      // 修改笔记
      await updateNote(note.value).then(() => {
        elPrompt.success("修改成功！");
        saveStatus.value = SaveStatus.saved;
        vditor?.clearCache();
      });
    } else {
      // 新建笔记
      await addNote(note.value).then(({ data }) => {
        note.value.id = data.id;
        note.value.title ||= data.title;
        elPrompt.success("保存成功！");
        saveStatus.value = SaveStatus.saved;
        vditor?.clearCache();
      });
    }
  } catch (e: any) {
    const res = e as Result<any>;
    // 用户未登录或登录失效
    if (res.status === ResultStatus.USER_TOKEN_EXCEPTION) {
      saveStatus.value = SaveStatus.unSave;
      // 监听登录事件，登录后保存笔记
      const removeLoginListener = onLogin(() => {
        save();
        // 移除监听器
        removeLoginListener();
      });
      return;
    }
    saveStatus.value = SaveStatus.failed;
  }
};

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
    let mdImageUrl = "";
    for (const imageFile of files) {
      // 检查图片大小
      if (imageFile.size > Math.pow(1024, 2) * 10) {
        elPrompt.warning("图片不能超过10MB");
        continue;
      }

      // 上传图片
      await uploadImage(imageFile).then(({ data: image }) => {
        const imageUrl = `${serverUrl}/image/downloadByName/${image.name}`;
        mdImageUrl += `![${image.name}](${imageUrl})`;
      });
    }

    // 复制图片url到剪贴板
    await copy(mdImageUrl).then(() => {
      elPrompt.success("图片url已复制到剪贴板，请粘贴到Markdown中");
    });

    return mdImageUrl;
  };
})();

/**
 * 验证访问码的格式
 * @return {boolean} 验证是否通过
 */
const validateAccessCode = (): boolean => {
  const reg = /^[a-zA-Z0-9]{0,20}$/;
  const validatePass = reg.test(note.value.accessCode || "");
  if (!validatePass) {
    elPrompt.error("访问码仅支持不超过20位的数字和字母", 2);
  }
  return validatePass;
};
</script>

<template>
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
  </div>
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
