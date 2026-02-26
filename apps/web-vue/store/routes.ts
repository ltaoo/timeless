import { PageKeysType, build } from "@/domains/route_view/utils";

/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    options: {
      require: [],
    },
    children: {
      home_layout: {
        title: "首页",
        pathname: "/home",
        options: {
          keep_alive: true,
          animation: {
            in: "slide-in-from-right",
            out: "slide-out-to-right",
          },
          require: ["login"],
        },
        children: {
          home_index: {
            title: "电视剧",
            pathname: "/home/index",
            options: {
              require: ["login"],
            },
          },
        },
      },
      login: {
        title: "登录",
        pathname: "/login",
        options: {
          require: [],
        },
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
        options: {
          require: [],
        },
      },
    },
  },
};

export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

// @ts-ignore
globalThis.__routes_with_pathname__ = routesWithPathname;
// @ts-ignore
globalThis.__routes__ = routes;
