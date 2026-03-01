/**
 * @file HTTP 客户端
 */
export const client = new Timeless.HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});

Timeless.web.provide_http_client(client);
