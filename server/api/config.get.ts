import { Config } from '~/types/Config'

const apiServerUrl = process.env.API_SERVER_URL
if (!apiServerUrl) {
  console.warn('未找到 API_SERVER_URL 环境变量')
}

export default defineEventHandler((event) => {
  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const config: Config = {
    // @ts-ignore
    apiServerUrl: import.meta.dev
      ? `${protocol}://${host.replace(/:[0-9]+/, ':8080')}`
      : apiServerUrl,
    ipc: process.env.IPC,
  }
  return config
})
