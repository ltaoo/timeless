import { RequestPayload } from "@timeless/kit";

export function syncToRemote(params?: any): RequestPayload<any> {
  return {
    url: "/api/sync/to_remote",
    method: "POST",
    body: params,
  };
}
export function syncFromRemote(params?: any): RequestPayload<any> {
  return {
    url: "/api/sync/from_remote",
    method: "POST",
    body: params,
  };
}
export function pingWebDav(params?: any): RequestPayload<any> {
  return {
    url: "/api/sync/ping",
    method: "GET",
    query: params,
  };
}
export function fetchDatabaseDirs(params?: any): RequestPayload<any> {
  return {
    url: "/api/sync/db_dirs",
    method: "GET",
    query: params,
  };
}
