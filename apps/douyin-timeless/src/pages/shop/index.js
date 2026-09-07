import { BottomNavigationView } from "@/components/bottom-navigation.js";
import { EmptyStateView } from "@/components/common.js";
import { ShopPageModel } from "./index.model.js";

const CATEGORIES = ["推荐", "手机", "美妆", "服饰", "食品", "家居"];

function ShopHeaderView(props) {
  const { vm$ } = props;
  return View({ class: "shop-header" }, [
    View({ class: "shop-title-row" }, [
      View({ class: "shop-brand" }, ["抖音商城"]),
      View({ class: "shop-header-action" }, [
        Icon({ name: "inbox", size: 23 }),
        View({ class: "shop-cart-badge" }, [vm$.state.cart_count]),
      ]),
    ]),
    View({ class: "shop-search" }, [
      Icon({ name: "search", size: 19 }),
      Input({
        class: "shop-search-input",
        value: vm$.state.query,
        placeholder: "搜索你想要的商品",
        onInput(event) {
          vm$.methods.set_query(event.target.value);
        },
      }),
      View({ class: "shop-search-button", onClick: vm$.methods.search }, [
        "搜索",
      ]),
    ]),
    View({ class: "shop-categories" }, [
      ...CATEGORIES.map((category) =>
        View(
          {
            class: computed(vm$.state.active_category, (active) =>
              active === category ? "shop-category is-active" : "shop-category",
            ),
            onClick() {
              vm$.methods.set_category(category);
            },
          },
          [category],
        ),
      ),
    ]),
  ]);
}

function ShopBannerView(props) {
  const { vm$ } = props;
  const banners = [
    ["新人专享券", "全场最高立减 80 元", "立即领取"],
    ["限时秒杀", "大牌好物低至 1 折", "马上抢"],
    ["百亿补贴", "正品保障 · 买贵必赔", "去逛逛"],
  ];
  return Match({
    when: vm$.state.banner_index,
    cases: Object.fromEntries(
      banners.map((banner, index) => [
        index,
        () =>
          View({ class: `shop-banner shop-banner-${index + 1}` }, [
            View({ class: "shop-banner-copy" }, [
              View({ class: "shop-banner-title" }, [banner[0]]),
              View({ class: "shop-banner-subtitle" }, [banner[1]]),
              View({ class: "shop-banner-button" }, [banner[2]]),
            ]),
            View({ class: "shop-banner-art" }, [
              "好",
              View({ as: "span" }, ["物"]),
            ]),
            View({ class: "shop-banner-dots" }, [
              ...banners.map((_, dot_index) =>
                View({
                  class:
                    dot_index === index ? "banner-dot is-active" : "banner-dot",
                }),
              ),
            ]),
          ]),
      ]),
    ),
  });
}

function ShopBenefitsView() {
  const benefits = [
    ["⚡", "超值秒杀"],
    ["券", "新人券包"],
    ["补", "百亿补贴"],
    ["品", "品牌馆"],
    ["榜", "热卖榜单"],
  ];
  return View({ class: "shop-benefits" }, [
    ...benefits.map(([icon, label]) =>
      View({ class: "shop-benefit" }, [
        View({ class: "shop-benefit-icon" }, [icon]),
        View({ class: "shop-benefit-label" }, [label]),
      ]),
    ),
  ]);
}

function GoodsCardView(props) {
  const { product, vm$ } = props;
  return View(
    {
      class: "goods-card",
      onClick() {
        vm$.methods.open_product(product);
      },
    },
    [
      Img({
        class: "goods-image",
        src: product.image,
        alt: product.name,
        loading: "lazy",
      }),
      View({ class: "goods-info" }, [
        View({ class: "goods-title" }, [product.name]),
        View({ class: "goods-badge" }, [product.badge]),
        View({ class: "goods-price-row" }, [
          View({ class: "goods-price" }, [
            View({ as: "span", class: "goods-currency" }, ["¥"]),
            String(product.price),
          ]),
          View({ class: "goods-sold" }, [`已售${product.sold}`]),
          View(
            {
              class: "goods-cart-button",
              onClick: vm$.methods.add_to_cart,
            },
            ["+"],
          ),
        ]),
      ]),
    ],
  );
}

/** @param {ViewComponentProps} props */
export default function ShopPageView(props) {
  const vm$ = ShopPageModel(props);
  return View(
    {
      class: "page page-light shop-page",
      onMounted() {
        vm$.methods.init();
      },
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      ShopHeaderView({ vm$ }),
      View({ class: "shop-scroll" }, [
        ShopBannerView({ vm$ }),
        ShopBenefitsView(),
        View({ class: "shop-section-heading" }, ["猜你喜欢"]),
        Show({
          when: computed(vm$.state.filtered_goods, (items) => items.length > 0),
          ok() {
            return View({ class: "goods-grid" }, [
              For({
                each: vm$.state.filtered_goods,
                render(product) {
                  return GoodsCardView({ product, vm$ });
                },
              }),
            ]);
          },
          else() {
            return EmptyStateView({
              icon: "⌕",
              title: "没有找到相关商品",
              text: "换个关键词试试吧",
            });
          },
        }),
      ]),
      BottomNavigationView({ app_model: props.app_model, theme: "light" }),
    ],
  );
}
