/**
 * @file 网络请求
 */
import { HttpClientCore } from "@/domains/http_client/index";
import { provide_http_client } from "@timeless/provider-wails3";

export const client = new HttpClientCore({});
provide_http_client(client);
