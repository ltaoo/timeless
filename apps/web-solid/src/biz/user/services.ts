import { RequestPayload, Result } from "@timeless/core";

export function createAccount(params?: any): RequestPayload<any> {
  return {
    url: "/api/user/create_account",
    method: "POST",
    body: params,
  };
}
export function fetch_user_profile(params?: any): RequestPayload<any> {
  return {
    url: "/api/user/profile",
    method: "GET",
    query: params,
  };
}
export function fetch_user_profile_process(res: any) {
  return Result.Ok(res);
}
export function update_user_profile(params?: any): RequestPayload<any> {
  return {
    url: "/api/user/profile",
    method: "POST",
    body: params,
  };
}
