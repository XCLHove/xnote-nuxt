import request from "~/utils/request.ts";
import { Result } from "~/interfaces/Result.ts";
import { Image } from "~/interfaces/entity/Image.ts";
import { ImagePageDTO } from "~/interfaces/entity/dto/ImagePageDTO.ts";

/**
 * 上传图片
 * @param imageFile 图片file对象
 */
export function uploadImage(imageFile: File) {
  const formData = new FormData();
  formData.append("uploadImage", imageFile);
  return new Promise<Result<Image>>((resolve, reject) => {
    request
      .put("/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 分页获取图片列表
 */
export function pageImageList(pageInfo: ImagePageDTO) {
  return new Promise<Result<ImagePageDTO>>((resolve, reject) => {
    request
      .post("/image/page", pageInfo)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 根据id批量删除图片
 * @param ids id列表
 */
export function deleteImageByIds(ids: number[]) {
  return new Promise<Result<null>>((resolve, reject) => {
    request
      .post("/image/deleteByIds", ids)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 根据id下载图片
 * @param id 图片id
 * @returns {Promise<Blob>} 返回一个包含图片Blob对象的Promise
 */
export function downloadImageById(id: number) {
  return new Promise<Blob>((resolve, reject) => {
    request.defaults.extraResponseHandler = (response) => {
      request.defaults.extraResponseHandler;
      if (response.config.responseType !== "arraybuffer") return false;

      const decoder = new TextDecoder("utf-8");
      const str = decoder.decode(response.data);
      response.data = JSON.parse(str);

      return false;
    };
    request
      .get(`/image/downloadById/${id}`, {
        responseType: "arraybuffer",
      })
      .then(({ data, headers }) => {
        const blob = new Blob([data], {
          type: headers["content-type"] || "image/jpeg",
        });
        resolve(blob);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 修改图片信息
 * @param image
 */
export function updateImage(image: Image) {
  return new Promise<Result<null>>((resolve, reject) => {
    request
      .post("/image", image)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
