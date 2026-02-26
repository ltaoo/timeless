import { RequestPayload, Result } from "@timeless/domains";

export function fetchPasteEventList(params?: any): RequestPayload<any> {
  return {
    url: "/api/paste/list",
    method: "GET",
    query: params,
  };
}
export function fetchPasteEventListProcess(res: any) {
  return Result.Ok(res);
}
export function deletePasteEvent(params?: any): RequestPayload<any> {
  return {
    url: "/api/paste/delete",
    method: "POST",
    body: params,
  };
}
export function openPasteEventPreviewWindow(params?: any): RequestPayload<any> {
  return {
    url: "/api/paste/preview",
    method: "POST",
    body: params,
  };
}
export function writePasteEvent(params?: any): RequestPayload<any> {
  return {
    url: "/api/paste/write",
    method: "POST",
    body: params,
  };
}
export function processPartialPasteEvent(d: any) {
  return d;
}
