import { RequestPayload } from "@timeless/kit";

export const URL = (path: string) => path;

export function highlightFileInFolder(params?: any): RequestPayload<any> {
  return {
    url: "/api/fs/highlight",
    method: "POST",
    body: params,
  };
}
export function openLocalFile(params?: any): RequestPayload<{ files: any[] }> {
  return {
    url: "/api/fs/open",
    method: "POST",
    body: params,
  };
}
export function openFilePreview(params?: any): RequestPayload<any> {
  return {
    url: "/api/fs/preview",
    method: "POST",
    body: params,
  };
}
export function saveFileTo(params?: any): RequestPayload<any> {
  return {
    url: "/api/fs/save",
    method: "POST",
    body: params,
  };
}
