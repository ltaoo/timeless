import { ViewComponent } from "~/store/types";
import { HomeLayout } from "~/pages/home/layout";
import { HomeIndexView } from "~/pages/home";
import { LoginPage } from "~/pages/login";
import { RegisterPage } from "~/pages/register";
import { NotFoundPage } from "~/pages/notfound";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
  "root.home_layout": HomeLayout,
  "root.home_layout.index": HomeIndexView,
};
