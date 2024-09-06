export default defineNuxtRouteMiddleware((to, from) => {
  if (from.path === '/redirect') {
    return true
  }

  return useRouter().push({
    path: '/redirect',
    query: {
      toPath: to.path,
    },
  })
})
