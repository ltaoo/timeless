import { RequestPayload } from "@timeless/core";

export function openWindow(params?: any): RequestPayload<any> {
  return {
    url: "/api/window/open",
    method: "POST",
    body: params,
  };
}
