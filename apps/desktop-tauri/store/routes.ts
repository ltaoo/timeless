import {  PageKeysType, build  } from "@timeless/inner-kit";,
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
