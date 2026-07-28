import { RequestPayload } from "@timeless/inner-kit";

export function fetchSystemInfo(params?: any): RequestPayload<{ fields: any[] }> {
  return {
    url: "/api/system/info",
    method: "GET",
    query: params,
  };
}
