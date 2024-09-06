import defineResultHandler from '~/utils/defineResultHandler'
import { ResultStatus } from '~/types/Result'

export default defineResultHandler({
  status: ResultStatus.SUCCESS,
  handle: (result, response) => {
    return response
  },
})
