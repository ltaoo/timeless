import { GOODS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function ShopPageModel(props) {
  const query_ = ref("");
  const active_category_ = ref("推荐");
  const banner_index_ = ref(0);
  const cart_count_ = ref(2);
  const goods_ = refarr(GOODS);
  const filtered_goods_ = derive(
    { goods: goods_, query: query_, category: active_category_ },
    ({ goods, query }) => {
      const keyword = query.trim().toLowerCase();
      if (!keyword) return goods;
      return goods.filter((item) => item.name.toLowerCase().includes(keyword));
    },
  );
  let banner_timer = null;

  const methods = {
    init() {
      banner_timer = globalThis.setInterval(() => {
        banner_index_.as((index) => (index + 1) % 3);
      }, 3500);
    },
    set_query(value) {
      query_.as(value);
    },
    search() {
      props.app_model.methods.notify(
        query_.value.trim()
          ? `正在搜索“${query_.value.trim()}”`
          : "为你推荐热门好物",
      );
    },
    set_category(category) {
      active_category_.as(category);
    },
    open_product(product) {
      props.app_model.methods.navigate("product", { product });
    },
    add_to_cart(event) {
      event?.stopPropagation?.();
      cart_count_.increment();
      props.app_model.methods.notify("已加入购物车");
    },
  };

  return defineModel({
    state: {
      query: query_,
      active_category: active_category_,
      banner_index: banner_index_,
      cart_count: cart_count_,
      goods: goods_,
      filtered_goods: filtered_goods_,
    },
    methods,
    listeners: [
      () => filtered_goods_.destroy(),
      () => {
        if (banner_timer) globalThis.clearInterval(banner_timer);
      },
    ],
  });
}
