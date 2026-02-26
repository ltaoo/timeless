import { RequestPayload } from "@timeless/core";

export function downloadDouyinVideo(params?: any): RequestPayload<any> {
  return {
    url: "/api/douyin/download",
    method: "POST",
    body: params,
  };
}
