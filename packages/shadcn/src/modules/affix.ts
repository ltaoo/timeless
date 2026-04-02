import {
  View,
  ViewChildren,
  ViewProps,
  computed,
  ref,
  cn,
} from "@timeless/primitive";
import { AffixCore } from "@timeless/ui";

export function Affix(
  props: ViewProps & {
    store: AffixCore;
    offsetTop?: number;
    target?: () => HTMLElement | Window;
  },
  children: ViewChildren,
) {
  const { store, offsetTop = 0, target, class: cls, style, ...rest } = props;

  const fixed_ = ref(store.fixed);
  const height_ = ref(store.height);

  store.onStateChange((state) => {
    fixed_.as(state.fixed);
    height_.as(state.height);
  });

  const affixClass_ = cn([
    computed(fixed_, (fixed) => (fixed ? "transition-all duration-200" : "")),
    cls,
  ]);

  const affixStyle_ = computed(fixed_, (fixed) => {
    const baseStyle: Record<string, string> = {};
    if (fixed) {
      baseStyle.position = "fixed";
      baseStyle.top = `${offsetTop}px`;
      baseStyle.zIndex = "10";
    }
    if (typeof style === "string") {
      return (
        Object.entries(baseStyle)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ") + (style ? `; ${style}` : "")
      );
    }
    return Object.entries({ ...baseStyle, ...(style as object) })
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  });

  const handleMounted = ($elm: HTMLElement) => {
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
          : scrollTarget.scrollTop;
      store.handleScroll({ scrollTop });
    };

    scrollTarget.addEventListener("scroll", handleScroll);

    if (props.onMounted) {
      props.onMounted($elm);
    }
  };

  return View(
    {
      ...rest,
      class: affixClass_,
      style: affixStyle_,
      onMounted: handleMounted,
    },
    children,
  );
}
