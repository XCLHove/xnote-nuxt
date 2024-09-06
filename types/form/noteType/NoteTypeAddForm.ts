import type { NoteType } from '~/types/table/NoteType'

export type NoteTypeAddForm = Omit<NoteType, 'id' | 'userId'>
