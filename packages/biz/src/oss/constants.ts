// import { getCookie } from '@cf2e/utils';

const uploadCookieName = "";
export const Config = {
  uploadUrl: "",
  uploadCookieName,
  CDN_URL: "",
  MEDIA_URL: "",
  token: "",
};
export let isProd = false;

export let getToken = () => {
  return Config.token;
};
/**
 * 设置当前为正式环境
 */
export function setProd() {
  isProd = true;
  Config.uploadUrl = "https://sk.weipaitang.com";
  Config.uploadCookieName = "cf-userCenter";
  Config.CDN_URL = "https://cdn.weipaitang.com";
  Config.MEDIA_URL = "https://media.weipaitang.com";
  Config.token = "";
}

/**
 * 设置 token，参数为字符串时视为 token；否则请传 { cookieName }
 * @param config
 */
export const setToken = (
  options: string | { token?: string; cookieName?: string },
) => {
  if (typeof options === "string") {
    Config.token = options;
    return;
  }
  const { token, cookieName } = options;
  if (token !== undefined) {
    Config.token = token;
  }
  if (cookieName !== undefined) {
    Config.uploadCookieName = cookieName;
    Config.token = "";
  }
};

/**
 * 查看当前上传配置
 * @param options
 */
export const config = (options = {}) => {
  if (options === undefined) {
    return Config;
  }
  Object.assign(Config, options);
  return Config;
};
