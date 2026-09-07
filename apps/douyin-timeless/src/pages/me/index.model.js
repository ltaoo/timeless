import { VIDEO_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function MePageModel(props) {
  const active_tab_ = ref("作品");
  const menu_open_ = ref(false);
  const works_ = refarr(VIDEO_ITEMS);

  const methods = {
    set_tab(tab) {
      active_tab_.as(tab);
    },
    open_menu() {
      menu_open_.as(true);
    },
    close_menu() {
      menu_open_.as(false);
    },
    edit_profile() {
      props.app_model.methods.notify("编辑资料");
    },
    open_feature(name) {
      methods.close_menu();
      props.app_model.methods.notify(`${name}页面已打开`);
    },
    open_work(item) {
      props.app_model.methods.navigate("profile", { video: item });
    },
  };

  return defineModel({
    state: { active_tab: active_tab_, menu_open: menu_open_, works: works_ },
    methods,
  });
}
