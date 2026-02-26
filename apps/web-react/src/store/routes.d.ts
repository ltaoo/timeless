import { PageKeysType } from "@/domains/route_view/utils";
/**
 * @file 路由配置
 */
declare const configure: {
    root: {
        title: string;
        pathname: string;
        children: {
            home_layout: {
                title: string;
                pathname: string;
                options: {
                    keep_alive: boolean;
                    require: string[];
                };
                children: {
                    home_index: {
                        title: string;
                        pathname: string;
                        options: {
                            keep_alive: boolean;
                            require: string[];
                        };
                    };
                };
            };
            login: {
                title: string;
                pathname: string;
                options: {
                    keep_alive: boolean;
                };
            };
            register: {
                title: string;
                pathname: string;
                options: {
                    keep_alive: boolean;
                };
            };
            notfound: {
                title: string;
                pathname: string;
            };
        };
    };
};
export type PageKeys = PageKeysType<typeof configure>;
export declare const routes: Record<string, import("@/domains/route_view/utils").RouteConfig<"root" | "root.home_layout" | "root.notfound" | "root.login" | "root.register" | "root.home_layout.home_index">>;
export declare const routesWithPathname: Record<string, import("@/domains/route_view/utils").RouteConfig<"root" | "root.home_layout" | "root.notfound" | "root.login" | "root.register" | "root.home_layout.home_index">>;
export {};
