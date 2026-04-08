import {
  View,
  ViewChildren,
  ViewProps,
  computed,
  ref,
  classNames,
  ViewStyleProperties,
  styleNames,
} from "@timeless/timeless";
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

  const affixClass_ = classNames([
    computed(fixed_, (fixed) => (fixed ? "transition-all duration-200" : "")),
    cls,
  ]);

  const affixStyle_ = computed(fixed_, (fixed) => {
    const baseStyle: ViewStyleProperties = {};
    if (fixed) {
      baseStyle.position = "fixed";
      baseStyle.top = `${offsetTop}px`;
      baseStyle.zIndex = "10";
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
      props.onMounted(event);
    }
  };

  return View(
    {
      ...rest,
      class: affixClass_,
      style: styleNames([affixStyle_, props.style]),
      onMounted: handleMounted,
    },
    children,
  );
}
