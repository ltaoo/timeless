import { Result } from "@/domains/result/index";

import { HttpClientCore } from "./index";

export function connect(store: HttpClientCore) {
  store.fetch = async (options) => {
    const { url, method, id, data, headers } = options;
    if (typeof url !== "function") {
      return Result.Err("fn 不是函数");
    }
    try {
      // @ts-ignore
      const r: any = await url(data as any);
      if (!r) {
        throw new Error("Missing the response");
      }
      return Promise.resolve({ data: r ?? {} });
    } catch (err) {
      throw err;
    }
  };
  store.cancel = (id: string) => {
    return Result.Ok(null);
  };
}
