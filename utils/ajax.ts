import axios, { type AxiosResponse } from 'axios'
import { getConfigApi } from '~/apis/nuxtServerApi'
import TokenUtil from '~/utils/TokenUtil'
import { type Result, ResultStatus } from '~/types/Result'
import {
  type ResultHandle,
  type ResultHandler,
} from '~/utils/defineResultHandler'

const { apiServerUrl } = await getConfigApi()

const ajax = axios.create({
  baseURL: apiServerUrl, // 这里加上后端接口前缀，后端必须进行跨域配置
  timeout: 10000, // ms
})

// request拦截器
ajax.interceptors.request.use(
  (config) => {
    //设置Content-Type
    config.headers['Content-Type'] ||= 'application/json;charset=utf-8'
    config.headers['authorization'] ||= TokenUtil.get()

    return config
  },
  (error: Error) => {
    return Promise.reject(error)
  },
)

const defaultResultHandle = <ResultHandle>(({ status, message }, response) => {
  if (status >= ResultStatus.EXCEPTION) {
    ElMessage.error(message)
    return Promise.reject(`${status}:${message}`)
  }
  return response
})
const resultHandleMap: Map<ResultStatus, ResultHandle> = new Map()
Object.entries(
  import.meta.glob('../result-handler/**/*.ts', {
    eager: true,
    import: 'default',
  }),
).forEach(([_, handler]) => {
  const resultHandler = handler as ResultHandler
  resultHandleMap.set(resultHandler.status, resultHandler.handle)
})

// response拦截器
ajax.interceptors.response.use(
  (response: AxiosResponse<Result<any>, any>) => {
    if (
      !(response.headers['content-type'] as string).includes('application/json')
    ) {
      return response
    }

    const result = response.data
    let resultHandle = defaultResultHandle
    if (resultHandleMap.has(result.status)) {
      resultHandle = <ResultHandle>resultHandleMap.get(result.status)
    }
    return resultHandle(result, response)
  },
  (error: Error) => {
    ElMessage.error('network error')
    return Promise.reject(error)
  },
)

export default ajax
