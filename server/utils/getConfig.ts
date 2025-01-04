import { Config } from '~/types/Config'
import { EventHandlerRequest, H3Event } from 'h3'

const getConfig = (event: H3Event<EventHandlerRequest>) => {
  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)

  return {
    apiServerUrl:
      process.env.API_SERVER_URL ||
      `${protocol}://${host.replace(/:[0-9]+/, ':8080')}`,
    ipc: process.env.IPC,
    disablePowerBy: process.env.DISABLE_POWER_BY === 'true',
  } as Config
}

export default getConfig
