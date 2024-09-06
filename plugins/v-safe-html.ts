import DOMPurify from 'dompurify'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('safe-html', {
    mounted(el, binding) {
      el.innerHTML = DOMPurify.sanitize(binding.value)
    },
    updated(el, binding) {
      el.innerHTML = DOMPurify.sanitize(binding.value)
    },
  })
})
