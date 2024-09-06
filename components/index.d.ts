import type { SearchNoteVO } from '~/types/vo/SearchNoteVO'
import type { ShareNoteRecordVO } from '~/types/vo/ShareNoteRecordVO'

export interface ShareNoteComponent {
  share: (noteInfo: SearchNoteVO) => void
}

export interface ShareNoteRecordUpdateComponent {
  show: (record: ShareNoteRecordVO) => void
}
