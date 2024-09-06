import type { ShareNoteRecord } from '~/types/table/ShareNoteRecord'
import type { Note } from '~/types/table/Note'

export type ShareNoteRecordVO = ShareNoteRecord & Pick<Note, 'title'>
