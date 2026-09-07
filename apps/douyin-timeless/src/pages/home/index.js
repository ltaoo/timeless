import { BottomNavigationView } from "@/components/bottom-navigation.js";
import { AvatarView, GlyphView } from "@/components/common.js";
import { DISCOVERY_POSTS, VIDEO_ITEMS, format_count } from "@/data/content.js";
import { HomePageModel } from "./index.model.js";

const HOME_TABS = ["热点", "长视频", "关注", "经验", "推荐"];
const REFRESH_THRESHOLD = 128;
const REFRESH_HOLD_DISTANCE = 112;
const REFRESH_RESISTANCE = 0.72;

function stop_and_run(event, action) {
  event.stopPropagation();
  action();
}

function HomeHeaderView(props) {
  const { vm$ } = props;
  return View({ class: "home-header" }, [
    View(
      {
        class: "home-header-icon",
        attributes: { role: "button", "aria-label": "菜单" },
        onClick(event) {
          stop_and_run(event, vm$.methods.open_menu);
        },
      },
      [Icon({ name: "menu", size: 27 })],
    ),
    View({ class: "home-tabs" }, [
      ...HOME_TABS.map((tab) =>
        View(
          {
            class: computed(vm$.state.active_tab, (active) =>
              active === tab ? "home-tab is-active" : "home-tab",
            ),
            onClick(event) {
              stop_and_run(event, () => vm$.methods.set_tab(tab));
            },
          },
          [
            tab,
            tab === "关注"
              ? View({ as: "span", class: "live-pill" }, ["直播"])
              : null,
          ],
        ),
      ),
    ]),
    View(
      {
        class: "home-header-icon",
        attributes: { role: "button", "aria-label": "搜索" },
        onClick(event) {
          stop_and_run(event, vm$.methods.open_search);
        },
      },
      [Icon({ name: "search", size: 27 })],
    ),
  ]);
}

function FeedVideoView(props) {
  const { vm$, item$, active$ } = props;
  const src_ = computed(item$, (item) => item.video);
  const poster_ = computed(item$, (item) => item.cover);
  let video_element = null;
  const events = [];

  function apply_playing() {
    if (!video_element) return;
    if (active$.value && vm$.state.playing.value) {
      const result = video_element.play();
      result?.catch?.(() => vm$.methods.set_playing(false));
    } else {
      video_element.pause();
    }
  }

  return Video({
    class: "feed-video",
    src: src_,
    poster: poster_,
    autoplay: false,
    loop: true,
    muted: vm$.state.muted,
    playsInline: true,
    preload: "metadata",
    onPlay() {
      if (active$.value) vm$.methods.set_playing(true);
    },
    onPause() {
      if (active$.value) vm$.methods.set_playing(false);
    },
    onError() {
      if (active$.value) vm$.methods.set_video_error(true);
    },
    onMounted(event) {
      video_element = event.target?.get$elm?.() || event.target;
      if (!video_element) return;
      video_element.muted = vm$.state.muted.value;
      events.push(
        vm$.state.playing.subscribe({ onChange: apply_playing }),
        active$.subscribe({ onChange: apply_playing }),
        vm$.state.muted.subscribe({
          onChange(value) {
            if (video_element) video_element.muted = value;
          },
        }),
      );
      apply_playing();
    },
    onUnmounted() {
      for (const unlisten of events) unlisten?.();
      events.length = 0;
      video_element?.pause?.();
      video_element = null;
      src_.destroy();
      poster_.destroy();
    },
  });
}

function FeedActionView(props) {
  return View(
    {
      class: props.class || "feed-action",
      attributes: { role: "button", "aria-label": props.label },
      onClick(event) {
        stop_and_run(event, props.onClick);
      },
    },
    [
      View({ class: "feed-action-symbol" }, [props.icon]),
      props.count === undefined
        ? null
        : View({ class: "feed-action-count" }, [props.count]),
    ],
  );
}

