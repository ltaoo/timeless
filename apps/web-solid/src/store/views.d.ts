import { ViewComponent } from "~/store/types";
import { PageKeys } from "./routes";
export declare const pages: Omit<Record<PageKeys, ViewComponent>, "root">;
