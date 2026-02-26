/**
 * @file 网络请求
 */
import {  HttpClientCore  } from "@timeless/domains";

export const client = new HttpClientCore({});
provide_http_client(client);
