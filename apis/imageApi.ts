import type { Result } from '~/types/Result'
import type { PageRequestForm } from '~/types/form/PageRequestForm'
import type { SearchUserImageVO } from '~/types/vo/SearchUserImageVO'
import type { PageVO } from '~/types/vo/PageVO'
import CryptoJS from 'crypto-js'
type Exclude<T, E> = T extends E ? never : T

const uploadImageResultCacheMap = new Map<
  string,
  ReturnType<typeof uploadImageApi>
>()
export const uploadImageApi = async (file: File): Promise<Result<string>> => {
  const cacheKey = await getFileHash(file)
  const cacheValue = uploadImageResultCacheMap.get(cacheKey)
  if (cacheValue) return cacheValue

  const formData = new FormData()
  formData.append('uploadImageFile', file)
  const newValue = ajax
    .post('/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(({ data: result }: { data: Result<string> }) => result)
    .catch((error) => {
      uploadImageResultCacheMap.delete(cacheKey)
      throw error
    })

  uploadImageResultCacheMap.set(cacheKey, newValue)
  return newValue
}
const getFileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!event.target) {
        return reject(new Error('FileReader failed to load file.'))
      }
      // 读取文件内容为 ArrayBuffer
      const arrayBuffer = event.target.result as ArrayBuffer
      // 将 ArrayBuffer 转换为 WordArray
      const wordArray = CryptoJS.lib.WordArray.create(
        new Uint8Array(arrayBuffer),
      )
      // 计算 SHA-256 哈希值
      const hash = CryptoJS.SHA256(wordArray)
      // 将哈希值转换为十六进制字符串
      resolve(hash.toString(CryptoJS.enc.Hex))
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsArrayBuffer(file)
  })
}

export const searchSelfImageApi = (
  params: PageRequestForm & {
    search?: string
  },
) => {
  return ajax
    .get('/image/me', { params })
    .then(
      ({ data: result }: { data: Result<PageVO<SearchUserImageVO>> }) => result,
    )
}

export const deleteImageApi = (userImageIds: number[]) => {
  return ajax
    .delete('/image', {
      params: {
        userImageIds: userImageIds.join(','),
      },
    })
    .then(({ data: result }: { data: Result<void> }) => result)
}
