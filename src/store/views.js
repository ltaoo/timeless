/**
 * @file 页面组件映射
 */
import HomePageView from "@/pages/home/index.js";
import HomeLayoutView from "@/pages/home/layout.js";
import LoginPage from "@/pages/login/index.js";
import NotFoundPageView from "@/pages/notfound/index.js";
import GeneralView from "@/pages/home/index.general.js";
// import FormView from "@/pages/home/index.form.js";
// import DataDisplayView from "@/pages/home/index.data.js";
// import FeedbackView from "@/pages/home/index.feedback.js";
// import NavigationView from "@/pages/home/index.nav.js";
// import OverlayView from "@/pages/home/index.overlay.js";
// import SettingsPageView from "@/pages/settings/index.js";

function lazy(path) {
  return () => import(path).then((m) => m.default);
}

// export const views = {
//   "root.home_layout": lazy("@/pages/home/layout.js"),
//   "root.home_layout.index": lazy("@/pages/home/index.js"),
//   "root.home_layout.index.general": lazy("@/pages/home/index.general.js"),
//   "root.home_layout.index.form": lazy("@/pages/home/index.form.js"),
//   "root.home_layout.index.data": lazy("@/pages/home/index.data.js"),
//   "root.home_layout.index.feedback": lazy("@/pages/home/index.feedback.js"),
//   "root.home_layout.index.nav": lazy("@/pages/home/index.nav.js"),
//   "root.home_layout.index.overlay": lazy("@/pages/home/index.overlay.js"),
//   "root.home_layout.settings": lazy("@/pages/settings/index.js"),
//   "root.login": lazy("@/pages/login/index.js"),
//   "root.notfound": lazy("@/pages/notfound/index.js"),
// };
export const views = {
  "root.home_layout": HomeLayoutView,
  "root.home_layout.index": HomePageView,
  "root.home_layout.index.general": GeneralView,
  // "root.home_layout.index.form": FormView,
  "root.home_layout.index.form": lazy("@/pages/home/index.form.js"),
  // "root.home_layout.index.data": DataDisplayView,
  "root.home_layout.index.data": lazy("@/pages/home/index.data.js"),
  // "root.home_layout.index.feedback": FeedbackView,
  "root.home_layout.index.feedback": lazy("@/pages/home/index.feedback.js"),
  // "root.home_layout.index.nav": NavigationView,
  "root.home_layout.index.nav": lazy("@/pages/home/index.nav.js"),
  // "root.home_layout.index.overlay": OverlayView,
  "root.home_layout.index.overlay": lazy("@/pages/home/index.overlay.js"),
  // "root.home_layout.settings": SettingsPageView,
  "root.home_layout.settings": lazy("@/pages/settings/index.js"),
  "root.login": LoginPage,
  "root.notfound": NotFoundPageView,
};
