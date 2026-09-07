import { BottomNavigationView } from "@/components/bottom-navigation.js";
import { AvatarView } from "@/components/common.js";
import { format_count } from "@/data/content.js";
import { MePageModel } from "./index.model.js";

function ProfileStatView(value, label) {
  return View({ class: "me-stat" }, [
    View({ class: "me-stat-value" }, [value]),
    View({ class: "me-stat-label" }, [label]),
  ]);
}

function MeMenuView(props) {
  const { vm$ } = props;
  const items = [
    ["钱包", "¥"],
    ["观看历史", "◷"],
    ["我的二维码", "⌗"],
    ["创作者服务中心", "☆"],
    ["青少年模式", "♧"],
    ["设置", "⚙"],
  ];
  return Show({
    when: vm$.state.menu_open,
    ok() {
      return View({ class: "sheet-mask", onClick: vm$.methods.close_menu }, [
        View(
          {
            class: "bottom-sheet me-menu-sheet",
            onClick(event) {
              event.stopPropagation();
            },
          },
          [
            View({ class: "sheet-handle" }),
            View({ class: "me-menu-title" }, ["更多功能"]),
            ...items.map(([label, icon]) =>
              View(
                {
                  class: "me-menu-item",
                  onClick() {
                    vm$.methods.open_feature(label);
                  },
                },
                [
                  View({ class: "me-menu-icon" }, [icon]),
                  View({ class: "me-menu-label" }, [label]),
                  View({ class: "me-menu-arrow" }, ["›"]),
                ],
              ),
            ),
          ],
        ),
      ]);
    },
  });
}

/** @param {ViewComponentProps} props */
export default function MePageView(props) {
  const vm$ = MePageModel(props);
  return View(
    {
      class: "page page-dark me-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "me-cover" }, [
        Img({
          class: "me-cover-image",
          src: "/media/covers/out4.jpg",
          alt: "主页背景",
        }),
        View({ class: "me-cover-shade" }),
        View({ class: "me-topbar" }, [
          View({ class: "me-topbar-icon" }, [
            Icon({ name: "users", size: 24 }),
          ]),
          View({ class: "me-topbar-handle" }, [
            "我才是岚岚",
            View({ as: "span" }, ["⌄"]),
          ]),
          View({ class: "me-topbar-icon", onClick: vm$.methods.open_menu }, [
            Icon({ name: "menu", size: 26 }),
          ]),
        ]),
      ]),
      View({ class: "me-content" }, [
        View({ class: "me-identity" }, [
          AvatarView({
            class: "me-avatar",
            src: "/media/avatars/head-image.jpeg",
            alt: "我的头像",
          }),
          View({ class: "me-name-block" }, [
            View({ class: "me-name" }, ["我才是岚岚"]),
            View({ class: "me-handle" }, ["抖音号：Timeless_2026  ▣"]),
          ]),
        ]),
        View({ class: "me-bio" }, [
          "记录美好生活，也记录每一次认真做产品的日子 ✨",
        ]),
        View({ class: "me-tags" }, [
          View({ class: "me-tag" }, ["📍 上海"]),
          View({ class: "me-tag" }, ["90后"]),
          View({ class: "me-tag" }, ["♌ 狮子座"]),
        ]),
        View({ class: "me-stats" }, [
          ProfileStatView("128.6万", "获赞"),
          ProfileStatView("268", "关注"),
          ProfileStatView("18.9万", "粉丝"),
          ProfileStatView("32", "朋友"),
        ]),
        View({ class: "me-actions" }, [
          View({ class: "me-edit-button", onClick: vm$.methods.edit_profile }, [
            "编辑资料",
          ]),
          View({ class: "me-small-button" }, ["+ 朋友"]),
          View({ class: "me-small-button", onClick: vm$.methods.open_menu }, [
            "⌄",
          ]),
        ]),
        View({ class: "me-shop-entry" }, [
          View({ class: "me-shop-icon" }, ["▢"]),
          View({ class: "me-shop-copy" }, [
            View({ class: "me-shop-title" }, ["进入橱窗"]),
            View({ class: "me-shop-subtitle" }, ["6件好物"]),
          ]),
          View({ class: "me-shop-arrow" }, ["›"]),
        ]),
        View({ class: "me-tabs" }, [
          ...["作品", "私密", "喜欢", "收藏"].map((tab) =>
            View(
              {
                class: computed(vm$.state.active_tab, (active) =>
                  active === tab ? "me-tab is-active" : "me-tab",
                ),
                onClick() {
                  vm$.methods.set_tab(tab);
                },
              },
              [tab],
            ),
          ),
        ]),
        View({ class: "me-work-grid" }, [
          For({
            each: vm$.state.works,
            render(item) {
              return View(
                {
                  class: "me-work",
                  onClick() {
                    vm$.methods.open_work(item);
                  },
                },
                [
                  Img({
                    class: "me-work-image",
                    src: item.cover,
                    alt: item.description,
                    loading: "lazy",
                  }),
                  View({ class: "me-work-likes" }, [
                    `♡ ${format_count(item.likes)}`,
                  ]),
                ],
              );
            },
          }),
        ]),
      ]),
      BottomNavigationView({ app_model: props.app_model, theme: "dark" }),
      MeMenuView({ vm$ }),
    ],
  );
}
