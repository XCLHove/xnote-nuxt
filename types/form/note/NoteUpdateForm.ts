import type { Note } from '~/types/table/Note'

export type NoteUpdateForm = Pick<Note, 'id'> &
  Partial<Omit<Note, 'id' | 'userId' | 'releaseTime' | 'updateTime'>>
