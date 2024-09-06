import type { Result } from '~/types/Result'
import type { NoteType } from '~/types/table/NoteType'
import type { NoteTypeAddForm } from '~/types/form/noteType/NoteTypeAddForm'
import type { NoteTypeUpdateForm } from '~/types/form/noteType/NoteTypeUpdateForm'

export const getUserNoteTypesApi = (userId: number | string) => {
  return ajax
    .get(`/note-type/user/${userId}`)
    .then(({ data }: { data: Result<NoteType[]> }) => data)
}

export const deleteNoteTypeByIdsApi = (ids: number[]) => {
  return ajax
    .delete('/note-type', {
      params: {
        ids: ids.join(','),
      },
    })
    .then(({ data }: { data: Result<void> }) => data)
}

export const addNoteTypeApi = (form: NoteTypeAddForm) => {
  return ajax
    .post('/note-type', form)
    .then(({ data }: { data: Result<void> }) => data)
}

export const updateNoteTypeApi = (form: NoteTypeUpdateForm) => {
  return ajax
    .put('/note-type', form)
    .then(({ data }: { data: Result<void> }) => data)
}
