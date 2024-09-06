// https://nuxt.com/docs/api/configuration/nuxt-config
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineNuxtConfig({
  ssr: false,

  modules: ['@element-plus/nuxt', '@pinia/nuxt', '@vueuse/nuxt'],

  devtools: { enabled: true },

  devServer: {
    port: 8000,
    host: '0.0.0.0',
  },

  nitro: {
    compressPublicAssets: true,
  },

  css: ['~/assets/css/main.less'],

  app: {
    head: {
      title: 'XNote',
      link: [{ rel: 'icon', type: 'image/png', href: '/xnote.png' }],
    },
  },

  vite: {
    plugins: [
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
  },

  compatibilityDate: '2024-08-18',
})
