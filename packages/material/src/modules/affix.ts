import { vm } from "@timeless/timeless";
import {
  ListenerManager,
  View,
  ViewChildren,
  ViewProps,
  ViewStyleProperties,
  classNames,
  computed,
  ref,
  styleNames,
} from "@timeless/timeless";

/**
 * Affix · Material 3
 *
 * 类名：.m3-affix（+ 固定态 .is-fixed）。固定时 position/top 由 store 状态决定，
 * 走内联 style；过渡交给 CSS（--duration-short + --easing-standard）。
 *
 * offsetTop 由调用方传入（与 store 的 top 保持一致），用于计算 fixed 时的 top。
 */
export function Affix(
  props: ViewProps & {
    store: vm.AffixCore;
    offsetTop?: number;
    target?: () => HTMLElement | Window;
  },
  children: ViewChildren,
) {
  const { store, offsetTop = 0, target, class: cls, style, ...rest } = props;

  const fixed_ = ref(store.fixed);
  const listener$ = ListenerManager([fixed_]);

  const class_ = classNames([
    "m3-affix",
    computed(fixed_, (fixed) => (fixed ? "is-fixed" : "")),
    cls,
  ]);

  const style_ = computed(fixed_, (fixed) => {
    const next: ViewStyleProperties = {};
    if (fixed) {
      next.position = "fixed";
      next.top = `${offsetTop}px`;
      next.zIndex = "10";
    }
    return next;
  });

  let remove_scroll: (() => void) | null = null;

  const handleMounted = (event: any) => {
    listener$.add(
      store.onStateChange((state) => {
        fixed_.as(state.fixed);
      }),
    );

    const $elm = event.target as HTMLElement;
    const rect = $elm.getBoundingClientRect();
    store.handleMounted({
      top: rect.top + window.scrollY,
      height: rect.height,
    });

    const scroll_target = target ? target() : window;
    const handle_scroll = () => {
      const scroll_top =
        scroll_target instanceof Window
          ? window.scrollY
          : (scroll_target as HTMLElement).scrollTop;
      store.handleScroll({ scrollTop: scroll_top });
    };
    scroll_target.addEventListener("scroll", handle_scroll);
    remove_scroll = () =>
      scroll_target.removeEventListener("scroll", handle_scroll);

    if (rest.onMounted) {
      rest.onMounted(event);
    }
  };

  return View(
    {
      ...rest,
      class: class_,
      style: styleNames([style_, style]),
      onMounted: handleMounted,
      onUnmounted() {
        listener$.destroy();
        if (remove_scroll) remove_scroll();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
