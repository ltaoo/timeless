export const request = Timeless.kit.request_factory({
  headers: { "Content-Type": "application/json" },
});

export function searchFruits(body) {
  return request.get("/api/fruit", body);
}
