import { VIDEO_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function ProfilePageModel(props) {
  const item_ = ref(
    props.app_model.state.selected_video.value || VIDEO_ITEMS[0],
  );
  const followed_ = ref(item_.value.followed);
  const active_tab_ = ref("作品");
  const works_ = refarr(VIDEO_ITEMS);

  const methods = {
    back() {
      props.app_model.methods.back("home");
    },
    toggle_follow() {
      followed_.toggle();
      props.app_model.methods.notify(
        followed_.value ? "关注成功" : "已取消关注",
      );
    },
    set_tab(tab) {
      active_tab_.as(tab);
    },
    open_work(work) {
      item_.as(work);
      props.app_model.state.selected_video.as(work);
      props.app_model.methods.notify("作品已切换");
    },
    more() {
      props.app_model.methods.notify("更多作者信息");
    },
  };

  return defineModel({
    state: {
      item: item_,
      followed: followed_,
      active_tab: active_tab_,
      works: works_,
    },
    methods,
  });
}
