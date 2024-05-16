import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineNuxtPlugin((nuxtApp) => {
  // 获取vue实例
  const app = nuxtApp.vueApp;
  // 设置ElementPlus的国际化
  app.use(ElementPlus, {
    locale: zhCn,
  });
});
