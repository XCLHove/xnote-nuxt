import type { User } from '~/types/table/User'

export type UserLoginForm = Pick<User, 'account' | 'password'>
