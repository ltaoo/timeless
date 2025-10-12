import HomeLayout from "~/pages/home/layout.vue";
import HomeIndexPage from "~/pages/home/index.vue";
import UserLoginPage from "~/pages/login/index.vue";
import NotFoundPage from "~/pages/not-found/index.vue";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, any>, "root"> = {
  "root.home_layout": HomeLayout,
  "root.home_layout.home_index": HomeIndexPage,
  "root.login": UserLoginPage,
  "root.notfound": NotFoundPage,
};
