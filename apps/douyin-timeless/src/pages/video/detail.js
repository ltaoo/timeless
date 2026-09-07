import { AvatarView, BackButtonView } from "@/components/common.js";
import { format_count } from "@/data/content.js";
import { VideoDetailPageModel } from "./detail.model.js";

function stop_and_run(event, action) {
  event.stopPropagation();
  action();
}

/** @param {ViewComponentProps} props */
function DetailVideoView(props) {
  const { vm$ } = props;
  const src_ = computed(vm$.state.video, (video) => video.video);
  const poster_ = computed(vm$.state.video, (video) => video.cover);
  let video_element = null;
  const events = [];

  function apply_playing(playing) {
    if (!video_element) return;
    if (playing)
      video_element.play()?.catch?.(() => vm$.methods.set_playing(false));
    else video_element.pause();
  }

  return Video({
    class: "video-detail-media",
    src: src_,
    poster: poster_,
    autoplay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "metadata",
    onPlay() {
      vm$.methods.set_playing(true);
    },
    onPause() {
      vm$.methods.set_playing(false);
    },
    onMounted(event) {
      video_element = event.target?.get$elm?.() || event.target;
      if (!video_element) return;
      video_element.muted = vm$.state.muted.value;
      events.push(
        vm$.state.playing.subscribe({ onChange: apply_playing }),
        vm$.state.muted.subscribe({
          onChange(value) {
            if (video_element) video_element.muted = value;
          },
        }),
      );
      apply_playing(vm$.state.playing.value);
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

/** @param {ViewComponentProps} props */
function DetailActionView(props) {
  return View(
    {
      class: props.class || "video-detail-action",
      attributes: { role: "button", "aria-label": props.label },
      onClick(event) {
        stop_and_run(event, props.onClick);
      },
    },
    [
      View({ class: "video-detail-action-icon" }, [props.icon]),
      View({ class: "video-detail-action-count" }, [props.count]),
    ],
  );
}

/** @param {ViewComponentProps} props */
function DetailCommentsView(props) {
  const { vm$ } = props;
  return Show({
    when: vm$.state.comments_open,
    ok() {
      return View(
        { class: "sheet-mask", onClick: vm$.methods.close_comments },
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
                  vm$.state.video,
                  (video) => `${format_count(video.comments)} 条评论`,
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
                  placeholder: "善语结善缘，恶言伤人心",
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

/** @param {ViewComponentProps} props */
export default function VideoDetailPageView(props) {
  const vm$ = VideoDetailPageModel(props);

  return View(
    {
      class: "page page-dark video-detail-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "video-detail-topbar" }, [
        BackButtonView({
          class: "video-detail-back",
          onClick: vm$.methods.back,
        }),
        View(
          { class: "video-detail-search", onClick: vm$.methods.open_search },
          [
            Icon({ name: "search", size: 17 }),
            View({ as: "span", class: "video-detail-search-placeholder" }, [
              "搜你想看的",
            ]),
            View({ as: "span", class: "video-detail-search-submit" }, ["搜索"]),
          ],
        ),
      ]),
      View({ class: "video-detail-stage", onClick: vm$.methods.toggle_play }, [
        DetailVideoView({ vm$ }),
        View({ class: "video-shade" }),
        Show({
          when: computed(vm$.state.playing, (playing) => !playing),
          ok() {
            return View({ class: "video-play-indicator" }, ["▶"]);
          },
        }),
        View({ class: "video-detail-copy" }, [
          computed(vm$.state.video, (video) => `@${video.author}`),
          View({ class: "video-detail-description" }, [
            computed(vm$.state.video, (video) => video.description),
          ]),
        ]),
        View({ class: "video-detail-toolbar" }, [
          AvatarView({
            class: "video-detail-avatar",
            src: computed(vm$.state.video, (video) => video.avatar),
          }),
          DetailActionView({
            label: "点赞",
            class: computed(vm$.state.video, (video) =>
              video.liked
                ? "video-detail-action is-liked"
                : "video-detail-action",
            ),
            icon: "♥",
            count: computed(vm$.state.video, (video) =>
              format_count(video.likes),
            ),
            onClick: vm$.methods.toggle_like,
          }),
          DetailActionView({
            label: "评论",
            icon: "•••",
            count: computed(vm$.state.video, (video) =>
              format_count(video.comments),
            ),
            onClick: vm$.methods.open_comments,
          }),
          DetailActionView({
            label: "收藏",
            class: computed(vm$.state.video, (video) =>
              video.collected
                ? "video-detail-action is-collected"
                : "video-detail-action",
            ),
            icon: "★",
            count: computed(vm$.state.video, (video) =>
              format_count(video.collections),
            ),
            onClick: vm$.methods.toggle_collect,
          }),
          DetailActionView({
            label: "分享",
            icon: "↗",
            count: computed(vm$.state.video, (video) =>
              format_count(video.shares),
            ),
            onClick: vm$.methods.share,
          }),
          View(
            {
              class: "video-detail-sound",
              onClick(event) {
                stop_and_run(event, vm$.methods.toggle_mute);
              },
            },
            [computed(vm$.state.muted, (muted) => (muted ? "静音" : "有声"))],
          ),
        ]),
      ]),
      View({ class: "video-detail-footer" }, [
        AvatarView({
          src: "/media/avatars/head-image.jpeg",
          class: "video-detail-footer-avatar",
        }),
        View(
          {
            class: "video-detail-comment-entry",
            onClick: vm$.methods.open_comments,
          },
          ["善语结善缘，恶言伤人心"],
        ),
        View({ class: "video-detail-footer-tool" }, ["▧"]),
        View({ class: "video-detail-footer-tool" }, ["@"]),
        View({ class: "video-detail-footer-tool" }, ["☺"]),
      ]),
      DetailCommentsView({ vm$ }),
    ],
  );
}
