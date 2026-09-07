import { AvatarView, BackButtonView } from "@/components/common.js";
import { format_count } from "@/data/content.js";
import { ProfilePageModel } from "./index.model.js";

/** @param {ViewComponentProps} props */
export default function ProfilePageView(props) {
  const vm$ = ProfilePageModel(props);
  return View(
    {
      class: "page page-dark profile-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "profile-cover" }, [
        Img({
          class: "profile-cover-image",
          src: computed(vm$.state.item, (item) => item.cover),
          alt: "作者主页背景",
        }),
        View({ class: "profile-cover-shade" }),
        View({ class: "profile-topbar" }, [
          BackButtonView({ class: "profile-back", onClick: vm$.methods.back }),
          View({ class: "profile-topbar-actions" }, [
            View({ class: "round-icon-button" }, [
              Icon({ name: "search", size: 22 }),
            ]),
            View({ class: "round-icon-button", onClick: vm$.methods.more }, [
              "•••",
            ]),
          ]),
        ]),
        AvatarView({
          class: "profile-avatar",
          src: computed(vm$.state.item, (item) => item.avatar),
          alt: "作者头像",
        }),
        View({ class: "profile-cover-name" }, [
          computed(vm$.state.item, (item) => item.author),
        ]),
        View({ class: "profile-cover-handle" }, [
          computed(vm$.state.item, (item) => `抖音号：${item.handle}`),
        ]),
      ]),
      View({ class: "profile-content" }, [
        View({ class: "profile-stats" }, [
          View({ class: "profile-stat" }, [
            View({ class: "profile-stat-value" }, ["2.0亿"]),
            View({ class: "profile-stat-label" }, ["获赞"]),
          ]),
          View({ class: "profile-stat" }, [
            View({ class: "profile-stat-value" }, ["88"]),
            View({ class: "profile-stat-label" }, ["关注"]),
          ]),
          View({ class: "profile-stat" }, [
            View({ class: "profile-stat-value" }, ["707.8万"]),
            View({ class: "profile-stat-label" }, ["粉丝"]),
          ]),
        ]),
        View({ class: "profile-bio" }, ["合作：X229896（备注品牌）"]),
        View({ class: "profile-ip" }, ["IP属地：天津"]),
        View({ class: "profile-shop" }, [
          View({ class: "profile-shop-icon" }, ["▢"]),
          View({ class: "profile-shop-copy" }, [
            View({ class: "profile-shop-title" }, ["进入橱窗"]),
            View({ class: "profile-shop-subtitle" }, ["6件好物"]),
          ]),
          View({ class: "profile-shop-arrow" }, ["›"]),
        ]),
        View({ class: "profile-actions" }, [
          View(
            {
              class: computed(vm$.state.followed, (followed) =>
                followed
                  ? "profile-follow-button is-followed"
                  : "profile-follow-button",
              ),
              onClick: vm$.methods.toggle_follow,
            },
            [
              computed(vm$.state.followed, (followed) =>
                followed ? "已关注" : "+ 关注",
              ),
            ],
          ),
          View({ class: "profile-action-more", onClick: vm$.methods.more }, [
            "▼",
          ]),
        ]),
        View({ class: "profile-tabs" }, [
          ...["作品 296", "喜欢", "收藏"].map((tab, index) =>
            View(
              {
                class: computed(vm$.state.active_tab, (active) =>
                  active === tab || (index === 0 && active === "作品")
                    ? "profile-tab is-active"
                    : "profile-tab",
                ),
                onClick() {
                  vm$.methods.set_tab(tab);
                },
              },
              [tab],
            ),
          ),
        ]),
        View({ class: "profile-work-grid" }, [
          For({
            each: vm$.state.works,
            render(work) {
              return View(
                {
                  class: "profile-work",
                  onClick() {
                    vm$.methods.open_work(work);
                  },
                },
                [
                  Img({
                    class: "profile-work-image",
                    src: work.cover,
                    alt: work.description,
                    loading: "lazy",
                  }),
                  View({ class: "profile-work-likes" }, [
                    `♡ ${format_count(work.likes)}`,
                  ]),
                ],
              );
            },
          }),
        ]),
      ]),
    ],
  );
}
