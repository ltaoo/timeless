import { JSX } from "solid-js/jsx-runtime";
import { PageKeysType } from "@/domains/route_view/utils";
/**
 * @file 路由配置
 */
declare const configure: {
    root: {
        title: string;
        pathname: string;
        options: {
            require: any[];
        };
        children: {
            home_layout: {
                title: string;
                pathname: string;
                children: {
                    index: {
                        title: string;
                        pathname: string;
                        options: {
                            require: any[];
                        };
                    };
                };
            };
            video_preview: {
                title: string;
                pathname: string;
            };
            image_preview: {
                title: string;
                pathname: string;
            };
            pdf_preview: {
                title: string;
                pathname: string;
            };
            paste_event_preview: {
                title: string;
                pathname: string;
            };
            settings_layout: {
                title: string;
                pathname: string;
                options: {
                    animation: {
                        in: string;
                        out: string;
                    };
                };
                children: {
                    user_settings: {
                        title: string;
                        pathname: string;
                    };
                    category: {
                        title: string;
                        pathname: string;
                    };
                    system: {
                        title: string;
                        pathname: string;
                    };
                    synchronization: {
                        title: string;
                        pathname: string;
                    };
                };
            };
            login: {
                title: string;
                pathname: string;
            };
            register: {
                title: string;
                pathname: string;
            };
            error: {
                title: string;
                pathname: string;
            };
            notfound: {
                title: string;
                pathname: string;
            };
        };
    };
};
export type PageKeys = PageKeysType<typeof configure>;
export declare const routes: Record<string, import("@/domains/route_view/utils").RouteConfig<"root" | "root.home_layout" | "root.notfound" | "root.error" | "root.video_preview" | "root.image_preview" | "root.pdf_preview" | "root.paste_event_preview" | "root.settings_layout" | "root.login" | "root.register" | "root.home_layout.index" | "root.settings_layout.system" | "root.settings_layout.user_settings" | "root.settings_layout.category" | "root.settings_layout.synchronization">>;
export declare const routesWithPathname: Record<string, import("@/domains/route_view/utils").RouteConfig<"root" | "root.home_layout" | "root.notfound" | "root.error" | "root.video_preview" | "root.image_preview" | "root.pdf_preview" | "root.paste_event_preview" | "root.settings_layout" | "root.login" | "root.register" | "root.home_layout.index" | "root.settings_layout.system" | "root.settings_layout.user_settings" | "root.settings_layout.category" | "root.settings_layout.synchronization">>;
export declare function mapPathnameWithPageKey(key: PageKeys): string;
export type RouteMenu = {
    title: string;
    url?: PageKeys;
    icon?: JSX.Element;
};
export {};
