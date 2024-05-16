<script setup lang="ts">
import {
  deleteImageByIds,
  downloadImageById,
  pageImageList,
  updateImage,
} from "@/api/ImageApi";
import type { Image } from "~/interfaces/entity/Image";
import type { Ref } from "vue";

const isMobileWidth = computed(() => isMobile());

const config = await getConfig();

const loading = ref(false);

const searchAlias = ref("");
watch(
  () => searchAlias.value,
  () => {
    loading.value = true;
    pageImageLocked = false;
    pageImageDebounce();
  },
);

const images: Ref<Image[]> = ref([]);
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
    if (window.innerWidth > 450) return type.computer;
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
  pageImageLocked = false;
  pageImage();
});

let pageImageLocked = false;
const pageImage = () => {
  if (pageImageLocked) return;
  pageImageLocked = true;

  loading.value = true;

  pageImageList({
    current: page.value.current,
    size: page.value.size,
    searchAlias: searchAlias.value,
  })
    .then((result) => {
      images.value = result.data.list ? result.data.list : [];
      page.value.total = result.data.total ? result.data.total : 0;
    })
    .finally(() => {
      loading.value = false;
    });
};
const pageImageDebounce = debounce(pageImage, 2);

process.client &&
  onMounted(async () => {
    pageImage();
  });

const tableHeight = computed(() => {
  return window.innerHeight - 200;
});

// 选中的图片
const selectImageIds: Ref<number[]> = ref([]);
/**
 * 处理选中的图片
 * @param images 图片列表
 */
const handleSelectImageChange = (images: Image[]) => {
  selectImageIds.value = [];
  images.forEach((image) => {
    selectImageIds.value.push(image.id);
  });
};

/**
 * 复制图片url
 * @param image 图片信息
 */
const copyImageUrl = (image: Image) => {
  copyTextToClipboard(`${config.serverUrl}/image/downloadByName/${image.name}`);
};

/**
 * 复制图片为markdown中的url
 * @param image 图片信息
 */
const copyImageUrlForMarkdown = (image: Image) => {
  copyTextToClipboard(
    `![${image.alias}](${config.serverUrl}/image/downloadByName/${image.name})`,
  );
};

/**
 * 删除图片
 * @param imageIds 图片id列表
 */
const deleteImages = (imageIds: number[]) => {
  ElMessageBox.confirm("删除后不可恢复", `确认删除${imageIds.length}项？`, {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteImageByIds(imageIds).then((result) => {
        elPrompt.success(result.message);

        pageImageLocked = false;
        pageImage();
      });
    })
    .catch(() => {});
};

// 当前预览的图片
const currentPreviewImage: Ref<{
  src: string;
  show: boolean;
  alt: string;
}> = ref({
  src: "",
  show: false,
  alt: "",
});
const previewImageLocked = ref(false);
/**
 * 预览图片
 * @param image 图片信息
 */
const previewImage = (image: Image) => {
  if (previewImageLocked.value) return;
  previewImageLocked.value = true;

  currentPreviewImage.value.alt = image.alias;
  downloadImageById(image.id)
    .then((result) => {
      currentPreviewImage.value.src = URL.createObjectURL(result);
      currentPreviewImage.value.show = true;
    })
    .finally(() => {
      previewImageLocked.value = false;
    });
};

/**
 * 修改图片信息
 * @param image 图片信息
 */
const changeImage = (image: Image) => {
  ElMessageBox.prompt("需要输入图片别名（1-100位）", "修改图片别名", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.{1,100}/,
    inputErrorMessage: "仅支持1-128位的字符",
  })
    .then(({ value }: { value: string }) => {
      // 确定
      updateImage({ ...image, alias: value }).then((result) => {
        elPrompt.success(result.message);
        image.alias = value;
      });
    })
    .catch(() => {});
};

// 登录/登出自动刷新列表
process.client &&
  onMounted(() => {
    const removeLoginListener = onLogin(() => {
      pageImageLocked = false;
      pageImage();
    });
    const removeLogoutListener = onLogout(() => {
      images.value = [];
    });
    onUnmounted(() => {
      removeLoginListener();
      removeLogoutListener();
    });
  });
</script>

<template>
  <ClientOnly>
    <div class="container">
      <div class="operation">
        <el-input
          placeholder="搜索别名"
          v-model="searchAlias"
          @keydown.enter="pageImage"
        ></el-input>
        <el-button type="primary" @click="pageImage">搜索</el-button>
        <el-button
          type="danger"
          @click="deleteImages(selectImageIds)"
          :disabled="selectImageIds.length === 0"
          >批量删除({{ selectImageIds.length }})</el-button
        >
      </div>
      <div class="image-list" v-loading="loading || previewImageLocked">
        <el-table
          :data="images"
          :height="tableHeight"
          @selectionChange="handleSelectImageChange"
        >
          <el-table-column v-if="isMobileWidth" type="expand" width="30">
            <template #default="scope">
              <div>
                <el-button link type="success" @click="copyImageUrl(scope.row)"
                  >复制url</el-button
                >
                <el-button
                  link
                  type="success"
                  @click="copyImageUrlForMarkdown(scope.row)"
                  >复制为markdown</el-button
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="30" />
          <el-table-column label="图片别名" width="100">
            <template #default="scope">
              <el-popover
                placement="top-start"
                trigger="hover"
                content="点击查看图片"
              >
                <template #reference>
                  <span class="image-alias" @click="previewImage(scope.row)">
                    {{ scope.row.alias }}
                  </span>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="上一次访问的时间" min-width="170">
            <template #default="scope">
              {{ formatDate(scope.row.lastDownloadTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :width="110 + (isMobileWidth ? 0 : 180)"
            fixed="right"
          >
            <template #default="scope">
              <div class="operation-image">
                <el-button
                  link
                  type="success"
                  @click="copyImageUrl(scope.row)"
                  v-if="!isMobileWidth"
                  >复制url</el-button
                >
                <el-button
                  link
                  type="success"
                  @click="copyImageUrlForMarkdown(scope.row)"
                  v-if="!isMobileWidth"
                  >复制为markdown</el-button
                >
                <el-button link type="primary" @click="changeImage(scope.row)"
                  >修改</el-button
                >
                <el-button
                  link
                  type="danger"
                  @click="deleteImages([scope.row.id])"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination">
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
      <ImagePreview
        v-model:show="currentPreviewImage.show"
        v-model:src="currentPreviewImage.src"
        v-model:alt="currentPreviewImage.alt"
      />
    </div>
  </ClientOnly>
</template>

<style scoped lang="less">
.container {
  height: calc(100% - 300px);
  width: 100%;
  position: relative;

  .operation {
    display: flex;

    .el-button {
      margin-left: 10px;
    }
  }

  .image-list {
    .el-table {
      .image-alias {
        transition: 0.3s;

        &:hover {
          text-decoration: underline;
          opacity: 0.5;
        }
      }

      .operation-image {
        display: flex;
      }
    }
  }

  .pagination {
    margin-top: 10px;
  }
}
</style>
