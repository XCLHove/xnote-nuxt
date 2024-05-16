<script setup lang="ts">
import ResultStatus from "~/enums/ResultStatus";
import { getNoteById } from "~/api/NoteApi";
import VditorPreview from "vditor/dist/method.min";
import "vditor/src/assets/less/index.less";
import type { Ref } from "vue";

// 路由参数
let { noteId } = useRoute().params as { noteId: string };
let { accessCode } = useRoute().query as { accessCode: string };

// 访问码
let needInputAccessCode = false;
onMounted(() => needInputAccessCode && setTimeout(getNote));

// 笔记信息
const note = await getNoteById({ noteId, accessCode }).then((result) => {
  needInputAccessCode =
    result.status === ResultStatus.NOTE_ACCESS_CODE_EXCEPTION;
  return ref(result.data);
});
const noteContent = ref() as Ref<HTMLDivElement>;
const showNote = ref(false);
process.client &&
  onMounted(() => {
    note.value.content &&
      VditorPreview.preview(noteContent.value, note.value.content, {
        mode: "light",
        cdn: `${location.origin}/cdn/vditor`,
      }).then(() => (showNote.value = true));

    const removeWatch = watch(
      () => note.value.content,
      () => {
        if (!note.value.content) return;
        VditorPreview.preview(noteContent.value, note.value.content, {
          mode: "light",
          cdn: "/cdn/vditor",
        }).then(() => (showNote.value = true));
        removeWatch();
      },
    );
  });

// SEO优化
useHead({
  title: `${note.value.title}`,
  meta: [
    { name: "description", content: note.value.title },
    {
      name: "keywords",
      content: note.value.keywords,
    },
  ],
});

/**获取笔记*/
const getNote = () => {
  getNoteById({
    noteId,
    accessCode,
  }).then((result) => {
    if (result.status === ResultStatus.NOTE_ACCESS_CODE_EXCEPTION) {
      inputAccessCode();
    }

    note.value = result.data;
  });
};

/**输入访问码*/
const inputAccessCode = () => {
  elPrompt.error("访问码错误！");
  ElMessageBox.prompt("请输入访问码", "需要输入访问码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /[a-zA-Z0-9]{1,128}/,
    inputErrorMessage: "仅支持1-128位的数字字母",
  })
    .then(({ value }: { value: string }) => {
      // 确定
      accessCode = value;
      // 输入访问码后再次获取笔记
      getNote();
    })
    .catch(() => {
      // 取消
      elPrompt.warning("没有访问码，无法查看笔记！");
    });
};

/**预览图片*/
const imagePreview = ref({
  show: false,
  src: "",
  alt: "",
});
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

// 离开页面时修改title
onUnmounted(() => {
  useHead({
    title: "XNote",
  });
});
</script>

<template>
  <div class="title">
    <h1>{{ note.title }}</h1>
  </div>
  <div class="keywords">
    <el-tag
      v-for="keyword in note.keywords"
      :key="keyword"
      :closable="false"
      type="success"
    >
      {{ keyword }}
    </el-tag>
  </div>
  <div class="note" v-loading="!showNote">
    <div ref="noteContent" v-show="showNote">{{ note.content }}</div>
  </div>
  <!--图片预览-->
  <ImagePreview
    v-model:show="imagePreview.show"
    v-model:src="imagePreview.src"
    v-model:alt="imagePreview.alt"
  />
</template>

<style scoped lang="less">
.margin {
  margin: 10px auto;
}

.border {
  border-radius: 5px;
  border: #becece solid 1px;
}

.width95 {
  width: 95%;
  .margin();
}

.title {
  .border();
  .width95();

  h1 {
    text-align: center;
  }
}

.keywords {
  .border();
  .width95();

  .el-tag {
    height: 32px;
    margin: 5px;
    font-size: 16px;
  }
}

.note {
  .border();
  .width95();
  padding: 10px;
  box-sizing: border-box;
}
</style>
