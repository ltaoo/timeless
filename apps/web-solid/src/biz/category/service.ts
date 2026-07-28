import { RequestPayload } from "@timeless/inner-kit";

export function fetchCategoryTree(params?: any): RequestPayload<any> {
  return {
    url: "/api/category/tree",
    method: "GET",
    query: params,
  };
}
