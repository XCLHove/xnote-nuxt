import type { User } from '~/types/table/User'

export type UserRegisterForm = Omit<
  User,
  'id' | 'homePageNoteId' | 'imageStorageSize' | 'status'
> & {
  verificationCode: string
}
