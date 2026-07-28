import { RequestPayload } from "@timeless/inner-kit";

export function downloadDouyinVideo(params?: any): RequestPayload<any> {
  return {
    url: "/api/douyin/download",
    method: "POST",
    body: params,
  };
}
