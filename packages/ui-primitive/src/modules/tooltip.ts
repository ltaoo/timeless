import {
  refobj,
  ref,
  computed,
  styleNames,
  ListenerManager,
} from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Portal as NativePortal,
} from "../core";
import { TooltipCore, Align, Side } from "@timeless/inner-vm";

// import { getHost } from "@/host";

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

  return View({ ...rest }, children);
}

export function Trigger(
  props: ViewProps & { content?: ViewChildren; side?: Side; align?: Align },
  children?: ViewChildren,
) {
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
        const $e = event.target;
        const nodes = $e.getChildren();
        $ref = nodes.find((n) => n && n.getType() === "view") || $e;

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
              return $ref.getBoundingClientRect();
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
  const { class: cls, ...restProps } = props;

  const store = props.store || getGlobalTooltipStore();
  const state_ = refobj(store.state);
  // const contentRef = getGlobalTooltipContentRef();
  const listener$ = ListenerManager([state_]);

  listener$.add(
    store.onStateChange(() => {
      state_.as(store.state);
    }),
  );

  return NativePortal(
    {
      onUnmounted() {
        listener$.destroy();
      },
    },
    [
      PopperPrimitive.Content(
        {
          store: store.popper,
          class: cls,
          style: styleNames([
            props.style,
            {
              display: computed(state_, (t) => (t.visible ? "block" : "none")),
            },
          ]),
          onReferenceOutOfView() {
            store.hide();
          },
        },
        children,
        // contentRef.value?.length ? (contentRef.value as any) : (children ?? []),
      ),
    ],
  );
}
