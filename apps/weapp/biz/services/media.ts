
import { Result } from "@timeless/core";
import { request } from "@/domains/request/utils";

export function fetchMediaList(body: any) {
  return request.post("/api/media/list", body);
}
export function fetchMediaListProcess(res: any) {
  return Result.Ok([]);
}
