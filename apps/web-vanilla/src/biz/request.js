export const request = Timeless.request_factory({
  headers: { "Content-Type": "application/json" },
});

export function searchFruits(body) {
  return request.get("/api/fruit", body);
}
