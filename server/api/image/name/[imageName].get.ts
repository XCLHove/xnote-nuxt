import getConfig from '~/server/utils/getConfig'

export default defineEventHandler((event) => {
  const imageName = <string>getRouterParam(event, 'imageName')
  sendRedirect(
    event,
    `${getConfig(event).apiServerUrl}/image/name/${imageName}`,
  )
})
