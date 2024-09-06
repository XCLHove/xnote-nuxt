import type { Note } from '~/types/table/Note'

export type NoteAddForm = Omit<
  Note,
  'id' | 'releaseTime' | 'updateTime' | 'userId'
>
