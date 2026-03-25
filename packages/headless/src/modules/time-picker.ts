import { refobj, computed, classNames } from "@timeless/reactive";
import { TimePickerCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";
import { For } from "../primitive/for";
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
  const { store, ...rest } = props;

  const events: (() => void)[] = [];

  const _input$ = View(
    {
      as: "input",
      type: "text",
      id: rest.id,
      style:
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
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
      onMounted($elm: HTMLDivElement) {
        store.$popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );

        $elm.addEventListener("pointerdown", (e: PointerEvent) => {
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
        });

        if (rest.onMounted) {
          rest.onMounted($elm);
        }
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
    [_input$, ...children],
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
                  return [
                    t.enter && animation?.in ? animation.in : "",
                    t.exit && animation?.out ? animation.out : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                }),
              ]),
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
    renderItem?: (hour: number, isSelected: boolean) => ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, renderItem, ...rest } = props;
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
      render(hour) {
        if (renderItem) {
          return renderItem(
            hour,
            computed(state, (s) => s.tempHour === hour),
          );
        }
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
    renderItem?: (minute: number, isSelected: boolean) => ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, renderItem, ...rest } = props;
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
      render(minute) {
        if (renderItem) {
          return renderItem(
            minute,
            computed(state, (s) => s.tempMinute === minute),
          );
        }
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
    renderItem?: (second: number, isSelected: boolean) => ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, renderItem, ...rest } = props;
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
      render(second) {
        if (renderItem) {
          return renderItem(
            second,
            computed(state, (s) => s.tempSecond === second),
          );
        }
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
