import { refobj, ref, computed } from "@timeless/reactive";
import { TooltipCore, Align, Side } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "@/primitive/view";
import { Fragment } from "@/primitive/fragment";
import { getHost } from "@/host";

import { Portal as NativePortal } from "./portal";
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
      onMounted($e: HTMLDivElement) {
        const nodes = host.getChildNodes($e);
        $ref = nodes.find((n: any) => n?.nodeType === 1) || $e;

        const cleanup = userOnMounted ? userOnMounted($e) : undefined;
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
          style: computed(state, (t) => {
            const display = t.visible ? "" : "display:none";
            if (typeof styleProps === "string" && styleProps) {
              return `${display};${styleProps}`;
            }
            return display;
          }),
        },
        contentRef.value?.length ? (contentRef.value as any) : (children ?? []),
      ),
    ],
  );
}
