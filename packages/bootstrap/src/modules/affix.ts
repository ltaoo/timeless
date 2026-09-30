import { vm } from "@timeless/timeless";
import {
  ListenerManager,
  View,
  ViewChildren,
  ViewProps,
  ViewStyleProperties,
  classNames,
  computed,
  refobj,
  styleNames,
} from "@timeless/timeless";

/**
 * Affix · Bootstrap 5.3
 *
 * 固定定位在滚动超过设定阈值后启用：.affix 承载过渡，固定时加 .is-fixed。
 * 动态的 position/top 完全由 store 状态决定，因此走内联 style（styleNames）。
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

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  const fixed_ = computed(state_, (s) => s.fixed);

  const affix_class_ = classNames([
    "affix",
    computed(fixed_, (f) => (f ? "is-fixed" : "")),
    cls,
  ]);

  const affix_style_ = computed(fixed_, (fixed) => {
    const base: ViewStyleProperties = {};
    if (fixed) {
      base.position = "fixed";
      base.top = `${offsetTop}px`;
      base.zIndex = "10";
    }
    return base;
  });

  let detach: (() => void) | undefined;

  return View(
    {
      ...rest,
      class: affix_class_,
      style: styleNames([affix_style_, style]),
      onMounted(event: any) {
        listener$.append([
          store.onStateChange((v) => state_.as(v)),
        ]);

        const $elm = event.target as HTMLElement;
        const rect = $elm.getBoundingClientRect();
        store.handleMounted({
          top: rect.top + window.scrollY,
          height: rect.height,
        });

        const scrollTarget = target ? target() : window;
        const handleScroll = () => {
          const scrollTop =
            scrollTarget instanceof Window
              ? window.scrollY
              : (scrollTarget as HTMLElement).scrollTop;
          store.handleScroll({ scrollTop });
        };
        scrollTarget.addEventListener("scroll", handleScroll);
        detach = () => scrollTarget.removeEventListener("scroll", handleScroll);

        if (rest.onMounted) {
          (rest.onMounted as any)(event);
        }
      },
      onUnmounted() {
        if (detach) detach();
        listener$.destroy();
        if (rest.onUnmounted) {
          (rest.onUnmounted as any)();
        }
      },
    },
    children,
  );
}