function FeedToolbarView(props) {
  const { vm$, item$ } = props;
  return View({ class: "feed-toolbar" }, [
    View(
      {
        class: "feed-avatar-wrap",
        onClick(event) {
          stop_and_run(event, vm$.methods.open_profile);
        },
      },
      [
        AvatarView({
          class: "feed-avatar",
          src: computed(item$, (item) => item.avatar),
        }),
        Show({
          when: computed(item$, (item) => !item.followed),
          ok() {
            return View(
              {
                class: "follow-mini-button",
                onClick(event) {
                  stop_and_run(event, vm$.methods.toggle_follow);
                },
              },
              ["+"],
            );
          },
        }),
      ],
    ),
    FeedActionView({
      label: "点赞",
      class: computed(item$, (item) =>
        item.liked ? "feed-action is-liked" : "feed-action",
      ),
      icon: "♥",
      count: computed(item$, (item) => format_count(item.likes)),
      onClick: vm$.methods.toggle_like,
    }),
    FeedActionView({
      label: "评论",
      icon: View({ class: "comment-glyph" }, ["•••"]),
      count: computed(item$, (item) => format_count(item.comments)),
      onClick: vm$.methods.open_comments,
    }),
    FeedActionView({
      label: "收藏",
      class: computed(item$, (item) =>
        item.collected ? "feed-action is-collected" : "feed-action",
      ),
      icon: "★",
      count: computed(item$, (item) => format_count(item.collections)),
      onClick: vm$.methods.toggle_collect,
    }),
    FeedActionView({
      label: "分享",
      icon: "↗",
      count: computed(item$, (item) => format_count(item.shares)),
      onClick: vm$.methods.open_share,
    }),
    View({ class: "music-disc" }, [
      Img({
        src: computed(item$, (item) => item.cover),
        alt: "音乐封面",
      }),
    ]),
  ]);
}

function FeedDescriptionView(props) {
  const { vm$, item$ } = props;
  return View({ class: "feed-description" }, [
    View({ class: "location-pill" }, [
      GlyphView({ glyph: "⌖" }),
      computed(item$, (item) => item.location),
    ]),
    View(
      {
        class: "feed-author",
        onClick(event) {
          stop_and_run(event, vm$.methods.open_profile);
        },
      },
      [computed(item$, (item) => `@${item.author}`)],
    ),
    View({ class: "feed-copy" }, [computed(item$, (item) => item.description)]),
    View({ class: "music-marquee" }, [
      GlyphView({ glyph: "♪" }),
      computed(item$, (item) => item.music),
    ]),
  ]);
}

function FeedSlideView(props) {
  const { vm$, index$, tab } = props;
  const item_ = derive(
    { items: vm$.state.items, index: index$ },
    ({ items, index }) => items[index],
  );
  const active_ = derive(
    {
      active_index: vm$.state.active_index,
      index: index$,
      active_tab: vm$.state.active_tab,
    },
    ({ active_index, index, active_tab }) =>
      active_index === index && active_tab === tab,
  );
  const loading_ = derive(
    { active: active_, loading: vm$.state.loading },
    ({ active, loading }) => active && loading,
  );
  const error_ = derive(
    { active: active_, error: vm$.state.video_error },
    ({ active, error }) => active && error,
  );
  const paused_ = derive(
    { active: active_, playing: vm$.state.playing },
    ({ active, playing }) => active && !playing,
  );

  return SwiperItem(
    {
      class: "feed-slide",
      onUnmounted() {
        item_.destroy();
        active_.destroy();
        loading_.destroy();
        error_.destroy();
        paused_.destroy();
      },
    },
    [
      FeedVideoView({ vm$, item$: item_, active$: active_ }),
      View({ class: "video-shade" }),
      Show({
        when: loading_,
        ok() {
          return View({ class: "video-loading" }, [
            Icon({ name: "loader-circle", size: 34, class: "spin" }),
          ]);
        },
      }),
      Show({
        when: error_,
        ok() {
          return View({ class: "video-error" }, [
            "视频暂时无法加载",
            View({ class: "video-error-subtitle" }, ["仍可上下滑动浏览内容"]),
          ]);
        },
      }),
      Show({
        when: paused_,
        ok() {
          return View({ class: "video-play-indicator" }, ["▶"]);
        },
      }),
      FeedDescriptionView({ vm$, item$: item_ }),
      FeedToolbarView({ vm$, item$: item_ }),
      View({ class: "feed-progress" }, [
        View({
          class: "feed-progress-value",
          style: {
            width: computed(
              vm$.state.active_index,
              (index) =>
                `${((index + 1) / vm$.state.items.value.length) * 100}%`,
            ),
          },
        }),
      ]),
    ],
  );
}

