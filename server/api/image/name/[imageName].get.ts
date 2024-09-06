export default defineEventHandler((event) => {
  const imageName = <string>getRouterParam(event, 'imageName')
  sendRedirect(event, `${process.env.API_SERVER_URL}/image/name/${imageName}`)
})
