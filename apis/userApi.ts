import type { Result } from '~/types/Result'
import type { UserRegisterForm } from '~/types/form/user/UserRegisterForm'
import type { UserLoginForm } from '~/types/form/user/UserLoginForm'
import type { UserVO } from '~/types/vo/UserVO'

export const userRegisterApi = (params: UserRegisterForm) => {
  return ajax
    .post('/user/register', params)
    .then(({ data }: { data: Result<null> }) => data)
}

export const userLoginApi = (params: UserLoginForm) => {
  return ajax
    .post('/user/login', params)
    .then(({ data }: { data: Result<string> }) => data)
}

export const getUserSelfInfoApi = () => {
  return ajax.get('/user/me').then(({ data }: { data: Result<UserVO> }) => data)
}
