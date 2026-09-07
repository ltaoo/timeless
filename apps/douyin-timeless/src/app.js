import { ToastView } from "@/components/toast.js";
import ChatPageView from "@/pages/message/chat.js";
import MessagePageView from "@/pages/message/index.js";
import MePageView from "@/pages/me/index.js";
import HomePageView from "@/pages/home/index.js";
import ProductDetailPageView from "@/pages/shop/detail.js";
import ShopPageView from "@/pages/shop/index.js";
import ProfilePageView from "@/pages/profile/index.js";
import PublishPageView from "@/pages/publish/index.js";
import SearchPageView from "@/pages/search/index.js";
import VideoDetailPageView from "@/pages/video/detail.js";
import { DouyinApplicationModel } from "./app.model.js";

export function DouyinApplicationView() {
  const app_model = DouyinApplicationModel();
  const page_props = { app_model };

  return View(
    {
      class: "app-frame",
      onUnmounted() {
        app_model.destroy();
      },
    },
    [
      Match({
        when: app_model.state.route,
        cases: {
          home() {
            return HomePageView(page_props);
          },
          video() {
            return VideoDetailPageView(page_props);
          },
          shop() {
            return ShopPageView(page_props);
          },
          product() {
            return ProductDetailPageView(page_props);
          },
          publish() {
            return PublishPageView(page_props);
          },
          message() {
            return MessagePageView(page_props);
          },
          chat() {
            return ChatPageView(page_props);
          },
          me() {
            return MePageView(page_props);
          },
          profile() {
            return ProfilePageView(page_props);
          },
          search() {
            return SearchPageView(page_props);
          },
        },
        fallback() {
          return HomePageView(page_props);
        },
      }),
      ToastView({ message: app_model.state.toast }),
    ],
  );
}
