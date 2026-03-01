import { RequestPayload } from "@timeless/kit";

export function downloadDouyinVideo(params?: any): RequestPayload<any> {
  return {
    url: "/api/douyin/download",
    method: "POST",
    body: params,
  };
}
