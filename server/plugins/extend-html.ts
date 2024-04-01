import { NitroRuntimeHooks } from "nitropack";

export default defineNitroPlugin((nitroApp) => {
  // @ts-ignore
  nitroApp.hooks.hook("render:html", (html) => {
    // html.lang = 'zh-CN'
    html.head.push(`<meta name="keywords" content="xclhove" />`);
    html.head.push(`<meta name="keywords" content="xnote" />`);
    html.head.push(`<meta name="keywords" content="markdown" />`);
  });
});
