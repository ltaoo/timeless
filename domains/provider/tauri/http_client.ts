// @ts-ignore
import { invoke } from "@tauri-apps/api/core";

import { HttpClientCore } from "@/domains/http_client";

export function connect(store: HttpClientCore) {
  store.fetch = async (options) => {
    const { url, method, id, data, headers } = options;
    try {
      const r: any = await invoke(url, data as any);
      return Promise.resolve({ data: r });
    } catch (err) {
      throw err;
    }
  };
}