function VideoFeedView(props) {
  const { vm$, tab } = props;
  return Swiper(
    {
      class: "video-feed",
      orientation: "vertical",
      index: vm$.state.active_index,
      threshold: 1 / 3,
      duration: 300,
      mousewheel: true,
      pullToRefresh: true,
      refreshThreshold: REFRESH_THRESHOLD,
      refreshHoldDistance: REFRESH_HOLD_DISTANCE,
      resistance: REFRESH_RESISTANCE,
      reachBottomThreshold: 0,
      onChange(event) {
        vm$.methods.activate_video(event.index);
      },
      onRefresh() {
        return vm$.methods.refresh_tab(tab);
      },
      onReachBottom() {
        return vm$.methods.load_more(tab);
      },
      onClick() {
        if (vm$.state.active_tab.value === tab) vm$.methods.tap_feed();
      },
    },
    [
      For({
        each: vm$.state.items,
        render(_item, index$) {
          return FeedSlideView({ vm$, index$, tab });
        },
      }),
    ],
  );
}

function RefreshableTabView(props) {
  const { vm$, tab, content } = props;
  return Swiper(
    {
      class: "tab-vertical-swiper",
      orientation: "vertical",
      threshold: 1 / 3,
      pullToRefresh: true,
      refreshThreshold: REFRESH_THRESHOLD,
      refreshHoldDistance: REFRESH_HOLD_DISTANCE,
      resistance: REFRESH_RESISTANCE,
      reachBottomThreshold: 0,
      onRefresh() {
        return vm$.methods.refresh_tab(tab);
      },
      onReachBottom() {
        return vm$.methods.load_more(tab);
      },
    },
    [SwiperItem({ class: "tab-static-slide" }, [content])],
  );
}

function HomeTabsSwiperView(props) {
  const { vm$ } = props;
  return Swiper(
    {
      class: "home-tabs-swiper",
      orientation: "horizontal",
      index: vm$.state.active_tab_index,
      threshold: 1 / 3,
      duration: 300,
      onChange(event) {
        vm$.methods.set_tab(event.index);
      },
    },
    [
      SwiperItem({ class: "home-tab-panel" }, [
        VideoFeedView({ vm$, tab: "热点" }),
      ]),
      SwiperItem({ class: "home-tab-panel" }, [
        RefreshableTabView({
          vm$,
          tab: "长视频",
          content: LongVideoView({ vm$ }),
        }),
      ]),
      SwiperItem({ class: "home-tab-panel" }, [
        VideoFeedView({ vm$, tab: "关注" }),
      ]),
      SwiperItem({ class: "home-tab-panel" }, [
        RefreshableTabView({
          vm$,
          tab: "经验",
          content: DiscoveryView({ vm$ }),
        }),
      ]),
      SwiperItem({ class: "home-tab-panel" }, [
        VideoFeedView({ vm$, tab: "推荐" }),
      ]),
    ],
  );
}

function DiscoveryView(props) {
  const { vm$ } = props;
  return View({ class: "discovery-page" }, [
    View({ class: "discovery-search" }, [
      Icon({ name: "search", size: 20 }),
      View({ class: "discovery-search-placeholder" }, ["壁纸"]),
      View(
        {
          class: "discovery-search-button",
          onClick() {
            vm$.methods.open_search();
          },
        },
        ["搜索"],
      ),
    ]),
    View({ class: "discovery-grid" }, [
      For({
        each: DISCOVERY_POSTS,
        render(post) {
          return View({ class: "discovery-card" }, [
            Img({
              class: "discovery-card-image",
              src: post.image,
              alt: post.title,
              loading: "lazy",
            }),
            View({ class: "discovery-card-title" }, [post.title]),
            View({ class: "discovery-card-meta" }, [
              AvatarView({
                src: post.avatar,
                class: "tiny-avatar",
                loading: "lazy",
              }),
              View({ class: "discovery-card-author" }, [post.author]),
              View({ class: "discovery-card-likes" }, [`♡ ${post.likes}`]),
            ]),
          ]);
        },
      }),
    ]),
  ]);
}

/** @param {ViewComponentProps} props */
function LongLeadVideoView(props) {
  const { vm$, item } = props;
  let video_element = null;
  let unlisten_muted = null;
  let unlisten_tab = null;

  function apply_active_tab(tab) {
    if (!video_element) return;
    if (tab === "长视频") video_element.play()?.catch?.(() => {});
    else video_element.pause();
  }

  return Video({
    class: "long-video-lead-media",
    src: item.video,
    poster: item.cover,
    autoplay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "metadata",
    onMounted(event) {
      video_element = event.target?.get$elm?.() || event.target;
      if (!video_element) return;
      video_element.muted = vm$.state.muted.value;
      unlisten_muted = vm$.state.muted.subscribe({
        onChange(value) {
          if (video_element) video_element.muted = value;
        },
      });
      unlisten_tab = vm$.state.active_tab.subscribe({
        onChange: apply_active_tab,
      });
      apply_active_tab(vm$.state.active_tab.value);
    },
    onUnmounted() {
      unlisten_muted?.();
      unlisten_muted = null;
      unlisten_tab?.();
      unlisten_tab = null;
      video_element?.pause?.();
      video_element = null;
    },
  });
}

