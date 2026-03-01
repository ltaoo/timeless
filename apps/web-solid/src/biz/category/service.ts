import { RequestPayload } from "@timeless/kit";

export function fetchCategoryTree(params?: any): RequestPayload<any> {
  return {
    url: "/api/category/tree",
    method: "GET",
    query: params,
  };
}
