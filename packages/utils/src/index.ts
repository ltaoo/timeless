import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relative_time from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";
import qs from "qs";

// import { Result } from "@timeless/domains";
// import { JSONObject } from "./types/index";

import { cn as nzhcn } from "./nzh";

export * from "./types";
// export * from "./browser";
export * from "./primitive";
export * from "./download";
export * from "./lodash/debounce";
export * from "./lodash/throttle";

dayjs.extend(relative_time);
dayjs.locale("zh-cn");

export function cn(...inputs: any[]) {
  return twMerge(inputs);
}

export function toFixed(v: any, n: number = 2) {
  return Number(Number(v).toFixed(n));
}

/** 解析一段 json 字符串 */
// export function parseJSONStr<T extends any>(json: string) {
//   try {
//     if (json[0] !== "{" && json[0] !== "[") {
//       return Result.Err("不是合法的 json");
//     }
//     const d = JSON.parse(json);
//     return Result.Ok(d as T);
//   } catch (err) {
//     const e = err as Error;
//     return Result.Err(e);
//   }
// }

export function uidFactory() {
  let _uid = 0;
  return function uid() {
    _uid += 1;
    return _uid;
  };
}

const defaultRandomAlphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export function random_key(length: number) {
  return random_string_with_alphabet(length, defaultRandomAlphabet);
}
function random_string_with_alphabet(length: number, alphabet: string) {
  let b = new Array(length);
  let max = alphabet.length;
  for (let i = 0; i < b.length; i++) {
    let n = Math.floor(Math.random() * max);
    b[i] = alphabet[n];
  }
  return b.join("");
}

export function padding_zero(str: number | string) {
  if (String(str).length === 1) {
    return `0${str}`;
  }
  return String(str);
}
export function remove_str(
  filename: string,
  index: number = 0,
  length: number,
) {
  return filename.slice(0, index) + filename.slice(index + length);
}
/**
 * 阿拉伯数字转中文数字
 * @param num
 * @returns
 */
export function num_to_chinese(num: number) {
  return nzhcn.encodeS(num);
}
export function chinese_num_to_num(str: string) {
  return nzhcn.decodeS(str);
}

export function update_arr_item<T>(arr: T[], index: number, v2: T) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), v2, ...arr.slice(index + 1)];
}
export function remove_arr_item<T>(arr: T[], index: number) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function query_stringify(obj: Record<string, any>) {
  return qs.stringify(obj);
}
