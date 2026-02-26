/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    children: {
      home_layout: {
        title: "首页布局",
        pathname: "/home",
        options: {
          keep_alive: true,
          require: ["login"],
        },
        children: {
          home_index: {
            title: "首页",
            pathname: "/home/index",
            options: {
              keep_alive: true,
              require: ["login"],
            },
          },
        },
      },
      login: {
        title: "登录",
        pathname: "/login",
        options: {
          keep_alive: true,
        },
      },
      register: {
        title: "注册",
        pathname: "/register",
        options: {
          keep_alive: true,
        },
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
    },
  },
};
type PageKeysType<
  T extends OriginalRouteConfigure,
  K = keyof T
> = K extends keyof T & (string | number)
  ?
      | `${K}`
      | (T[K] extends object
          ? T[K]["children"] extends object
            ? `${K}.${PageKeysType<T[K]["children"]>}`
            : never
          : never)
  : never;
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
  // component: unknown;
};
type OriginalRouteConfigure = Record<
  PathnameKey,
  {
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
  }
>;
function apply(
  configure: OriginalRouteConfigure,
  parent: {
    pathname: PathnameKey;
    name: string;
  }
): RouteConfig[] {
  const routes = Object.keys(configure).map((key) => {
    const config = configure[key];
    const { title, pathname, options, children } = config;
    // 一个 hack 操作，过滤掉 root
    const name = [parent.name, key].filter(Boolean).join(".") as PageKeys;
    if (children) {
      const subRoutes = apply(children, {
        name,
        pathname,
      });
      return [
        {
          title,
          name,
          pathname,
          options,
          layout: true,
          parent: {
            name: parent.name,
          },
        },
        ...subRoutes,
      ] as RouteConfig[];
    }
    return [
      {
        title,
        name,
        pathname,
        options,
        parent: {
          name: parent.name,
        },
      },
    ] as RouteConfig[];
  });
  return routes.reduce((a, b) => {
    return a.concat(b);
  }, []);
}
const configs = apply(configure, {
  name: "",
  pathname: "/",
});
export const routes: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.name]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
export const routesWithPathname: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.pathname]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
