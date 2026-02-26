import { RequestPayload } from "@timeless/domains";

export function fetchUserSettings(params?: any): RequestPayload<any> {
  return {
    url: "/api/user/settings",
    method: "GET",
    query: params,
  };
}
export function updateUserSettings(params?: any): RequestPayload<any> {
  return {
    url: "/api/user/settings",
    method: "POST",
    body: params,
  };
}
