import type { Result } from '~/types/Result'
import type { PageVO } from '~/types/vo/PageVO'
import type { SearchNoteVO } from '~/types/vo/SearchNoteVO'
import type { Note } from '~/types/table/Note'
import type { NoteAddForm } from '~/types/form/note/NoteAddForm'
import type { NoteUpdateForm } from '~/types/form/note/NoteUpdateForm'
import type { NoteBatchUpdateTypeForm } from '~/types/form/note/NoteBatchUpdateTypeForm'

/**
 * 添加笔记
 */
export const addNoteApi = (params: NoteAddForm) => {
  return ajax
    .post('/note', params)
    .then(({ data }: { data: Result<number> }) => data)
}

/**
 * 批量删除笔记
 */
export const deleteNoteByIdsApi = (noteIds: number[]) => {
  return ajax
    .delete('/note', {
      params: {
        noteIds: noteIds.join(','),
      },
    })
    .then(({ data }: { data: Result<void> }) => data)
}

/**
 * 修改笔记
 */
export const updateNoteApi = (params: NoteUpdateForm) => {
  return ajax
    .put('/note', params)
    .then(({ data }: { data: Result<void> }) => data)
}

/**
 * 查看笔记
 */
export const getNoteByIdApi = (noteId: number | string, shareCode?: string) => {
  return ajax
    .get(`/note/${noteId}`, {
      params: {
        shareCode,
      },
    })
    .then((res: { data: Result<Note> }) => res.data)
}

/**
 * 搜索笔记
 */
export const searchNoteApi = (params?: {
  current?: number
  size?: number
  search?: string
  heightLightPreTag?: string
  heightLightPostTag?: string
}) => {
  return ajax
    .get('/note/search', { params })
    .then((res: { data: Result<PageVO<Note>> }) => res.data)
}

/**
 * 搜索用户的笔记
 */
export const searchUserNoteApi = (
  userId: number | string,
  params?: {
    current?: number
    size?: number
    typeId?: number | null
    search?: string
  },
) => {
  return ajax
    .get(`/note/search/${userId}`, { params })
    .then(({ data }: { data: Result<PageVO<SearchNoteVO>> }) => data)
}

/**
 * 批量更新笔记的类型
 */
export const batchUpdateNoteOfTypeApi = (params: NoteBatchUpdateTypeForm) => {
  return ajax
    .put('/note/types', params)
    .then(({ data }: { data: Result<void> }) => data)
}
