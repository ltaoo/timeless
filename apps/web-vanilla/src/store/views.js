/**
 * @file 页面组件映射
 */
// import { UIExampleWeUIPageView } from "../pages/home/example-weui.js";
import { HomePageView } from "@/pages/home/index.js";
import { HomeLayoutView } from "@/pages/home/layout.js";
import { LoginPage } from "@/pages/login/index.js";
import { NotFoundPageView } from "@/pages/notfound/index.js";
import { GeneralView } from "@/pages/home/index.general.js";
import { FormView } from "@/pages/home/index.form.js";
import { DataDisplayView } from "@/pages/home/index.data.js";
import { FeedbackView } from "@/pages/home/index.feedback.js";
import { NavigationView } from "@/pages/home/index.nav.js";
import { OverlayView } from "@/pages/home/index.overlay.js";

export const views = {
  "root.home_layout": HomeLayoutView,
  "root.home_layout.index": HomePageView,
  "root.home_layout.index.general": GeneralView,
  "root.home_layout.index.form": FormView,
  "root.home_layout.index.data": DataDisplayView,
  "root.home_layout.index.feedback": FeedbackView,
  "root.home_layout.index.nav": NavigationView,
  "root.home_layout.index.overlay": OverlayView,
  // "root.home_layout.weui": UIExampleWeUIPageView,
  "root.login": LoginPage,
  "root.notfound": NotFoundPageView,
};
