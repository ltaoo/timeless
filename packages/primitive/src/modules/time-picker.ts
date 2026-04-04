import { refobj, computed } from "@timeless/reactive";
import { TimePickerCore } from "@timeless/ui";

import { ClassNameRef, classNames, isClassName } from "@/vnode/class-names";
import { isStyleRef, styleNames } from "@/vnode/style-names";
import { View, ViewChildren, ViewProps } from "@/content/view";
import { For } from "@/reactive/for";
import { Fragment } from "@/content/fragment";
import { getHost } from "@/host";

import { Portal as NativePortal } from "./portal";
import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: TimePickerCore },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.$popper,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: TimePickerCore; id?: string },
  children: ViewChildren = [],
) {
  const host = getHost();
  const { store, ...rest } = props;

  const events: (() => void)[] = [];

  const _input$ = View(
    {
      as: "input",
      attributes: {
        ...(rest.attributes || {}),
        id: props.id || rest.attributes?.id,
      },
      style: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        "border-width": 0,
      },
      onFocus() {
        if (store.$presence.state.visible) {
          return;
        }
        store.$presence.show();
        store.$popper.place();
      },
    },
    [],
  );

  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = (event as any).target as HTMLDivElement;
        store.$popper.setReference(
          {
            $el: $elm,
            getRect() {
              return host.getBoundingClientRect?.($elm) as any;
            },
          },
          { force: true },
        );

        const handlePointerDown = (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if ((e.target as HTMLElement).tagName === "INPUT") {
            return;
          }
          if (store.$presence.state.visible) {
            store.$presence.hide();
            return;
          }
          store.$presence.show();
          store.$popper.place();
        };
        host.addEventListener($elm, "pointerdown", handlePointerDown);

        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          host.removeEventListener($elm, "pointerdown", handlePointerDown);
        };
      },
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") fn();
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [_input$, Fragment({}, children)],
  );
}

export function Value(
  props: ViewProps & { store: TimePickerCore; placeholder?: string },
  children?: ViewChildren,
) {
  const { store, placeholder = "Select time...", ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return View(
    {
      ...rest,
      as: "span",
    },
    [
      computed(state, (d) => {
        return d.time || placeholder;
      }),
    ],
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Clear(
  props: ViewProps & { store: TimePickerCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onPointerDown(e: PointerEvent) {
        e.preventDefault();
        e.stopPropagation();
      },
      onClick(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        store.clear();
        store.$presence.hide();
      },
    },
    children,
  );
}

export function Portal(
  props: ViewProps & {
    store: TimePickerCore;
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: TimePickerCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.$presence.state);
  let _was_exiting = false;

  store.$presence.onStateChange((v) => {
    presence_.as(v);
  });

  return Presence({ store: store.$presence }, [
    NativePortal({}, [
      PopperPrimitive.Content(
        {
          store: store.$popper,
          onDismiss() {
            store.$presence.hide();
          },
        },
        [
          View(
            {
              ...rest,
              class: classNames([
                rest.class,
                computed(presence_, (t) => {
                  if (t.exit) {
                    _was_exiting = true;
                  }
                  if (!t.mounted && _was_exiting) {
                    _was_exiting = false;
                    return animation?.out || "";
                  }
                  if (t.mounted) {
                    _was_exiting = false;
                  }
                  return [
                    t.enter && animation?.in ? animation.in : "",
                    t.exit && animation?.out ? animation.out : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                }),
              ]),
              onAnimationEnd(e: AnimationEvent) {
                if (e.target === e.currentTarget) {
                  store.$presence.handleAnimationEnd();
                }
                if (rest.onAnimationEnd) {
                  rest.onAnimationEnd(e);
                }
              },
            },
            children,
          ),
        ],
      ),
    ]),
  ]);
}

export function TimePanel(
  props: ViewProps & { store: TimePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

export function HourColumn(
  props: ViewProps & {
    store: TimePickerCore;
  },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  const hours = store.generateHours();

  return View(rest, [
    For({
      each: hours,
      // @ts-ignore
      render(hour) {
        return HourItem(
          {
            store,
            value: hour,
          },
          [String(hour).padStart(2, "0")],
        );
      },
    }),
  ]);
}

export function HourItem(
  props: ViewProps & {
    store: TimePickerCore;
    value: number;
  },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
      onClick() {
        store.selectHour(value);
      },
    },
    children,
  );
}

export function MinuteColumn(
  props: ViewProps & {
    store: TimePickerCore;
  },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  const minutes = store.generateMinutes();

  return View(rest, [
    For({
      each: minutes,
      // @ts-ignore
      render(minute) {
        return MinuteItem(
          {
            store,
            value: minute,
          },
          [String(minute).padStart(2, "0")],
        );
      },
    }),
  ]);
}

export function MinuteItem(
  props: ViewProps & {
    store: TimePickerCore;
    value: number;
  },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
      onClick() {
        store.selectMinute(value);
      },
    },
    children,
  );
}

export function SecondColumn(
  props: ViewProps & {
    store: TimePickerCore;
  },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  const seconds = store.generateSeconds();

  return View(rest, [
    For({
      each: seconds,
      // @ts-ignore
      render(second) {
        return SecondItem(
          {
            store,
            value: second,
          },
          [String(second).padStart(2, "0")],
        );
      },
    }),
  ]);
}

export function SecondItem(
  props: ViewProps & {
    store: TimePickerCore;
    value: number;
  },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
      onClick() {
        store.selectSecond(value);
      },
    },
    children,
  );
}

export function ConfirmButton(
  props: ViewProps & { store: TimePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
      onClick() {
        store.confirm();
      },
    },
    children || ["OK"],
  );
}

export function ClearButton(
  props: ViewProps & { store: TimePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
      onClick() {
        store.clear();
        store.$presence.hide();
      },
    },
    children || ["Clear"],
  );
}
