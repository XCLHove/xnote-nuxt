export interface User {
  id: number
  name: string
  account: string
  password: string
  email: string
  homePageNoteId?: number
  imageStorageSize: number
  status: UserStatus
}

export type UserStatus = '禁用' | '启用'