/** @param {ViewComponentProps} props */
function LongVideoView(props) {
  const { vm$ } = props;
  const durations = ["00:12", "00:12", "00:12", "00:09", "00:11", "00:08"];

  return View({ class: "long-video-page" }, [
    View({ class: "long-video-grid" }, [
      ...VIDEO_ITEMS.map((item, index) =>
        View(
          {
            class: `long-video-card${index === 0 ? " is-featured" : ""}`,
            onClick() {
              vm$.methods.open_video(item);
            },
          },
          [
            View({ class: "long-video-media" }, [
              index === 0
                ? LongLeadVideoView({ vm$, item })
                : Img({
                    class: "long-video-poster",
                    src: item.cover,
                    alt: item.description,
                  }),
              View({ class: "long-video-duration" }, [durations[index]]),
              index === 0
                ? View({ class: "long-video-options" }, [
                    View(
                      {
                        class: computed(vm$.state.danmu, (active) =>
                          active
                            ? "long-video-option is-active"
                            : "long-video-option",
                        ),
                        onClick(event) {
                          stop_and_run(event, vm$.methods.toggle_danmu);
                        },
                      },
                      ["弹"],
                    ),
                    View(
                      {
                        class: "long-video-option",
                        onClick(event) {
                          stop_and_run(event, vm$.methods.toggle_mute);
                        },
                      },
                      [
                        computed(vm$.state.muted, (muted) =>
                          muted ? "静" : "声",
                        ),
                      ],
                    ),
                    View({ class: "long-video-option" }, ["↻"]),
                  ])
                : null,
              index === 0
                ? Show({
                    when: vm$.state.danmu,
                    ok() {
                      return View({ class: "long-video-danmu" }, [
                        View({ as: "span" }, ["好有氛围感 ✨"]),
                        View({ as: "span" }, ["已收藏，慢慢看"]),
                      ]);
                    },
                  })
                : null,
            ]),
            View({ class: "long-video-title" }, [item.description]),
            View({ class: "long-video-meta" }, [
              View({ class: "long-video-author" }, [
                AvatarView({ src: item.avatar, class: "long-video-avatar" }),
                View({ as: "span" }, [item.author]),
              ]),
              View({ class: "long-video-likes" }, [
                `♡ ${format_count(item.likes)}`,
              ]),
            ]),
          ],
        ),
      ),
    ]),
  ]);
}

function CommentsSheetView(props) {
  const { vm$ } = props;
  return Show({
    when: vm$.state.comments_open,
    ok() {
      return View(
        {
          class: "sheet-mask",
          onClick() {
            vm$.methods.close_comments();
          },
        },
        [
          View(
            {
              class: "bottom-sheet comments-sheet",
              onClick(event) {
                event.stopPropagation();
              },
            },
            [
              View({ class: "sheet-handle" }),
              View({ class: "comments-sheet-header" }, [
                computed(
                  vm$.state.current_item,
                  (item) => `${format_count(item.comments)} 条评论`,
                ),
                View(
                  { class: "sheet-close", onClick: vm$.methods.close_comments },
                  ["×"],
                ),
              ]),
              View({ class: "comment-list" }, [
                For({
                  each: vm$.state.comments,
                  render(comment) {
                    return View({ class: "comment-row" }, [
                      AvatarView({
                        src: comment.avatar,
                        class: "comment-avatar",
                      }),
                      View({ class: "comment-body" }, [
                        View({ class: "comment-author" }, [comment.author]),
                        View({ class: "comment-text" }, [comment.text]),
                        View({ class: "comment-time" }, [
                          `${comment.time} · 回复`,
                        ]),
                      ]),
                      View({ class: "comment-like" }, [
                        "♡",
                        String(comment.likes),
                      ]),
                    ]);
                  },
                }),
              ]),
              View({ class: "comment-composer" }, [
                AvatarView({
                  src: "/media/avatars/head-image.jpeg",
                  class: "composer-avatar",
                }),
                Input({
                  class: "comment-input",
                  value: vm$.state.comment_draft,
                  placeholder: "说点什么...",
                  onInput(event) {
                    vm$.methods.set_comment_draft(event.target.value);
                  },
                }),
                View(
                  { class: "comment-send", onClick: vm$.methods.send_comment },
                  ["发送"],
                ),
              ]),
            ],
          ),
        ],
      );
    },
  });
}

