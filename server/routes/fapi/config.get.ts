import { Config } from "~/utils/getConfig";

export default defineEventHandler(() => {
  const config = {
    serverUrl: process.env.API_SERVER_URL_FOR_CLIENT || "",
    icp: process.env.ICP || "",
  } as Config;
  return config;
});
