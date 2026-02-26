import { RequestPayload } from "@timeless/domains";

export function downloadDouyinVideo(params?: any): RequestPayload<any> {
  return {
    url: "/api/douyin/download",
    method: "POST",
    body: params,
  };
}
