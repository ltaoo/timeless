import { ApplicationModel as Application } from "@/domains/app/index";
import { HistoryCore } from "@/domains/history/index";
import { client } from "./http_client";
import { storage } from "./storage";
import { RouteConfig } from "./routes";
export { client, storage };
export declare const history: HistoryCore<"root" | "root.home_layout" | "root.notfound" | "root.login" | "root.register" | "root.home_layout.home_index", RouteConfig>;
export declare const app: Application<{
    storage: import("@/domains").StorageCore<any>;
}>;
