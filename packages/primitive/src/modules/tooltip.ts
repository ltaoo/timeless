import { refobj, ref, computed, isRef } from "@timeless/reactive";
import { TooltipCore, Align, Side } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Fragment } from "@/content/fragment";
import { Portal as NativePortal } from "@/content/portal";
import { isStyleRef } from "@/style/index";
import { getHost } from "@/host";

import * as PopperPrimitive from "./popper";

export type TooltipProps = Partial<{
  align: Align;
  side: Side;
}>;

// 全局单例 tooltip store
let globalTooltipStore: TooltipCore | null = null;
let globalTooltipContentRef: ReturnType<typeof ref<ViewChildren>> | null = null;

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
  const host = getHost();
  const { content, side = "top", align = "center", ...rest } = props;
  const userOnMounted = rest.onMounted;
  const userOnMouseEnter = rest.onMouseEnter;
  const userOnMouseLeave = rest.onMouseLeave;
  const store = getGlobalTooltipStore();
  const contentRef = getGlobalTooltipContentRef();
  let $ref: any = null;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target as HTMLDivElement;
        const nodes = host.getChildNodes($e);
        $ref = nodes.find((n: any) => n?.nodeType === 1) || $e;

        const cleanup = userOnMounted ? userOnMounted(event) : undefined;
        return () => {
          if (typeof cleanup === "function") cleanup();
        };
      },
      onMouseEnter(e) {
        if (userOnMouseEnter) {
          userOnMouseEnter(e);
        }
        if (!$ref) return;
        const placement = (side +
          (align !== "center" ? "-" + align : "")) as any;
        store.popper.setConfig({ placement });
        store.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return host.getBoundingClientRect?.($ref) as any;
            },
          },
          { force: true },
        );
        contentRef.as(content ?? []);
        store.show();
      },
      onMouseLeave(e) {
        if (userOnMouseLeave) {
          userOnMouseLeave(e);
        }
        store.hide();
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
  const extraStyle =
    styleProps &&
    typeof styleProps === "object" &&
    !isRef(styleProps) &&
    !isStyleRef(styleProps)
      ? styleProps
      : {};

  return NativePortal(
    {
      onUnmounted() {
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
          style: {
            ...extraStyle,
            display: computed(state, (t) => (t.visible ? "block" : "none")),
          },
        },
        contentRef.value?.length ? (contentRef.value as any) : (children ?? []),
      ),
    ],
  );
}
