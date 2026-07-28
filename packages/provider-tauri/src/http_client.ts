// @ts-ignore
import { invoke } from "@tauri-apps/api/tauri";

import { HttpClientCore } from "@timeless/inner-kit";

export function connect(store: HttpClientCore) {
  store.fetch = async (options) => {
    const { url, method, id, data, headers } = options;
    try {
      const r: any = await invoke(url as string, data as any);
      return Promise.resolve({ data: r });
    } catch (err) {
      throw err;
    }
  };
}
