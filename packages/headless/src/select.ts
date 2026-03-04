import {
  refobj,
  computed,
  isRef,
  classNames,
  sn,
  combine,
} from "@timeless/reactive";
import { SelectCore } from "@timeless/ui";

import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { Portal as NativePortal } from "./portal";
import { Presence } from "./presence";
import * as PopperPrimitive from "./popper";

export function Root(
  props: ViewProps & { store: SelectCore<any> },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.popper,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: SelectCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      ...rest,
      onMounted($e) {
        // 使用整个 trigger 元素作为 reference，而不是 firstElementChild
        store.popper.setReference(
          {
            $el: $e,
            getRect() {
              return $e.getBoundingClientRect();
            },
          },
          { force: true },
        );

        $e.addEventListener("pointerdown", () => {
          if (store.disabled) return;

          // 在点击时更新 reference，确保获取最新尺寸
          const rect = $e.getBoundingClientRect();
          store.reference = {
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };

          store.layer.pointerDown();
          if (store.open) {
            store.hide();
          } else {
            store.presence.show();
            store.show();
          }
        });

        if (rest.onMounted) {
          rest.onMounted($e);
        }
      },
    },
    children,
  );
}

export function Value(
  props: ViewProps & { store: SelectCore<any>; placeholder?: string },
  children?: ViewChildren,
) {
  const { store, placeholder, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return View(
    {
      ...rest,
      type: "span",
    },
    children ||
      Txt(
        computed(state, (d) => {
          const opt = (d.options || []).find((o: any) => o.value === d.value);
          return opt ? opt.label : placeholder || d.placeholder || "Select...";
        }),
      ),
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Portal(
  props: ViewProps & {
    store: SelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: SelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, animation, ...rest } = props;

  return Presence(
    {
      store: store.presence,
      animation,
    },
    [
      PopperPrimitive.Content(
        {
          ...rest,
          store: store.popper,
        },
        children,
      ),
    ],
  );
}

export function Viewport(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Item(
  props: ViewProps & { store: SelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.select(value);
        store.hide();
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View({ ...props, type: "span" }, children);
}

export function ItemIndicator(
  props: ViewProps & { store: SelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  const selected = computed(state, (d) => d.value === value);

  return View(
    {
      ...rest,
      style: sn([
        rest.style,
        combine({ ss: rest.style, selected }, ({ ss, selected }) => {
          return selected ? ss : "display:none;";
        }),
      ]),
    },
    children,
  );
}
