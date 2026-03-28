import { PageContent, SplitLayout, StackLayout } from "@/components/layout.js";

import { mockUsers, findMockUserById } from "./data.js";

function stableStringifyQuery(query) {
  if (!query) {
    return "";
  }
  const keys = Object.keys(query).sort();
  const normalized = {};
  for (const k of keys) {
    const v = query[k];
    if (v === undefined) {
      continue;
    }
    normalized[k] = v;
  }
  return JSON.stringify(normalized);
}

function buildTabKey(view) {
  return `${view.name}::${stableStringifyQuery(view.query)}`;
}

function AdminTabBar({ tabs, activeKey, navigateToTab, getTabTitle }) {
  return View(
    {
      class:
        "shrink-0 flex items-center gap-1 px-3 py-2 border-b border-zinc-200 overflow-x-auto dark:border-zinc-800",
    },
    [
      For({
        each: tabs,
        render(tab) {
          return View(
            {
              class: cn([
                "shrink-0 max-w-[220px] px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2",
                computed(activeKey, (k) =>
                  k === tab.key
                    ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-100 dark:hover:bg-zinc-900",
                ),
              ]),
              onClick() {
                navigateToTab(tab);
              },
            },
            [View({ class: "truncate" }, [getTabTitle(tab)])],
          );
        },
      }),
    ],
  );
}

/**
 *
 * @param {{ history: HistoryCore; view: RouteViewCore }} props
 * @returns
 */
export default function AdminLayoutView(props) {
  const sidemenu$ = Timeless.kit.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "仪表盘", url: "root.admin_layout.dashboard" },
      {
        title: "用户管理",
        url: "root.admin_layout.users",
        children: ["root.admin_layout.user_detail"],
      },
      {
        title: "用户1",
        url: "root.admin_layout.user_detail",
        query: { id: "3" },
      },
      { title: "角色权限", url: "root.admin_layout.roles" },
      { title: "操作日志", url: "root.admin_layout.logs" },
      { title: "系统设置", url: "root.admin_layout.system" },
    ],
  });

  const tabs = refarr([]);
  const activeKey = ref("");

  const getTitleForView = (view) => {
    const lastKey = String(view.name || "")
      .split(".")
      .pop();
    if (lastKey === "users") {
      return "用户管理";
    }
    if (lastKey === "user_detail") {
      const user = findMockUserById(view.query?.id);
      return user ? `用户：${user.name}` : "用户详情";
    }
    return view.title || view.name;
  };

  const ensureTab = (view) => {
    if (!view) {
      return;
    }
    const key = buildTabKey(view);
    const existed = tabs.find((t) => t.key === key);
    if (!existed) {
      tabs.push({
        key,
        name: view.name,
        query: view.query,
        title: getTitleForView(view),
      });
    } else {
      existed.query = view.query;
      existed.title = getTitleForView(view);
    }
    activeKey.as(key);
  };

  if (props.view?.curView) {
    ensureTab(props.view.curView);
  }
  props.view.onCurViewChange((view) => {
    ensureTab(view);
  });

  props.history.onRouteChange(({ view }) => {
    if (!view) {
      return;
    }
    const name = String(view.name || "");
    if (!name.startsWith("root.admin_layout.")) {
      return;
    }
    ensureTab(view);
  });

  const navigateToTab = (tab) => {
    props.history.push(tab.name, tab.query);
  };

  return View({ class: "h-full" }, [
    SplitLayout({
      direction: "horizontal",
      items: [
        {
          defaultSize: 22,
          minSize: 18,
          maxSize: 40,
          scroll: false,
          children: [
            Flex({ direction: "col", class: "py-4 h-full" }, [
              Flex(
                { items: "center", justify: "between", class: "px-3 mb-3" },
                [
                  View(
                    {
                      class:
                        "text-xs font-bold text-zinc-400 uppercase tracking-widest",
                    },
                    ["Admin"],
                  ),
                ],
              ),
              View({ class: "flex-1 overflow-y-auto" }, [
                For({
                  each: sidemenu$.menus,
                  render(menu) {
                    return View(
                      {
                        class: cn([
                          "px-3 py-2 text-sm cursor-pointer transition-colors",
                          computed(sidemenu$.cur, (t) => {
                            return sidemenu$.isSelected(t, menu)
                              ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
                          }),
                        ]),
                        onClick() {
                          sidemenu$.handleClick(menu);
                        },
                      },
                      [menu.title],
                    );
                  },
                }),
              ]),
            ]),
          ],
        },
        {
          defaultSize: 78,
          minSize: 60,
          scroll: false,
          children: [
            StackLayout(
              {
                header: [
                  AdminTabBar({
                    tabs,
                    activeKey,
                    navigateToTab,
                    getTabTitle(tab) {
                      return tab.title;
                    },
                  }),
                ],
                headerClass: "bg-white dark:bg-zinc-950",
              },
              [KeepAliveSubViews(props)],
            ),
          ],
        },
      ],
    }),
  ]);
}
