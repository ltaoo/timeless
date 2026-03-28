import { Brand, JSONObject } from "@timeless/types";
import { qs_stringify } from "@timeless/utils";

export function buildUrl(
  key: string,
  params?: JSONObject,
  query?: Parameters<typeof qs_stringify>[0],
) {
  const search = (() => {
    if (!query || Object.keys(query).length === 0) {
      return "";
    }
    return "?" + qs_stringify(query);
  })();
  const url = (() => {
    if (!key.match(/:[a-z]{1,}/)) {
      return key + search;
    }
    if (!params || Object.keys(params).length === 0) {
      return key + search;
    }
    return (
      key.replace(/:([a-z]{1,})/g, (...args: string[]) => {
        const [, field] = args;
        const value = String(params[field] || "");
        return value;
      }) + search
    );
  })();
  return url;
}

export type OriginalRouteConfigure = Record<
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

export type ConfigureForPageKeys<T> = {
  [K in keyof T]: T[K] extends { children: infer C }
    ? {
        title: string;
        pathname: string;
        children: ConfigureForPageKeys<C>;
      }
    : {
        title: string;
        pathname: string;
      };
};
export type PageKeysType<
  T extends OriginalRouteConfigure,
  K = keyof T,
> = K extends keyof T & (string | number)
  ?
      | `${K}`
      | (T[K] extends object
          ? T[K]["children"] extends object
            ? `${K}.${PageKeysType<T[K]["children"]>}`
            : never
          : never)
  : never;
// export type PathnameKey = Brand<string, "PathnameKey">;
export type PathnameKey = string;

export type RouteConfig<T> = {
  /** 使用该值定位唯一 route/page */
  name: T;
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

function apply<T>(
  configure: OriginalRouteConfigure,
  parent: null | {
    pathname: PathnameKey;
    name: T;
  } = null,
): RouteConfig<T>[] {
  const routes = Object.keys(configure).map((key) => {
    const config = configure[key];
    const { title, pathname, options, children } = config;
    // 一个 hack 操作，过滤掉 root
    const name = parent
      ? ([parent.name, key].filter(Boolean).join(".") as T)
      : key;
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
          parent: parent
            ? {
                name: parent.name,
              }
            : null,
        },
        ...subRoutes,
      ] as RouteConfig<T>[];
    }
    return [
      {
        title,
        name,
        pathname,
        options,
        parent: parent
          ? {
              name: parent.name,
            }
          : null,
      },
    ] as RouteConfig<T>[];
  });
  return routes.reduce((a, b) => {
    return a.concat(b);
  }, []);
}

export function build<T extends string>(configure: OriginalRouteConfigure) {
  const configs = apply<T>(configure);
  const routes: Record<T, RouteConfig<T>> = configs.reduce(
    (a, b) => {
      return {
        ...a,
        [b.name as T]: b,
      };
    },
    {} as Record<T, RouteConfig<T>>,
  );
  const routesWithPathname: Record<PathnameKey, RouteConfig<T>> = configs.reduce(
    (a, b) => {
      return {
        ...a,
        [b.pathname]: b,
      };
    },
    {} as Record<PathnameKey, RouteConfig<T>>,
  );

  return {
    routes,
    routesWithPathname,
  };
}

type RouteInner = {
  title: string;
  pathname: string;
  component: any;
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
  children?: RouteConfigure;
};
export type RouteConfigure = Record<PathnameKey, RouteInner>;

type RouteConfigurePageKeys<T, K = keyof T> = K extends keyof T & (string | number)
  ?
      | `${K}`
      | (T[K] extends object
          ? T[K] extends { children: infer C }
            ? C extends object
              ? `${K}.${RouteConfigurePageKeys<C>}`
              : never
            : never
          : never)
  : never;

export type BuildRoutesPageKeys<T extends RouteConfigure> =
  | "root"
  | `root.${RouteConfigurePageKeys<T>}`;

export function buildRoutes<T extends RouteConfigure>(routes: T) {
  type K = BuildRoutesPageKeys<T>;
  const views: Partial<Record<Exclude<K, "root">, any>> = {};
  let defaultRouteName = "root.home_layout.index" as Exclude<K, "root">;
  let notfoundRouteName = "root.notfound" as Exclude<K, "root">;

  function traverse(config: Record<string, any>, parentName: string) {
    const children = {};
    for (const key in config) {
      const item = config[key];
      const currentName = `${parentName}.${key}`;

      if (item.component) {
        (views as any)[currentName] = item.component;
      }

      if (item.default) {
        defaultRouteName = currentName as Exclude<K, "root">;
      }

      if (item.notfound) {
        notfoundRouteName = currentName as Exclude<K, "root">;
      }

      const node: RouteInner = {
        title: item.title,
        pathname: item.pathname,
        component: null,
      };

      if (item.options) {
        node.options = item.options;
      }

      if (item.children) {
        node.children = traverse(item.children, currentName);
      }

      children[key] = node;
    }
    return children;
  }

  const rootChildren = traverse(routes, "root");

  const configure = {
    root: {
      title: "ROOT",
      pathname: "/",
      children: rootChildren,
    },
  };
  const result = build<K>(configure as any);

  return {
    routes: result.routes,
    routesWithPathname: result.routesWithPathname,
    views,
    defaultRouteName,
    notfoundRouteName,
  };
}
