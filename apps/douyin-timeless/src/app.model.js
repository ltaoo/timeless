import { GOODS, VIDEO_ITEMS } from "@/data/content.js";

const ROUTE_PATHS = {
  home: "/home",
  video: "/video/detail",
  shop: "/shop",
  product: "/shop/detail",
  publish: "/publish",
  message: "/message",
  chat: "/message/chat",
  me: "/me",
  profile: "/user",
  search: "/search",
};

function route_from_pathname(pathname) {
  const match = Object.entries(ROUTE_PATHS).find(
    ([, path]) => path === pathname,
  );
  return match?.[0] || "home";
}

export function DouyinApplicationModel() {
  const route_ = ref(route_from_pathname(globalThis.location.pathname));
  const selected_video_ = ref(VIDEO_ITEMS[0]);
  const selected_chat_ = ref(null);
  const selected_product_ = ref(GOODS[0]);
  const toast_ = ref("");
  let toast_timer = null;

  const methods = {
    navigate(route, payload = {}) {
      if (!ROUTE_PATHS[route]) return;
      if (payload.video) selected_video_.as(payload.video);
      if (payload.chat) selected_chat_.as(payload.chat);
      if (payload.product) selected_product_.as(payload.product);
      route_.as(route);
      globalThis.history.pushState({ route }, "", ROUTE_PATHS[route]);
      globalThis.scrollTo?.(0, 0);
    },
    replace(route) {
      if (!ROUTE_PATHS[route]) return;
      route_.as(route);
      globalThis.history.replaceState({ route }, "", ROUTE_PATHS[route]);
    },
    back(fallback = "home") {
      if (globalThis.history.length > 1) {
        globalThis.history.back();
        return;
      }
      methods.replace(fallback);
    },
    notify(message) {
      if (toast_timer) globalThis.clearTimeout(toast_timer);
      toast_.as(message);
      toast_timer = globalThis.setTimeout(() => toast_.as(""), 1800);
    },
  };

  const on_popstate = () => {
    route_.as(route_from_pathname(globalThis.location.pathname));
  };
  globalThis.addEventListener("popstate", on_popstate);

  if (globalThis.location.pathname === "/") {
    globalThis.history.replaceState({ route: "home" }, "", ROUTE_PATHS.home);
  }

  return defineModel({
    state: {
      route: route_,
      selected_video: selected_video_,
      selected_chat: selected_chat_,
      selected_product: selected_product_,
      toast: toast_,
    },
    methods,
    listeners: [
      () => globalThis.removeEventListener("popstate", on_popstate),
      () => {
        if (toast_timer) globalThis.clearTimeout(toast_timer);
      },
    ],
  });
}
