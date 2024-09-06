export default defineEventHandler((event) => {
  sendRedirect(event, `${process.env.API_SERVER_URL}/verification-code/image`)
})
