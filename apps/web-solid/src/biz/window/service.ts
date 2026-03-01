import { RequestPayload } from "@timeless/kit";

export function openWindow(params?: any): RequestPayload<any> {
  return {
    url: "/api/window/open",
    method: "POST",
    body: params,
  };
}
