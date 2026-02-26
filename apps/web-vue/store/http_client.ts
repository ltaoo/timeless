/**
 * @file 网络请求
 */
import { HttpClientCore } from "@/domains/http_client/index";
import { provide_http_client } from "@timeless/provider-web";

import { __VERSION__ } from "@/constants/index";

export const client = new HttpClientCore({
  headers: {
    "client-version": __VERSION__,
  },
});
provide_http_client(client);
