import HomeLayout from "~/pages/home/layout.vue";
import HomeIndexPage from "~/pages/home/index.vue";
import UserLoginPage from "~/pages/login/index.vue";
import NotFoundPage from "~/pages/not-found/index.vue";
import HistoryPage from "~/pages/home/history.vue";
import SearchPage from "~/pages/home/search.vue";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, any>, "root"> = {
  "root.home_layout": HomeLayout,
  "root.home_layout.home_index": HomeIndexPage,
  "root.home_layout.season_list": HomeIndexPage,
  "root.home_layout.movie_list": HomeIndexPage,
  "root.home_layout.history": HistoryPage,
  "root.season_playing": NotFoundPage,
  "root.movie_playing": NotFoundPage,
  "root.search": SearchPage,
  "root.login": UserLoginPage,
  "root.notfound": NotFoundPage,
};
