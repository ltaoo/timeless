export const request = Timeless.kit.request_factory({
  headers: { "Content-Type": "application/json" },
});

const API_BASE = "http://127.0.0.1:3001";
const apiRequest = Timeless.kit.request_factory({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetch all tables from the database.
 * @returns {Promise<{ code: number, error: string, data: Array<{ name: string, columns: Array<{ cid: number, name: string, type: string, notnull: boolean, dflt_value: string|null, pk: boolean }>, raw: Array }> }>}
 */
export function fetchTables() {
  return apiRequest.post("/api/v1/database/tables", {});
}

/**
 * Execute a SELECT query against the database.
 * @param {string} query - SQL SELECT statement
 * @returns {Promise<{ code: number, msg: string, data: Array<Record<string, any>> }>}
 */
export function execQuery(query) {
  return apiRequest.post("/api/v1/database/exec", { query });
}

export function searchFruits(body) {
  return request.get("/api/fruit", body);
}

/** @param {Record<string, any>} params */
export function fetchDownloadList(params) {
  return request.get("/api/mock/downloads", params);
}
