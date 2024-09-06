import type { NoteType } from '~/types/table/NoteType'

export type NoteTypeUpdateForm = Omit<NoteType, 'userId'>
