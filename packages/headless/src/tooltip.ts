import { refobj, ref, computed, isRef } from "@timeless/reactive";
import { TooltipCore, Align, Side } from "@timeless/ui";

import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Fragment } from "./fragment";
import { Portal as NativePortal } from "./portal";
import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export type TooltipProps = Partial<{
  align: Align;
  side: Side;
}>;

// 全局单例 tooltip store
let globalTooltipStore: TooltipCore | null = null;
let globalTooltipContentRef: ReturnType<typeof ref> | null = null;

function getGlobalTooltipStore() {
  if (!globalTooltipStore) {
    globalTooltipStore = new TooltipCore({
      side: "top",
      align: "center",
    });
  }
  return globalTooltipStore;
}

function getGlobalTooltipContentRef() {
  if (!globalTooltipContentRef) {
    globalTooltipContentRef = ref<ViewChildren>([]);
  }
  return globalTooltipContentRef;
}

export function Root(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}

export function Content(
  props: ViewProps & { store?: TooltipCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { content?: ViewChildren; side?: Side; align?: Align },
  children?: ViewChildren,
) {
  const { content, side = "top", align = "center", ...rest } = props;
  const store = getGlobalTooltipStore();
  const contentRef = getGlobalTooltipContentRef();

  return View(
    {
      ...rest,
      onMounted($e) {
        const $ref = $e.firstElementChild || $e;

        const handleMouseEnter = () => {
          console.log("[Tooltip] handleMouseEnter", { side, align, content });

          // 更新 reference
          store.popper.setReference(
            {
              $el: $ref,
              getRect() {
                return $ref.getBoundingClientRect();
              },
            },
            { force: true },
          );

          // 更新 side 和 align
          const placement = (side +
            (align !== "center" ? "-" + align : "")) as any;
          console.log("[Tooltip] setConfig placement:", placement);
          store.popper.setConfig({ placement });

          // 更新内容
          console.log("[Tooltip] update content", content);
          contentRef.as(content);

          // 显示
          console.log("[Tooltip] calling store.show()");
          store.show();
        };

        const handleMouseLeave = () => {
          store.hide();
        };

        $e.addEventListener("mouseenter", handleMouseEnter);
        $e.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          $e.removeEventListener("mouseenter", handleMouseEnter);
          $e.removeEventListener("mouseleave", handleMouseLeave);
        };
      },
      onUnmounted() {},
    },
    children,
  );
}

export function Portal(
  props: ViewProps & { store?: TooltipCore },
  children?: ViewChildren,
) {
  const store = props.store || getGlobalTooltipStore();
  const state = refobj(store.state);
  const contentRef = getGlobalTooltipContentRef();
  const events: any[] = [];

  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );

  const { class: className, style: styleProps, ...restProps } = props;

  return NativePortal(
    {
      onMounted() {
        console.log("[Tooltip Portal] mounted");
      },
      onUnmounted() {
        console.log("[Tooltip Portal] unmounted");
        for (const fn of events) {
          if (typeof fn === "function") {
            fn();
          }
        }
      },
    },
    [
      PopperPrimitive.Content(
        {
          store: store.popper,
          onReferenceOutOfView() {
            store.hide();
          },
          class: className,
          style: computed(state, (t) => {
            const display = t.visible ? "" : "display:none";
            if (styleProps) {
              return typeof styleProps === "function"
                ? `${display};${styleProps}`
                : `${display};${styleProps}`;
            }
            return display;
          }),
          onMounted($el) {
            console.log("[Tooltip Content] mounted", $el);
          },
        },
        (() => {
          if (isRef(contentRef)) {
            return contentRef.value as any as ViewChildren;
          }
          return children;
        })(),
      ),
    ],
  );
}
