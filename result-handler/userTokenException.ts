import defineResultHandler from '~/utils/defineResultHandler'
import { ResultStatus } from '~/types/Result'

export default defineResultHandler({
  status: ResultStatus.USER_TOKEN_EXCEPTION,
  handle: (result, response) => {
    TokenUtil.remove()
    ShowLoginUtil.show()
    ElMessage.warning(result.message)
    return Promise.reject(result.message)
  },
})
