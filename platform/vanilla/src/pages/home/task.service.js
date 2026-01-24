import { request } from "../../biz/request.js";

export function fetchIssueList(body) {
  return request.post("/api/issue/list", {
    ...body,
    page_size: body.pageSize,
  });
}
