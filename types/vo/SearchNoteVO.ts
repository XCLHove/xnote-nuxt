import type { Note } from '~/types/table/Note'

export type SearchNoteVO = Omit<Note, 'content'>
