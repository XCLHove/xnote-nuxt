import type { Result } from '~/types/Result'

export const sendVerificationCodeToEmailApi = (
  email: string,
  imageCode: string,
) => {
  return ajax
    .get('/verification-code/send/to-email', {
      params: {
        email,
        imageCode,
      },
    })
    .then(({ data }: { data: Result<number> }) => data)
}

export const getVerificationCodeImageBase64Api = () => {
  return ajax
    .get('/verification-code/image/base64')
    .then(({ data }: { data: Result<string> }) => data)
}

export const getVerificationCodeImageUrlApi = () => {
  return `/api/verification-code/image`
}
