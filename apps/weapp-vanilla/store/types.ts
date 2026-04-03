import {  ApplicationModel as Application  } from "@timeless/kit";];
export type ViewComponentProps = {
  app: Application<{ storage: typeof storage }>;
  history: HistoryCore<PageKeys, RouteConfig>;
  client: HttpClientCore;
  view: RouteViewCore;
  storage: StorageCore<GlobalStorageValues>;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};

export type BaseApiResp<T> = {
  code: number;
  msg: string;
  data: T;
};

export type ListResponse<T> = {
  total: number;
  page: number;
  page_size: number;
  no_more: boolean;
  list: T[];
};
export type ListResponseWithCursor<T> = {
  page_size: number;
  total: number;
  next_marker?: string;
  list: T[];
};
