import type { ShareNoteRecordCreateForm } from "~/types/form/shareNoteRecord/ShareNoteRecordCreateForm";
import type { PageRequestForm } from "~/types/form/PageRequestForm";
import type { ShareNoteRecordUpdateForm } from "~/types/form/shareNoteRecord/ShareNoteRecordUpdateForm";
import type { Result } from "~/types/Result";
import type { PageVO } from "~/types/vo/PageVO";
import type { ShareNoteRecordVO } from "~/types/vo/ShareNoteRecordVO";

/**
 * 分享笔记
 */
export const shareNoteApi = (params: ShareNoteRecordCreateForm) => {
  return ajax
    .post('/share-note-record', params)
    .then(({ data }: { data: Result<string> }) => data)
}

/**
 * 分页获取分享记录
 */
export const getSelfShareRecordsApi = (params: PageRequestForm) => {
  return ajax
    .get('/share-note-record/me', { params })
    .then(({ data }: { data: Result<PageVO<ShareNoteRecordVO>> }) => data)
}

/**
 * 批量删除分享记录
 */
export const deleteShareNoteRecordByIdsApi = (recordIds: number[]) => {
  return ajax
    .delete('/share-note-record', {
      params: {
        shareNoteRecordIds: recordIds.join(','),
      },
    })
    .then(({ data }: { data: Result<void> }) => data)
}

/**
 * 更新分享记录
 */
export const updateShareNoteRecordApi = (params: ShareNoteRecordUpdateForm) => {
  return ajax
    .put('/share-note-record', params)
    .then(({ data }: { data: Result<void> }) => data)
}