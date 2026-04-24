export const request = Timeless.request_factory({
  headers: { "Content-Type": "application/json" },
});

export function searchFruits(body) {
  return request.get("/api/fruit", body);
}

/** @param {Record<string, any>} params */
export function fetchDownloadList(params) {
  return request.get("/api/mock/downloads", params);
}
