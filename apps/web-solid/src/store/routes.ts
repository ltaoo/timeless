import { JSX } from "solid-js/jsx-runtime";

import {  PageKeysType, build  } from "@timeless/domains";,
      },
    },
  },
};
export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

export function mapPathnameWithPageKey(key: PageKeys) {
  return routes[key].pathname;
}

export type RouteMenu = {
  title: string;
  url?: PageKeys;
  icon?: JSX.Element;
};
