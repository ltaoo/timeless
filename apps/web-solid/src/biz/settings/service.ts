import { RequestPayload } from "@timeless/kit";

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
