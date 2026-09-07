/** @param {ViewComponentProps} props */
export function ProductDetailPageModel(props) {
  const product_ = ref(props.app_model.state.selected_product.value);
  const quantity_ = ref(1);
  const selected_spec_ = ref("默认规格");

  const methods = {
    select_spec(spec) {
      selected_spec_.as(spec);
    },
    increment() {
      quantity_.increment();
    },
    decrement() {
      if (quantity_.value > 1) quantity_.decrement();
    },
    add_to_cart() {
      props.app_model.methods.notify(`已加入购物车 × ${quantity_.value}`);
    },
    buy_now() {
      props.app_model.methods.notify("订单已创建，请确认支付");
    },
    back() {
      props.app_model.methods.back("shop");
    },
  };

  return defineModel({
    state: {
      product: product_,
      quantity: quantity_,
      selected_spec: selected_spec_,
    },
    methods,
  });
}
