/**
 * 首页布局：左侧两级菜单（antd 分类 → 组件）+ 右侧分类页。
 *
 * 分类页由 keep-alive 保活（KeepAliveSubViews），所以每个分类各自保留滚动位置；
 * 点某个组件条目若不在当前分类，会先 push 该分类的路由，再由 anchor.js 滚动到区块并高亮。
 *
 * ⚠️ SplitView 的根节点是 height:100%、SplitPane 是 overflow:clip，所以外层必须有
 * 确定高度（.weui-shell），否则整个布局塌成 0。
 *
 * 本 app 无 Tailwind / gallery-*，菜单样式全部内联，只用已声明的 --weui-* token，
 * 因此随 `body[data-weui-theme]` 自动换肤（见 packages/weui/THEME_DESIGN.md §3.4）。
 */
import { CATEGORIES, homeRoute } from "./categories.js";
import { request } from "./anchor.js";
import { app } from "@/store/index.js";

/**
 * 暗色开关同时驱动两套挂载点：provider-web 的 `app.setTheme` 只写 `<html>`，
 * 而 weui 的调色板挂在 `<body data-weui-theme>`。
 */
function toggleDark() {
  const cur = app.getTheme ? app.getTheme() : "light";
  const next = cur === "dark" ? "light" : "dark";
  app.setTheme(next);
  document.body.setAttribute("data-weui-theme", next);
}

/**
 * @param {ViewComponentProps} props
 */
export default function HomePageView(props) {
  /** 当前高亮的组件条目（anchor id 或 route name）；isSelected 只认路由名，条目要自己管。 */
  const activeKey_ = ref(null);

  const sidemenu$ = Timeless.kit.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: CATEGORIES.map((group) => ({
      title: group.title,
      name: homeRoute(group.key),
    })),
  });

  const groupClass = (menu) =>
    computed(sidemenu$.cur, () =>
      sidemenu$.isSelected(sidemenu$.cur.value, menu)
        ? groupStyle(true)
        : groupStyle(false),
    );

  const itemClass = (item) =>
    computed(
      item.route ? sidemenu$.cur : activeKey_,
      () =>
        (item.route
          ? sidemenu$.isActive(item.route)
          : activeKey_.value === item.anchor)
          ? itemStyle(true)
          : itemStyle(false),
    );

  function selectItem(group, item) {
    if (item.route) {
      activeKey_.as(item.route);
      props.history.push(item.route);
      return;
    }
    activeKey_.as(item.anchor);
    const menu = { title: group.title, name: homeRoute(group.key) };
    if (!sidemenu$.isSelected(sidemenu$.cur.value, menu)) {
      props.history.push(menu.name);
    }
    request(item.anchor);
  }

  return View(
    {
      style: {
        height: "100vh",
        overflow: "hidden",
        background: "var(--weui-BG-1)",
        color: "var(--weui-FG-0)",
      },
    },
    [
      SplitView({
        panels: [
          {
            size: 220,
            minSize: 180,
            content() {
              return View(
                {
                  style: {
                    display: "flex",
                    "flex-direction": "column",
                    height: "100%",
                    background: "var(--weui-BG-2)",
                    "border-right": "1px solid var(--weui-SEPARATOR-1)",
                  },
                },
                [
                  View(
                    {
                      style: {
                        padding: "16px 16px 8px",
                        "font-size": "15px",
                        "font-weight": "700",
                        color: "var(--weui-FG-0)",
                      },
                    },
                    ["组件"],
                  ),
                  View(
                    {
                      style: {
                        flex: "1",
                        "overflow-y": "auto",
                        padding: "0 8px 8px",
                      },
                    },
                    [
                      For({
                        each: CATEGORIES,
                        render(group) {
                          const menu = {
                            title: group.title,
                            name: homeRoute(group.key),
                          };
                          // 没有 items 的是独立路由页，与各分类同级（只有标题行可点）。
                          if (!group.items) {
                            return View(
                              {
                                style: groupClass(menu),
                                onClick() {
                                  props.history.push(menu.name);
                                },
                              },
                              [group.title],
                            );
                          }
                          return View({}, [
                            View(
                              {
                                style: groupClass(menu),
                                onClick() {
                                  props.history.push(menu.name);
                                },
                              },
                              [group.title],
                            ),
                            For({
                              each: group.items,
                              render(item) {
                                return View(
                                  {
                                    style: itemClass(item),
                                    onClick() {
                                      selectItem(group, item);
                                    },
                                  },
                                  [item.label],
                                );
                              },
                            }),
                          ]);
                        },
                      }),
                    ],
                  ),
                  View(
                    {
                      style: {
                        padding: "8px 12px 12px",
                        "border-top": "1px solid var(--weui-SEPARATOR-1)",
                      },
                    },
                    [
                      Button(
                        {
                          store: new Timeless.vm.ButtonCore({
                            variant: "default",
                            size: "sm",
                            onClick: toggleDark,
                          }),
                        },
                        ["切换暗色"],
                      ),
                    ],
                  ),
                ],
              );
            },
          },
          {
            size: "auto",
            content() {
              return Timeless.ui.KeepAliveSubViews(props);
            },
          },
        ],
      }),
    ],
  );
}

/** 分类分组标题（「设计规范」这种无子项的独立路由页也用同一套样式）。 */
function groupStyle(active) {
  return {
    padding: "10px 8px 4px",
    "font-size": "12px",
    "font-weight": "600",
    "letter-spacing": "0.04em",
    color: active ? "var(--weui-BRAND)" : "var(--weui-FG-2)",
    cursor: "pointer",
  };
}

/** 组内组件条目。 */
function itemStyle(active) {
  return {
    padding: "6px 8px",
    "font-size": "13px",
    "line-height": "1.5",
    "border-radius": "6px",
    cursor: "pointer",
    color: active ? "#fff" : "var(--weui-FG-1)",
    background: active ? "var(--weui-BRAND)" : "transparent",
  };
}
