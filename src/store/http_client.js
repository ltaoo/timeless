/**
 * @file HTTP 客户端
 */
export const client = new Timeless.HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});

Timeless.Web.provide_http_client(client);
