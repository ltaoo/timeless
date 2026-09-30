/**
 * 首页布局：左侧两级菜单（antd 分类 → 组件）+ 右侧分类页。
 *
 * 分类页由 `keep-alive` 保活（KeepAliveSubViews），所以每个分类各自保留滚动位置；
 * 点某个组件条目若不在当前分类，会先 push 该分类的路由，再由 anchor.js 滚动到区块并高亮。
 *
 * ⚠️ SplitView 的根节点是 height:100%、SplitPane 是 overflow:clip，所以外层必须有
 * 确定高度（.gallery-shell），否则整个布局塌成 0。
 */
import { app } from "@/store/index.js";
import { CATEGORIES, homeRoute } from "./categories.js";
import { request } from "./anchor.js";

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

  const selectedClass = (menu) =>
    computed(sidemenu$.cur, () =>
      sidemenu$.isSelected(sidemenu$.cur.value, menu)
        ? "gallery-menu-group-title is-active"
        : "gallery-menu-group-title",
    );

  const itemClass = (item) =>
    computed(
      item.route ? sidemenu$.cur : activeKey_,
      () =>
        (item.route
          ? sidemenu$.isActive(item.route)
          : activeKey_.value === item.anchor)
          ? "gallery-menu-item is-active"
          : "gallery-menu-item",
    );

  function selectItem(group, item) {
    const menu = { title: group.title, name: homeRoute(group.key) };
    if (item.route) {
      activeKey_.as(item.route);
      props.history.push(item.route);
      return;
    }
    activeKey_.as(item.anchor);
    if (!sidemenu$.isSelected(sidemenu$.cur.value, menu)) {
      props.history.push(menu.name);
    }
    request(item.anchor);
  }

  function toggleTheme() {
    const next = app.toggleTheme ? app.toggleTheme() : "light";
    app.setTheme(next);
  }

  return View({ class: "gallery-shell" }, [
    SplitView({
      panels: [
        {
          size: 220,
          minSize: 180,
          content() {
            return View({ class: "gallery-menu" }, [
              View({ class: "gallery-menu-title" }, ["组件"]),
              View({ class: "gallery-menu-scroll" }, [
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
                          class: selectedClass(menu),
                          onClick() {
                            props.history.push(menu.name);
                          },
                        },
                        [group.title],
                      );
                    }
                    return View({ class: "gallery-menu-group" }, [
                      View(
                        {
                          class: selectedClass(menu),
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
                              class: itemClass(item),
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
              ]),
              View({ class: "gallery-menu-footer" }, [
                Button(
                  {
                    store: new Timeless.vm.ButtonCore({
                      variant: "outline",
                      size: "sm",
                      onClick: toggleTheme,
                    }),
                  },
                  ["切换暗色"],
                ),
              ]),
            ]);
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
  ]);
}
