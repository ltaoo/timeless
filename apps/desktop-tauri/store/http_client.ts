/**
 * @file tauri 请求
 */
import { HttpClientCore } from "@/domains/http_client/index";
import { provide_http_client } from "@timeless/provider-tauri";

export const client = new HttpClientCore({
  headers: {},
});
provide_http_client(client);
