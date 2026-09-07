import { DEFAULT_COMMENTS, VIDEO_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function VideoDetailPageModel(props) {
  const video_ = ref({
    ...(props.app_model.state.selected_video.value || VIDEO_ITEMS[0]),
  });
  const playing_ = ref(true);
  const muted_ = ref(true);
  const comments_open_ = ref(false);
  const comment_draft_ = ref("");
  const comments_ = refarr(DEFAULT_COMMENTS.map((comment) => ({ ...comment })));

  const methods = {
    back() {
      props.app_model.methods.back("home");
    },
    open_search() {
      props.app_model.methods.navigate("search");
    },
    set_playing(value) {
      playing_.as(value);
    },
    toggle_play() {
      playing_.toggle();
    },
    toggle_mute() {
      muted_.toggle();
    },
    toggle_like() {
      video_.as({
        ...video_.value,
        liked: !video_.value.liked,
        likes: video_.value.likes + (video_.value.liked ? -1 : 1),
      });
    },
    toggle_collect() {
      video_.as({
        ...video_.value,
        collected: !video_.value.collected,
        collections:
          video_.value.collections + (video_.value.collected ? -1 : 1),
      });
    },
    open_comments() {
      comments_open_.as(true);
      playing_.as(false);
    },
    close_comments() {
      comments_open_.as(false);
      playing_.as(true);
    },
    set_comment_draft(value) {
      comment_draft_.as(value);
    },
    send_comment() {
      const text = comment_draft_.value.trim();
      if (!text) return;
      comments_.unshift({
        id: `detail-comment-${Date.now()}`,
        avatar: "/media/avatars/head-image.jpeg",
        author: "我",
        text,
        time: "刚刚",
        likes: 0,
      });
      comment_draft_.as("");
    },
    share() {
      props.app_model.methods.notify("分享面板已打开");
    },
  };

  return defineModel({
    state: {
      video: video_,
      playing: playing_,
      muted: muted_,
      comments_open: comments_open_,
      comment_draft: comment_draft_,
      comments: comments_,
    },
    methods,
  });
}
