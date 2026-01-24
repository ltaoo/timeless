/**
 * @file 页面组件映射
 */
import { HomePageView } from "../pages/home/index.js";
import { HomeLayoutView } from "../pages/home/layout.js";
import { TaskPageView } from "../pages/home/task.js";
import { LoginPage } from "../pages/login/index.js";
import { NotFoundPageView } from "../pages/notfound/index.js";

export const views = {
  "root.home_layout": HomeLayoutView,
  "root.home_layout.index": HomePageView,
  "root.home_layout.task": TaskPageView,
  "root.login": LoginPage,
  "root.notfound": NotFoundPageView,
};
