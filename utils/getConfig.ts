import axios from "axios";

const serverUrl = (() => {
  if (process.server) {
    const defaultServerUrl = "http://localhost:8080";
    return {
      development: process.env.API_SERVER_URL_FOR_SERVER || defaultServerUrl,
      production: process.env.API_SERVER_URL_FOR_SERVER || defaultServerUrl,
    };
  }

  // client
  return {
    development: window.location.origin.replace(window.location.port, "8080"),
    production: `${window.location.origin}/api`,
  };
})();
type ServerUrl = typeof serverUrl;
const getServerUrl = (key: keyof ServerUrl) => {
  return serverUrl[key];
};

const getConfig = (() => {
  if (process.server) {
    return () => {
      return new Promise<Config>((resolve) => {
        resolve({
          serverUrl: getServerUrl(import.meta.env.MODE),
          icp: process.env.ICP || "",
        });
      });
    };
  }

  // client
  return () => {
    return new Promise<Config>((resolve, reject) => {
      axios
        .get("/fapi/config")
        .then((res) => {
          const config = (res.data || {}) as Config;
          config.serverUrl ||= getServerUrl(import.meta.env.MODE);
          resolve(config);
        })
        .catch(reject);
    });
  };
})();

export interface Config {
  //后端服务器地址
  serverUrl: string;
  //备案号
  icp: string;
}

export default getConfig;
