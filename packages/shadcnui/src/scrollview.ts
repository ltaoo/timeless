import { View } from "@timeless/headless";
import { ref, computed } from "@timeless/headless";

export function ScrollView(props: any, children: any) {
  const { store, ...rest } = props;
  const cn = ref(rest.class);
  const progress$ = View(
    {
      class: "w-[50px] h-[50px] mx-auto rounded-full bg-w-bg-0",
    },
    [
      View({
        class: "inline-flex justify-center items-center w-full h-full",
        style: "transition: all 300ms;",
      }),
    ],
  );
  const indicator$ = View(
    {
      class:
        "scroll-view-indicator relative w-full overflow-hidden text-center",
    },
    [
      View(
        {
          class: "absolute left-0 bottom-0 w-full min-h-[30px] py-[10px]",
        },
        [progress$],
      ),
    ],
  );
  const view$ = View(
    {
      class: computed({ cn }, (draft) =>
        ["scroll-view w-full h-full overflow-y-auto", draft.cn].join(" "),
      ),
    },
    [indicator$, ...children],
  );
  const rotate = ref(false);

  props.store.inDownOffset(() => {
    rotate.value = false;
    progress$.$elm.style.display = "block";
  });
  props.store.outDownOffset(() => {
    rotate.value = true;
    progress$.$elm.style.display = "none";
  });

  /** @ts-ignore */
  TimelessWeb.provide_ui_scroll_view_indicator(props.store, indicator$.$elm);
  /** @ts-ignore */
  TimelessWeb.provide_ui_scroll_view_scroll(props.store, view$.$elm);

  return {
    t: "view",
    $elm: view$.$elm,
    onMounted() {
      // 所有 component 都要返回 onMounted，调用 view$.onMounted 和 props.onMounted
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      view$.onUnmounted();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    render() {
      const $elm = view$.render();
      props.store.setRect({
        width: view$.$elm.clientWidth,
        height: view$.$elm.clientHeight,
      });
      // view$.onMounted();
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}
