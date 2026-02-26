/**
 * @file HTTP 客户端
 */
export const client = new Timeless.HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});

TimelessWeb.provide_http_client(client);
