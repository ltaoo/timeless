import type { PageKey, RouteConfig, RouteViewCore, HistoryCore, ApplicationModel, HttpClient, StorageCore } from "@timeless/inner-kit";

declare global {
  const __Version: string;
}

declare module "dayjs" {
  export type Dayjs = any;
  export function dayjs(date?: string | number | Date | Dayjs): Dayjs;
  export function extend(plugin: any, option?: any): any;
  export function invoke(): any;
  export default dayjs;
}

declare module "dayjs/locale/zh-cn" {
  const zhCn: any;
  export default zhCn;
}

export {};
