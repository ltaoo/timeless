/**
 * 组件库首页布局：左侧两级菜单（antd 分类 → 组件）+ 右侧分类页。
 *
 * 分类页由 keep-alive 保活（KeepAliveSubViews），所以每个分类各自保留滚动位置；
 * 点某个组件条目若不在当前分类，会先 push 该分类的路由，再由 anchor.js 滚动到区块并高亮。
 *
 * 两级菜单的数据在 pages/home/categories.js（与各分类页共用同一份）。
 */
import { CATEGORIES, homeRoute } from "./categories.js";
import { request } from "./anchor.js";

/**
 * @param {ViewComponentProps} props
 */
export default function HomePageView(props) {
  const collapsed_ = ref(false);
  const hideText_ = ref(false);
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
      class: "h-full",
    },
    [
      SplitView({
        panels: [
          {
            size: 220,
            minSize: 40,
            collapsed: collapsed_,
            onCollapse(event) {
              if (!event.data.collapsed) {
                hideText_.set(false);
              }
            },
            onCollapsed(event) {
              if (event.data.collapsed) {
                hideText_.set(true);
              }
            },
            content() {
              return Flex({ direction: "col", class: "overflow-hidden py-4" }, [
                Flex(
                  { items: "center", justify: "between", class: "px-3 mb-3" },
                  [
                    View(
                      {
                        class:
                          "text-xs font-bold text-zinc-400 uppercase tracking-widest",
                        style: {
                          "white-space": "nowrap",
                          overflow: "hidden",
                        },
                      },
                      ["Components"],
                    ),
                  ],
                ),
                View({ class: "flex-1 overflow-y-auto" }, [
                  For({
                    each: CATEGORIES,
                    render(group) {
                      const menu = {
                        title: group.title,
                        name: homeRoute(group.key),
                      };
                      return View({}, [
                        View(
                          {
                            class: classNames([
                              "px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors",
                              // 颜色只由 computed 给：同元素的 text-zinc-400 / text-zinc-900 同权重，
                              // 谁在后面谁赢（Tailwind 按调色板顺序排，400 排在 900 之后），
                              // 两处都写会导致选中态被基础色吃掉。
                              computed(sidemenu$.cur, (t) =>
                                sidemenu$.isSelected(t, menu)
                                  ? "text-zinc-900 dark:text-zinc-50"
                                  : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50",
                              ),
                            ]),
                            style: {
                              "white-space": "nowrap",
                              overflow: "hidden",
                            },
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
                                class: classNames([
                                  "px-3 py-1.5 text-sm cursor-pointer transition-colors",
                                  itemClass(item),
                                ]),
                                style: {
                                  "white-space": "nowrap",
                                  overflow: "hidden",
                                },
                                onClick() {
                                  selectItem(group, item);
                                },
                              },
                              [
                                View(
                                  {
                                    class: computed(hideText_, (c) =>
                                      c ? "hidden" : "flex-1",
                                    ),
                                  },
                                  [item.label],
                                ),
                              ],
                            );
                          },
                        }),
                      ]);
                    },
                  }),
                ]),
              ]);
            },
          },
          {
            size: "auto",
            content() {
              return View({ class: "flex flex-col h-full" }, [
                View(
                  {
                    onClick() {
                      collapsed_.toggle();
                    },
                  },
                  [View({}, [Icon({ name: "panel-left" })])],
                ),
                View(
                  {
                    class: "flex-1 min-h-0",
                  },
                  [Timeless.ui.KeepAliveSubViews(props)],
                ),
              ]);
            },
          },
        ],
      }),
    ],
  );
}

/** 分类分组标题。 */
function groupStyle(active) {
  return active
    ? "text-zinc-900 dark:text-zinc-50"
    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50";
}

/** 组内组件条目。 */
function itemStyle(active) {
  return active
    ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-zinc-50"
    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
}
