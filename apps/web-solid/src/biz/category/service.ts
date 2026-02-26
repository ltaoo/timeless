import { RequestPayload } from "@timeless/domains";

export function fetchCategoryTree(params?: any): RequestPayload<any> {
  return {
    url: "/api/category/tree",
    method: "GET",
    query: params,
  };
}
