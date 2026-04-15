import { request_factory } from "@timeless/kit";

export const request = request_factory({
  headers: { "Content-Type": "application/json" },
});

/**
 * 模拟搜索水果接口
 */
export function searchFruits(body) {
  return request.get("/api/fruit", body);
}
