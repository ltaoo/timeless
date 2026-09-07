import { BackButtonView } from "@/components/common.js";
import { ProductDetailPageModel } from "./detail.model.js";

/** @param {ViewComponentProps} props */
export default function ProductDetailPageView(props) {
  const vm$ = ProductDetailPageModel(props);
  const product = vm$.state.product.value;
  return View(
    {
      class: "page page-light product-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "product-media" }, [
        Img({
          class: "product-hero-image",
          src: product.image,
          alt: product.name,
        }),
        View({ class: "product-topbar" }, [
          BackButtonView({ onClick: vm$.methods.back }),
          View({ class: "product-topbar-actions" }, [
            View({ class: "round-icon-button" }, ["↗"]),
            View({ class: "round-icon-button" }, [
              Icon({ name: "ellipsis", size: 22 }),
            ]),
          ]),
        ]),
        View({ class: "product-image-count" }, ["1 / 5"]),
      ]),
      View({ class: "product-scroll" }, [
        View({ class: "product-summary" }, [
          View({ class: "product-price" }, [
            View({ as: "span" }, ["¥"]),
            String(product.price),
          ]),
          View({ class: "product-origin-price" }, [`¥${product.origin_price}`]),
          View({ class: "product-discount" }, [product.badge]),
          View({ class: "product-name" }, [product.name]),
          View({ class: "product-sales" }, [
            `已售 ${product.sold} · 48小时内发货`,
          ]),
        ]),
        View({ class: "product-panel" }, [
          View({ class: "product-panel-row" }, [
            View({ class: "product-panel-label" }, ["保障"]),
            View({ class: "product-panel-value" }, [
              "假一赔四 · 7天无理由 · 运费险",
            ]),
            View({ class: "product-panel-arrow" }, ["›"]),
          ]),
          View({ class: "product-panel-row" }, [
            View({ class: "product-panel-label" }, ["选择"]),
            View({ class: "product-panel-value" }, [vm$.state.selected_spec]),
            View({ class: "product-panel-arrow" }, ["›"]),
          ]),
        ]),
        View({ class: "product-store" }, [
          View({ class: "product-store-logo" }, ["品"]),
          View({ class: "product-store-copy" }, [
            View({ class: "product-store-name" }, ["抖音商城官方旗舰店"]),
            View({ class: "product-store-score" }, [
              "综合体验 4.9 · 粉丝 128.6万",
            ]),
          ]),
          View({ class: "product-store-button" }, ["进店"]),
        ]),
        View({ class: "product-detail-placeholder" }, [
          View({ class: "product-detail-title" }, ["商品详情"]),
          Img({ src: product.image, alt: "商品详情图", loading: "lazy" }),
        ]),
      ]),
      View({ class: "product-bottom-bar" }, [
        View({ class: "product-service" }, [
          "⌂",
          View({ as: "span" }, ["店铺"]),
        ]),
        View({ class: "product-service" }, [
          "◌",
          View({ as: "span" }, ["客服"]),
        ]),
        View(
          {
            class: "product-action add-cart",
            onClick: vm$.methods.add_to_cart,
          },
          ["加入购物车"],
        ),
        View(
          { class: "product-action buy-now", onClick: vm$.methods.buy_now },
          ["立即购买"],
        ),
      ]),
    ],
  );
}
