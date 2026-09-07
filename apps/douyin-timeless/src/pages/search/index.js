import {
  AvatarView,
  BackButtonView,
  EmptyStateView,
} from "@/components/common.js";
import { SearchPageModel } from "./index.model.js";

/** @param {ViewComponentProps} props */
export default function SearchPageView(props) {
  const vm$ = SearchPageModel(props);
  return View(
    {
      class: "page page-light search-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "search-topbar" }, [
        BackButtonView({ class: "search-back", onClick: vm$.methods.back }),
        View({ class: "search-input-wrap" }, [
          Icon({ name: "search", size: 19 }),
          Input({
            class: "search-main-input",
            value: vm$.state.query,
            placeholder: "搜索你感兴趣的内容",
            onInput(event) {
              vm$.methods.set_query(event.target.value);
            },
            onMounted(event) {
              event.target?.focus?.();
            },
          }),
          Show({
            when: computed(vm$.state.query, Boolean),
            ok() {
              return View(
                { class: "search-clear", onClick: vm$.methods.clear },
                ["×"],
              );
            },
          }),
        ]),
        View({ class: "search-submit", onClick: () => vm$.methods.search() }, [
          "搜索",
        ]),
      ]),
      View({ class: "search-body" }, [
        Show({
          when: computed(vm$.state.query, (query) => !query.trim()),
          ok() {
            return View({}, [
              View({ class: "search-section" }, [
                View({ class: "search-section-title" }, [
                  "搜索历史",
                  View({ as: "span" }, ["⌫"]),
                ]),
                View({ class: "search-tags" }, [
                  ...["国风穿搭", "李子柒", "健身教程", "夏日壁纸"].map((tag) =>
                    View(
                      {
                        class: "search-tag",
                        onClick: () => vm$.methods.search(tag),
                      },
                      [tag],
                    ),
                  ),
                ]),
              ]),
              View({ class: "search-section" }, [
                View({ class: "search-section-title" }, ["猜你想搜"]),
                ...[
                  "夏日氛围感大片",
                  "最近很火的背景音乐",
                  "轻松学会马面裙穿搭",
                  "周末去哪儿玩",
                ].map((item, index) =>
                  View(
                    {
                      class: "search-suggestion",
                      onClick: () => vm$.methods.search(item),
                    },
                    [
                      View({ class: "search-rank" }, [String(index + 1)]),
                      View({ class: "search-suggestion-text" }, [item]),
                      index < 2 ? View({ class: "search-hot" }, ["热"]) : null,
                    ],
                  ),
                ),
              ]),
            ]);
          },
          else() {
            return Show({
              when: computed(vm$.state.results, (items) => items.length > 0),
              ok() {
                return View({}, [
                  View({ class: "search-result-title" }, [
                    "综合搜索结果",
                    View({ as: "span" }, [vm$.state.query]),
                  ]),
                  View({ class: "search-result-grid" }, [
                    For({
                      each: vm$.state.results,
                      render(post, index) {
                        return View(
                          {
                            class: "search-result-card",
                            onClick() {
                              vm$.methods.open_post(index.value);
                            },
                          },
                          [
                            Img({
                              class: "search-result-image",
                              src: post.image,
                              alt: post.title,
                              loading: "lazy",
                            }),
                            View({ class: "search-result-card-title" }, [
                              post.title,
                            ]),
                            View({ class: "search-result-meta" }, [
                              AvatarView({
                                class: "tiny-avatar",
                                src: post.avatar,
                              }),
                              post.author,
                              View({ class: "search-result-likes" }, [
                                `♡ ${post.likes}`,
                              ]),
                            ]),
                          ],
                        );
                      },
                    }),
                  ]),
                ]);
              },
              else() {
                return EmptyStateView({
                  icon: "⌕",
                  title: "没有找到相关内容",
                  text: "换个关键词再试试",
                });
              },
            });
          },
        }),
      ]),
    ],
  );
}
