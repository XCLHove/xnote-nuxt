import type { Result } from '~/types/Result'
import type { PageRequestForm } from '~/types/form/PageRequestForm'
import type { SearchUserImageVO } from '~/types/vo/SearchUserImageVO'
import type { PageVO } from '~/types/vo/PageVO'

export const uploadImageApi = (file: File) => {
  const formData = new FormData()
  formData.append('uploadImageFile', file)
  return ajax
    .post('/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(({ data: result }: { data: Result<string> }) => result)
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
