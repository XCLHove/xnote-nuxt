import defineResultHandler from '~/utils/defineResultHandler'
import { type Result, ResultStatus } from '~/types/Result'
import {
  getVerificationCodeImageBase64Api,
  sendVerificationCodeToEmailApi,
} from '~/apis/verificationCodeApi'
import { ElTooltip } from '#components'

export default defineResultHandler({
  status: ResultStatus.NEED_IMAGE_VERIFICATION_CODE_EXCEPTION,
  handle: (result, response) => {
    if (response.config.params[result.data]) {
      ElMessage.error(result.message)
    }

    return getVerificationCodeImageBase64Api().then(({ data: imageBase64 }) => {
      return ElMessageBox.prompt('验证', {
        title: '验证',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '输入图片中的验证码',
        inputPattern: /^\S+$/,
        inputErrorMessage: '请输入正确的图片验证码',
        message: () =>
          h(
            ElTooltip,
            {
              content: '点击刷新验证码',
              placement: 'right',
            },
            () =>
              h('img', {
                src: imageBase64,
                alt: '验证码',
                onClick: (e) => {
                  e.preventDefault()
                  getVerificationCodeImageBase64Api().then(
                    ({ data: newImageBase64 }) => {
                      ;(e.target as HTMLImageElement).src = newImageBase64
                    },
                  )
                },
              }),
          ),
      })
        .then(({ value: imageVerificationCode }) => {
          const requestConfig = response.config
          // 将图片验证码添加到请求参数中
          requestConfig.params[result.data as string] = imageVerificationCode
          return ajax(requestConfig)
        })
        .catch(() => {
          return Promise.reject('取消操作')
        })
    })
  },
})
