import getConfig from '~/server/utils/getConfig'
export default defineEventHandler((event) => {
  return getConfig(event)
})
