import type { Result, ResultStatus } from '~/types/Result'
import type { AxiosResponse } from 'axios'

export type ResultHandle = (
  result: Result<any>,
  response: AxiosResponse<Result<any>, any>,
) => typeof response | Promise<any>

export interface ResultHandler {
  status: ResultStatus
  handle: ResultHandle
}

const defineResultHandler = (handler: ResultHandler) => handler

export default defineResultHandler
