import { Config } from '~/types/Config'

const apiServerUrl = process.env.API_SERVER_URL

export default defineEventHandler((event) => {
  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const config: Config = {
    apiServerUrl: apiServerUrl || `${protocol}://${host.replace(/:[0-9]+/, ':8080')}`,
    ipc: process.env.IPC,
    disablePowerBy: process.env.DISABLE_POWER_BY === 'true',
  }
  return config
})
