import { DEFAULT_COMMENTS, VIDEO_ITEMS } from "@/data/content.js";

const HOME_TABS = ["热点", "长视频", "关注", "经验", "推荐"];

/** @param {ViewComponentProps} props */
export function HomePageModel(props) {
  const items_ = refarr(VIDEO_ITEMS.map((item) => ({ ...item })));
  const active_index_ = ref(0);
  const active_tab_index_ = ref(4);
  const active_tab_ = computed(
    active_tab_index_,
    (index) => HOME_TABS[index] || "推荐",
  );
  const playing_ = ref(true);
  const muted_ = ref(true);
  const danmu_ = ref(false);
  const loading_ = ref(true);
  const video_error_ = ref(false);
  const comments_open_ = ref(false);
  const share_open_ = ref(false);
  const menu_open_ = ref(false);
  const comment_draft_ = ref("");
  const comments_ = refarr(DEFAULT_COMMENTS.map((comment) => ({ ...comment })));
  const current_item_ = derive(
    { items: items_, index: active_index_ },
    ({ items, index }) => items[index] || items[0],
  );
  let load_more_page = 0;
  function activate_video(next_index) {
    if (next_index < 0 || next_index >= items_.value.length) return false;
    const changed = next_index !== active_index_.value;
    loading_.as(true);
    video_error_.as(false);
    playing_.as(true);
    if (changed) active_index_.as(next_index);
    return changed;
  }

  function update_current(updater) {
    const index = active_index_.value;
    items_.as(
      items_.value.map((item, item_index) =>
        item_index === index ? updater({ ...item }) : item,
      ),
    );
  }

  const methods = {
    init() {
      loading_.as(true);
    },
    set_tab(tab) {
      const index = typeof tab === "number" ? tab : HOME_TABS.indexOf(tab);
      if (index < 0 || index >= HOME_TABS.length) return;
      active_tab_index_.as(index);
      playing_.as(!["经验", "长视频"].includes(HOME_TABS[index]));
    },
    async refresh_tab(tab) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      props.app_model.methods.notify(`${tab}内容已刷新`);
    },
    async load_more(tab) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      if (["热点", "关注", "推荐"].includes(tab)) {
        load_more_page += 1;
        const more_items = VIDEO_ITEMS.slice(0, 3).map((item, index) => ({
          ...item,
          id: `${item.id}-page-${load_more_page}-${index}`,
        }));
        items_.as([...items_.value, ...more_items]);
      }
      props.app_model.methods.notify(`${tab}已加载更多`);
    },
    tap_feed() {
      methods.toggle_play();
    },
    toggle_play() {
      if (video_error_.value) return;
      playing_.toggle();
    },
    set_playing(value) {
      playing_.as(value);
      if (value) loading_.as(false);
    },
    set_loading(value) {
      loading_.as(value);
    },
    set_video_error(value) {
      video_error_.as(value);
      loading_.as(false);
    },
    toggle_mute() {
      muted_.toggle();
    },
    toggle_danmu() {
      danmu_.toggle();
    },
    next_video() {
      if (active_index_.value >= items_.value.length - 1) {
        props.app_model.methods.notify("已经刷到最新内容");
        return;
      }
      activate_video(active_index_.value + 1);
    },
    previous_video() {
      if (active_index_.value <= 0) return;
      activate_video(active_index_.value - 1);
    },
    activate_video,
    toggle_like() {
      update_current((item) => {
        item.likes += item.liked ? -1 : 1;
        item.liked = !item.liked;
        return item;
      });
    },
    toggle_collect() {
      update_current((item) => {
        item.collections += item.collected ? -1 : 1;
        item.collected = !item.collected;
        return item;
      });
    },
    toggle_follow() {
      update_current((item) => ({ ...item, followed: !item.followed }));
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
        id: `comment-${Date.now()}`,
        avatar: "/media/avatars/head-image.jpeg",
        author: "我",
        text,
        time: "刚刚",
        likes: 0,
      });
      comment_draft_.as("");
      update_current((item) => ({ ...item, comments: item.comments + 1 }));
    },
    open_share() {
      share_open_.as(true);
      playing_.as(false);
    },
    close_share() {
      share_open_.as(false);
      playing_.as(true);
    },
    async copy_link() {
      try {
        await globalThis.navigator.clipboard?.writeText(
          `https://www.douyin.com/video/${current_item_.value.id}`,
        );
      } catch {}
      methods.close_share();
      props.app_model.methods.notify("链接已复制");
    },
    share_to(channel) {
      methods.close_share();
      props.app_model.methods.notify(`已分享到${channel}`);
    },
    open_menu() {
      menu_open_.as(true);
      playing_.as(false);
    },
    close_menu() {
      menu_open_.as(false);
      playing_.as(true);
    },
    open_profile() {
      props.app_model.methods.navigate("profile", {
        video: current_item_.value,
      });
    },
    open_video(video) {
      props.app_model.methods.navigate("video", { video });
    },
    open_search() {
      props.app_model.methods.navigate("search");
    },
  };

  return defineModel({
    state: {
      items: items_,
      active_index: active_index_,
      active_tab_index: active_tab_index_,
      active_tab: active_tab_,
      current_item: current_item_,
      playing: playing_,
      muted: muted_,
      danmu: danmu_,
      loading: loading_,
      video_error: video_error_,
      comments_open: comments_open_,
      share_open: share_open_,
      menu_open: menu_open_,
      comment_draft: comment_draft_,
      comments: comments_,
    },
    methods,
    listeners: [
      () => {
        active_tab_.destroy();
        current_item_.destroy();
      },
    ],
  });
}
