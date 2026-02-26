/**
 * @file 所有的页面
 */
/** 首页 */
import { HomeLayout } from "~/pages/home/layout";
import { HomeIndexPage } from "~/pages/home";
import { NotFoundPage } from "~/pages/not-found";
import { LoginPage } from "~/pages/login";
import { RegisterPage } from "~/pages/register";

import { PageKeys } from "./routes";
import { ViewComponent, ViewComponentWithMenu } from "./types";

export const pages: Omit<
  Record<PageKeys, ViewComponent | ViewComponentWithMenu>,
  "root"
> = {
  "root.home_layout": HomeLayout,
  "root.home_layout.home_index": HomeIndexPage,
  "root.home_layout.home_index.home_index_recommended": HomeIndexPage,
  "root.home_layout.home_index.home_index_history": HomeIndexPage,
  "root.home_layout.home_index.home_index_season": HomeIndexPage,
  "root.home_layout.home_index.home_index_movie": HomeIndexPage,
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
};
