import { RequestPayload } from "@timeless/inner-kit";

export function openWindow(params?: any): RequestPayload<any> {
  return {
    url: "/api/window/open",
    method: "POST",
    body: params,
  };
}
