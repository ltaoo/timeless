import { PageKeys } from "./routes";
import { ViewComponent, ViewComponentWithMenu } from "./types";
export declare const pages: Omit<Record<PageKeys, ViewComponent | ViewComponentWithMenu>, "root">;
