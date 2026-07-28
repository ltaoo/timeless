import { Result } from "@timeless/inner-base";

/** 解析一段 json 字符串 */
export function parseJSONStr<T extends any>(json: string) {
  try {
    if (json[0] !== "{" && json[0] !== "[") {
      return Result.Err("不是合法的 json");
    }
    const d = JSON.parse(json);
    return Result.Ok(d as T);
  } catch (err) {
    const e = err as Error;
    return Result.Err(e);
  }
}
