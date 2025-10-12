import mitt from "mitt";

import { app, history } from "~/store/index";
import { PageKeys } from "~/store/routes";
import { client } from "~/store/http_client";
import { storage } from "~/store/storage";
import { ViewComponentProps } from "~/store/types";

import { ListCore } from "@/domains/list/index";
import { TabHeaderCore } from "@/domains/ui/tab-header/index";
import { RequestCore } from "@/domains/request/index";
import { RouteViewCore } from "@/domains/route_view/index";
import {
  DialogCore,
  ImageInListCore,
  InputCore,
  ScrollViewCore,
} from "@/domains/ui/index";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { fetchMediaList, fetchMediaListProcess } from "~/biz/services/media";
import { MediaOriginCountry, MediaTypes } from "~/biz/constants/index";

function HomePageLogic(props: ViewComponentProps) {
  const { app, history, client, view } = props;

  const $scroll = new ScrollViewCore({
    os: app.env,
  });
  const $tab = new TabHeaderCore<{
    key: "id";
    options: {
      id: string;
      name: PageKeys;
      text: string;
      query: Record<string, string>;
    }[];
  }>({
    key: "id",
    options: [],
    onChange(value) {
      const { name, query } = value;
      history.push(name, query);
    },
    // onMounted() {
    //   console.log("[PAGE]home/index - tab-header onMounted", history.$router.query);
    //   const key = history.$router.query.key;
    //   if (!key) {
    //     $tab.selectById("china", { ignore: true });
    //     return;
    //   }
    //   $tab.selectById(key, { ignore: true });
    // },
  });
  const $search = new InputCore({
    defaultValue: "",
    placeholder: "请输入关键字搜索",
  });
  const $image = new ImageInListCore({});
  const $updatedMediaDialog = DialogCore({ footer: false });
  // const $updatedMediaList = new ListCore(
  //   new RequestCore(fetchUpdatedMediaHasHistory, {
  //     process: fetchUpdatedMediaHasHistoryProcess,
  //     client,
  //   }),
  //   {
  //     pageSize: 5,
  //   }
  // );

  return {
    // $updatedMediaList,
    ui: {
      $scroll,
      $search,
      $tab,
      $image,
      // $affix,
      $updatedMediaDialog,
    },
    ready() {
      view.onShow(() => {
        app.setTitle(view.title);
      });
      history.onRouteChange(({ pathname, href, query }) => {
        if (!$tab.mounted) {
          return;
        }
        console.log("[PAGE]home/index - history.onRouteChange", pathname);
        // $tab.handleChangeById(key);
      });
      $tab.onMounted(() => {
        const pathname = history.$router.pathname;
        console.log(
          "[PAGE]home/index - tab-header onMounted",
          pathname,
          $tab.keys
        );
        $tab.selectById("china");
      });
      // $updatedMediaList.onStateChange((v) => {
      //   if (v.dataSource.length === 0) {
      //     return;
      //   }
      //   if (canShowDialog("updated_history")) {
      //     $updatedMediaDialog.show();
      //     dialogHasShow("updated_history");
      //   }
      // });
      // $updatedMediaList.init();
    },
  };
}

function SeasonTabContentCom(props: ViewComponentProps) {
  const { app, client, view } = props;

  const $list = new ListCore(
    new RequestCore(fetchMediaList, {
      process: fetchMediaListProcess,
      client,
    }),
    {
      pageSize: 20,
      // search: {
      //   type: MediaTypes.Season,
      // },
    }
  );
  const $scroll = new ScrollViewCore({
    os: app.env,
    async onPullToRefresh() {
      await $list.refresh();
      $scroll.finishPullToRefresh();
    },
    async onReachBottom() {
      await $list.loadMore();
      $scroll.finishLoadingMore();
    },
  });
  const $image = new ImageInListCore();

  return {
    $list,
    ui: {
      $scroll,
      $image,
    },
    ready() {
      $list.init({
        language: MediaOriginCountry.CN,
      });
    },
    handleClickSeason(season: TheItemTypeFromListCore<typeof $list>) {
      // const { id, type } = season;
      // if (app.env.prod === "develop" || app.$user.permissions.includes("002")) {
      //   if (type === MediaTypes.Season) {
      //     history.push("root.season_playing", { id, type });
      //     return;
      //   }
      //   if (type === MediaTypes.Movie) {
      //     history.push("root.movie_playing", { id, type });
      //     return;
      //   }
      //   app.tip({
      //     text: ["未知的媒体类型"],
      //   });
      //   return;
      // }
      // history.push("root.profile", { id, type });
    },
  };
}

Page({
  data: {
    loading: true,
    // backgroundBottomColor: "#111111",
    menuClient: app.screen.menuButton,

    response: ListCore.defaultResponse(),
    tab: null as null | TabHeaderCore<{
      key: string;
      options: { id: string; text: string }[];
    }>,
    // $season,
  },
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onReady() {},
  async onLoad() {
    const $page = SeasonTabContentCom({
      app,
      client,
      history,
      storage,
      view: new RouteViewCore({
        name: "root.home",
        title: "首页",
        pathname: "/home/index",
        query: { language: MediaOriginCountry.CN },
      }),
    });
    $page.$list.onStateChange((v) => {
      this.setData({
        response: v,
      });
    });
    this.onClick("search", () => {
      // history.push("root.search");
    });
    this.onClick("pull-down-refresh", () => {
      $page.$list.refresh();
    });
    this.onClick("reach-bottom", () => {
      $page.$list.loadMore();
    });
    this.onClick("season", (payload: { id: string }) => {
      const { id } = payload;
      const season = $page.$list.response.dataSource.find(
        (item) => item.id === id
      );
      if (!season) {
        app.tip({
          text: ["没有匹配的记录"],
        });
        return;
      }
      $page.handleClickSeason(season);
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      $page.ready();
    });
    this.setData({
      $season: $page,
      response: $page.$list.response,
    });
  },
  onPullDownRefresh() {
    this.emitClick("pull-down-refresh", {});
  },
  onReachBottom() {
    this.emitClick("reach-bottom", {});
  },
  start() {},
  handleClickElm(event: {
    detail: { elm: string } & Record<string, string>;
    currentTarget: { dataset: { elm: string } & Record<string, string> };
  }) {
    const { elm, payload } = (() => {
      if (event.detail.elm) {
        const { elm, ...rest } = event.detail;
        return {
          elm,
          payload: rest,
        };
      }
      if (event.currentTarget.dataset.elm) {
        const { elm, ...rest } = event.currentTarget.dataset;
        return {
          elm,
          payload: rest,
        };
      }
      return {
        elm: null,
        payload: null,
      };
    })();
    if (elm === null) {
      console.warn("缺少 data-elm 属性");
      return;
    }
    this.emitClick(elm, payload);
  },
});
