/**
 * @file 网络请求
 */
import { HttpClientCore } from "@/domains/http_client/index";
import { provide_http_client } from "@timeless/provider-weapp";
import { __VERSION__ } from "@/constants/index";

export const client = new HttpClientCore({
  hostname: "https://media.funzm.com",
  headers: {
    "client-version": __VERSION__,
  },
});
provide_http_client(client);
