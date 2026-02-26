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
type PageKeysType<T extends OriginalRouteConfigure, K = keyof T> = K extends keyof T & (string | number) ? `${K}` | (T[K] extends object ? T[K]["children"] extends object ? `${K}.${PageKeysType<T[K]["children"]>}` : never : never) : never;
export type PathnameKey = string;
export type PageKeys = PageKeysType<typeof configure>;
export type RouteConfig = {
    /** 使用该值定位唯一 route/page */
    name: PageKeys;
    title: string;
    pathname: PathnameKey;
    /** 是否为布局 */
    layout?: boolean;
    parent: {
        name: string;
    };
    options?: Partial<{
        require?: string[];
        keep_alive?: boolean;
        animation?: {
            in: string;
            out: string;
            show: string;
            hide: string;
        };
    }>;
};
type OriginalRouteConfigure = Record<PathnameKey, {
    title: string;
    pathname: string;
    options?: Partial<{
        keep_alive?: boolean;
        animation?: Partial<{
            in: string;
            out: string;
            show: string;
            hide: string;
        }>;
        require?: string[];
    }>;
    children?: OriginalRouteConfigure;
}>;
export declare const routes: Record<PathnameKey, RouteConfig>;
export declare const routesWithPathname: Record<PathnameKey, RouteConfig>;
export {};
