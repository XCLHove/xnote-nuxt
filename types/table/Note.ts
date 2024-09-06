export interface Note {
  content: string
  id: number
  isPublic: NoteIsPublic
  releaseTime: string
  title: string
  typeId: number
  updateTime: string
  userId: number
}

export type NoteIsPublic = '非公开' | '公开'
