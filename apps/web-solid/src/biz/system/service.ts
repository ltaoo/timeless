import { RequestPayload } from "@timeless/core";

export function fetchSystemInfo(params?: any): RequestPayload<{ fields: any[] }> {
  return {
    url: "/api/system/info",
    method: "GET",
    query: params,
  };
}
