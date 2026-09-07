import { DISCOVERY_POSTS, VIDEO_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function SearchPageModel(props) {
  const query_ = ref("");
  const searched_ = ref(false);
  const results_ = derive({ query: query_ }, ({ query }) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return DISCOVERY_POSTS;
    return DISCOVERY_POSTS.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword),
    );
  });

  const methods = {
    set_query(value) {
      query_.as(value);
      searched_.as(false);
    },
    search(keyword) {
      if (keyword) query_.as(keyword);
      searched_.as(true);
    },
    clear() {
      query_.as("");
      searched_.as(false);
    },
    back() {
      props.app_model.methods.back("home");
    },
    open_post(index) {
      props.app_model.methods.navigate("profile", {
        video: VIDEO_ITEMS[index % VIDEO_ITEMS.length],
      });
    },
  };

  return defineModel({
    state: { query: query_, searched: searched_, results: results_ },
    methods,
    listeners: [() => results_.destroy()],
  });
}
