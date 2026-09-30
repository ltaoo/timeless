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
 * Affix · Fluent 2
 *
 * 滚动到阈值后把内容 fixed 到顶部（.fl-affix.is-fixed）。位置/阈值由
 * AffixCore 计算，模块只把 store.fixed 映射成类名与内联定位，
 * 并在固定态用 --duration-fast 过渡（见 affix.css）。
 *
 * 挂载时记录元素顶部绝对位置，并监听滚动目标（默认 window）持续上报。
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

  const affixStyle_ = computed(fixed_, (fixed) => {
    const baseStyle: ViewStyleProperties = {};
    if (fixed) {
      baseStyle.position = "fixed";
      baseStyle.top = `${offsetTop}px`;
      baseStyle["z-index"] = "10";
    }
    return baseStyle;
  });

  const handleMounted = (event: any) => {
    const $elm = event.target as HTMLElement;
    const rect = $elm.getBoundingClientRect();
    store.handleMounted({
      top: rect.top + window.scrollY,
      height: rect.height,
    });

    listener$.add(
      store.onStateChange((state) => {
        fixed_.as(state.fixed);
      }),
    );

    const scrollTarget = target ? target() : window;
    const handleScroll = () => {
      const scrollTop =
        scrollTarget instanceof Window
          ? window.scrollY
          : (scrollTarget as HTMLElement).scrollTop;
      store.handleScroll({ scrollTop });
    };
    scrollTarget.addEventListener("scroll", handleScroll);
    listener$.add(() => {
      scrollTarget.removeEventListener("scroll", handleScroll);
    });

    if (props.onMounted) {
      props.onMounted(event);
    }

    return listener$.destroy;
  };

  return View(
    {
      ...rest,
      class: classNames([
        "fl-affix",
        computed(fixed_, (fixed) => (fixed ? "is-fixed" : "")),
        cls,
      ]),
      style: styleNames([affixStyle_, style]),
      onMounted: handleMounted,
      onUnmounted() {
        listener$.destroy();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
