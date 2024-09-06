import type { User } from '~/types/table/User'

export type UserVO = Omit<User, 'password'>
