/**
 * @file 首页
 */
import React, { useState } from "react";
import { ArrowRightCircle, ArrowUp, Bell, Search, User } from "lucide-react";

import { ViewComponentProps, ViewComponentWithMenu } from "~/store/types";
import { canShowDialog, dialogHasShow } from "~/store/dialog";
import { PageKeys } from "~/store/routes";
import { useInitialize, useInstance } from "~/hooks/index";
import { Show } from "~/packages/ui/show";
import { Input, LazyImage, Sheet } from "~/components/ui";
import { StackRouteView } from "~/components/ui/stack-route-view";
import { TabHeader } from "~/components/ui/tab-header";

import { TabHeaderCore } from "@/domains/ui/tab-header";
import {
  ScrollViewCore,
  InputCore,
  DialogCore,
  ImageInListCore,
} from "@/domains/ui";
import { AffixCore } from "@/domains/ui/affix";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import {
  fetchUpdatedMediaHasHistory,
  fetchUpdatedMediaHasHistoryProcess,
} from "~/biz/services";
import { MediaOriginCountry } from "@/constants/index";
import { sleep } from "@/utils/index";

function Page(props: ViewComponentProps) {
  const { app, history, client, storage, pages, view } = props;

  const $scroll = new ScrollViewCore({
    os: app.env,
    onScroll(pos) {
      $affix.handleScroll(pos);
    },
  });
  const $affix = new AffixCore({
    top: 0,
    defaultHeight: 96,
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
    options: [
      {
        id: "recommended",
        name: "root.home_layout.home_index.home_index_recommended",
        text: "推荐",
        query: {},
      },
      {
        id: "history",
        name: "root.home_layout.home_index.home_index_history",
        text: "观看记录",
        query: {},
      },
      {
        id: "china",
        name: "root.home_layout.home_index.home_index_season",
        text: "电视剧",
        query: {
          language: MediaOriginCountry.CN,
        },
      },
      {
        id: "movie",
        name: "root.home_layout.home_index.home_index_movie",
        text: "电影",
        query: {},
      },
      // {
      //   id: "animate",
      //   text: "动漫",
      // },
      // {
      //   id: "zongyi",
      //   text: "综艺",
      // },
      {
        id: "korean",
        name: "root.home_layout.home_index.home_index_season",
        text: "韩剧",
        query: {
          language: MediaOriginCountry.KR,
        },
      },
      {
        id: "jp",
        name: "root.home_layout.home_index.home_index_season",
        text: "日剧",
        query: {
          language: MediaOriginCountry.JP,
        },
      },
      {
        id: "us",
        name: "root.home_layout.home_index.home_index_season",
        text: "美剧",
        query: {
          language: MediaOriginCountry.US,
        },
      },
    ],
    onChange(value) {
      const { id, name, query = {} } = value;
      history.push(name, { id, ...query });
    },
  });
  const $search = new InputCore({
    defaultValue: "",
    placeholder: "请输入关键字搜索",
  });
  const $image = new ImageInListCore({});
  const $updatedMediaDialog = new DialogCore({ footer: false });
  const $updatedMediaList = new ListCore(
    new RequestCore(fetchUpdatedMediaHasHistory, {
      process: fetchUpdatedMediaHasHistoryProcess,
      client,
    }),
    {
      pageSize: 5,
    }
  );

  return {
    $updatedMediaList,
    ui: {
      $scroll,
      $search,
      $tab,
      $image,
      $affix,
      $updatedMediaDialog,
    },
    ready() {
      view.onShow(() => {
        app.setTitle(view.title);
      });
      history.onRouteChange(async ({ pathname, href, query }) => {
        if (!$tab.mounted) {
          return;
        }
        console.log(
          "[PAGE]home/index - history.onRouteChange",
          pathname,
          query
        );
        if (!query.id) {
          return;
        }
        await sleep(200);
        $tab.selectById(query.id);
      });
      $tab.onMounted(() => {
        const pathname = history.$router.pathname;
        console.log(
          "[PAGE]home/index - tab-header onMounted",
          pathname,
          $tab.key
        );
        $tab.selectById("china");
      });
      $updatedMediaList.onStateChange((v) => {
        if (v.dataSource.length === 0) {
          return;
        }
        if (canShowDialog("updated_history")) {
          $updatedMediaDialog.show();
          dialogHasShow("updated_history");
        }
      });
      $updatedMediaList.init();
    },
  };
}

export const HomeIndexPage: ViewComponentWithMenu = React.memo((props) => {
  const { app, history, client, storage, pages, view, menu } = props;

  const $page = useInstance(() => Page(props));

  const [subViews, setSubViews] = useState(view.subViews);
  const [updatedMediaResponse, setUpdatedMediaResponse] = useState(
    $page.$updatedMediaList.response
  );
  const [height, setHeight] = useState($page.ui.$affix.height);

  useInitialize(() => {
    view.onSubViewsChange((nextSubViews) => {
      setSubViews(nextSubViews);
    });
    // $page.ui.$affix.onMounted(({ height }) => {
    //   setHeight(height);
    // });
    $page.$updatedMediaList.onStateChange((v) => {
      setUpdatedMediaResponse(v);
    });
    $page.ui.$scroll.onScroll((pos) => {
      if (!menu) {
        return;
      }
      if (pos.scrollTop > app.screen.height) {
        menu.setCanTop({
          icon: <ArrowUp className="w-6 h-6" />,
          text: "回到顶部",
        });
        return;
      }
      if (pos.scrollTop === 0) {
        menu.setCanRefresh();
        return;
      }
      menu.disable();
    });
    if (menu) {
      menu.onScrollToTop(() => {
        $page.ui.$scroll.scrollTo({ top: 0 });
      });
      menu.onRefresh(async () => {
        $page.ui.$scroll.startPullToRefresh();
      });
    }
    $page.ready();
  });

  return <div className="z-10"></div>;
});
