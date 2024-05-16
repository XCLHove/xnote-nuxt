import topLevelAwait from "vite-plugin-top-level-await";
export default defineNuxtConfig({
  modules: [
    "@pinia/nuxt",
    "@element-plus/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/device",
  ],
  devtools: { enabled: true },
  devServer: {
    port: 8000,
    host: "0.0.0.0",
  },
  app: {
    head: {
      title: "XNote",
      link: [{ rel: "icon", type: "image/png", href: "/xnote.png" }],
    },
  },
  vite: {
    plugins: [
      topLevelAwait({
        promiseExportName: "__tla",
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "/assets/css/main.less";`,
        },
      },
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
});
