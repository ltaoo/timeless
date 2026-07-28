/**
 * @file tauri 请求
 */
import {  HttpClientCore  } from "@timeless/inner-kit";

export const client = new HttpClientCore({
  headers: {},
});
provide_http_client(client);
