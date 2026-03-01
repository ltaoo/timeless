import { build, PathnameKey, RouteViewCore } from "./route_view";

// console.log("domain.version 1.1.0");
export { Result, BizError, base, BaseDomain } from "@timeless/base";

export * from "./app";
export * from "./history";
export * from "./http_client";
export * from "./route_view";
export * from "./navigator";
export * from "./list";
export * from "./multiple";
export * from "./request";
export * from "./request/utils";
export * from "./storage";
export * from "./system";
// export * as ui from "@timeless/ui";
// export * from "@timeless/ui";

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

export function buildRoutes(routes: RouteConfigure) {
  const views = {};
  let defaultRouteName = "";
  let notfoundRouteName = "";

  function traverse(config: Record<string, any>, parentName: string) {
    const children = {};
    for (const key in config) {
      const item = config[key];
      const currentName = `${parentName}.${key}`;

      if (item.component) {
        views[currentName] = item.component;
      }

      if (item.default) {
        defaultRouteName = currentName;
      }

      if (item.notfound) {
        notfoundRouteName = currentName;
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
  const result = build(configure);

  return {
    routes: result.routes,
    routesWithPathname: result.routesWithPathname,
    views,
    defaultRouteName,
    notfoundRouteName,
  };
}