function ShareSheetView(props) {
  const { vm$ } = props;
  const channels = [
    ["微信好友", "●", "wechat"],
    ["朋友圈", "◎", "moments"],
    ["QQ好友", "Q", "qq"],
    ["微博", "W", "weibo"],
  ];
  const actions = [
    ["复制链接", "copy", vm$.methods.copy_link],
    ["下载视频", "download", () => vm$.methods.share_to("本地相册")],
    ["不感兴趣", "circle-x", () => vm$.methods.share_to("不感兴趣")],
    ["举报", "circle-alert", () => vm$.methods.share_to("举报中心")],
  ];
  return Show({
    when: vm$.state.share_open,
    ok() {
      return View({ class: "sheet-mask", onClick: vm$.methods.close_share }, [
        View(
          {
            class: "bottom-sheet share-sheet",
            onClick(event) {
              event.stopPropagation();
            },
          },
          [
            View({ class: "sheet-handle" }),
            View({ class: "share-title" }, ["分享给朋友"]),
            View({ class: "share-row" }, [
              ...channels.map(([label, glyph, channel]) =>
                View(
                  {
                    class: "share-channel",
                    onClick() {
                      vm$.methods.share_to(channel);
                    },
                  },
                  [
                    View({ class: `share-channel-icon ${channel}` }, [glyph]),
                    View({ class: "share-label" }, [label]),
                  ],
                ),
              ),
            ]),
            View({ class: "share-divider" }),
            View({ class: "share-row" }, [
              ...actions.map(([label, icon, action]) =>
                View({ class: "share-channel", onClick: action }, [
                  View({ class: "share-action-icon" }, [
                    Icon({ name: icon, size: 23 }),
                  ]),
                  View({ class: "share-label" }, [label]),
                ]),
              ),
            ]),
            View({ class: "share-cancel", onClick: vm$.methods.close_share }, [
              "取消",
            ]),
          ],
        ),
      ]);
    },
  });
}

function MenuDrawerView(props) {
  const { vm$ } = props;
  const features = [
    ["我的钱包", "¥"],
    ["观看历史", "◷"],
    ["我的二维码", "⌗"],
    ["小程序", "◇"],
    ["青少年模式", "♧"],
    ["设置", "⚙"],
  ];
  return Show({
    when: vm$.state.menu_open,
    ok() {
      return View({ class: "drawer-mask", onClick: vm$.methods.close_menu }, [
        View(
          {
            class: "home-drawer",
            onClick(event) {
              event.stopPropagation();
            },
          },
          [
            View({ class: "drawer-title" }, ["下午好"]),
            View({ class: "drawer-card" }, [
              View({ class: "drawer-card-header" }, ["常用功能"]),
              View({ class: "drawer-feature-grid" }, [
                ...features.map(([label, glyph]) =>
                  View(
                    {
                      class: "drawer-feature",
                      onClick() {
                        vm$.methods.close_menu();
                        props.app_model.methods.notify(`${label}功能已打开`);
                      },
                    },
                    [
                      View({ class: "drawer-feature-icon" }, [glyph]),
                      View({ class: "drawer-feature-label" }, [label]),
                    ],
                  ),
                ),
              ]),
            ]),
            View({ class: "drawer-card" }, [
              View({ class: "drawer-card-header" }, ["最近常看"]),
              View({ class: "recent-avatars" }, [
                ...[1, 2, 3, 4, 5].map((index) =>
                  AvatarView({
                    src: `/media/avatars/${index}.png`,
                    class: "recent-avatar",
                  }),
                ),
              ]),
            ]),
          ],
        ),
      ]);
    },
  });
}

/** @param {ViewComponentProps} props */
export default function HomePageView(props) {
  const vm$ = HomePageModel(props);
  return View(
    {
      class: "page page-dark home-page",
      onMounted() {
        vm$.methods.init();
      },
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      HomeHeaderView({ vm$ }),
      HomeTabsSwiperView({ vm$ }),
      BottomNavigationView({ app_model: props.app_model, theme: "dark" }),
      CommentsSheetView({ vm$ }),
      ShareSheetView({ vm$ }),
      MenuDrawerView({ vm$, app_model: props.app_model }),
    ],
  );
}
