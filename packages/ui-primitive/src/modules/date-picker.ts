import { refobj, computed } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Portal as NativePortal,
  Fragment,
  For,
  Button,
  ButtonProps,
  classNames,
  TimelessElement,
} from "@timeless/timeless";
import { DatePickerCore } from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DatePickerCore },
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
  props: ViewProps & { store: DatePickerCore; id?: string },
  children: ViewChildren = [],
) {
  // const host = getHost();
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
        const $elm = event.target;
        store.$popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
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
        // @ts-ignore
        $elm.addEventListener("pointerdown", handlePointerDown);

        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          // @ts-ignore
          $elm.removeEventListener("pointerdown", handlePointerDown);
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
  props: ViewProps & { store: DatePickerCore; placeholder?: string },
  children?: ViewChildren,
) {
  const { store, placeholder = "Select date...", ...rest } = props;
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
        return d.date || placeholder;
      }),
    ],
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Clear(
  props: ViewProps & { store: DatePickerCore },
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
    store: DatePickerCore;
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: DatePickerCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren | (() => ViewChildren),
) {
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.$presence.state);
  let _was_exiting = false;

  store.$presence.onStateChange((v) => {
    presence_.as(v);
  });

  return Presence({ store: store.$presence }, () => [
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
            typeof children === "function" ? children() : children,
          ),
        ],
      ),
    ]),
  ]);
}

export function Calendar(
  props: ViewProps & { store: DatePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

export function CalendarHeader(
  props: ViewProps & { store: DatePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.$calendar.state);

  store.$calendar.onChange((v) => {
    state.as(v);
  });

  return View(
    rest,
    children || [
      View({ as: "span" }, [
        computed(state, (d) => `${d.year.text}年${d.month.text}`),
      ]),
    ],
  );
}

export function CalendarPrevButton(
  props: ButtonProps & { store: DatePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.prevMonth();
      },
    },
    children,
  );
}

export function CalendarNextButton(
  props: ButtonProps & { store: DatePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.nextMonth();
      },
    },
    children,
  );
}

export function CalendarGrid(
  props: ViewProps & { store: DatePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

export function CalendarGridHeader(
  props: ViewProps & { store: DatePickerCore },
  children?: ViewChildren,
) {
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return View(
    props,
    children || weekDays.map((day) => View({ as: "span" }, [day])),
  );
}

export function CalendarGridBody(
  props: ViewProps & {
    store: DatePickerCore;
    renderCell?: (cell: {
      text: string;
      value: Date;
      is_today: boolean;
      is_prev_month: boolean;
      is_next_month: boolean;
    }) => TimelessElement | null;
  },
  children?: ViewChildren,
) {
  const { store, renderCell, ...rest } = props;
  const state = refobj(store.$calendar.state);

  store.$calendar.onChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  return View(rest, [
    For({
      each: computed(state, (s) => s.weeks),
      render(week) {
        return View({}, [
          For({
            each: week.dates,
            render(day) {
              if (renderCell) {
                return renderCell(day);
              }
              return CalendarCell(
                {
                  store,
                  value: day.value,
                  isToday: day.is_today,
                  isPrevMonth: day.is_prev_month,
                  isNextMonth: day.is_next_month,
                },
                [day.text],
              );
            },
          }),
        ]);
      },
    }),
  ]);
}

export function CalendarCell(
  props: ButtonProps & {
    store: DatePickerCore;
    value: Date;
    isToday?: boolean;
    isPrevMonth?: boolean;
    isNextMonth?: boolean;
  },
  children: ViewChildren,
) {
  const { store, value, isToday, isPrevMonth, isNextMonth, ...rest } = props;

  return Button(
    {
      ...rest,
      dataset: {
        today: isToday ? "" : undefined,
        "prev-month": isPrevMonth ? "" : undefined,
        "next-month": isNextMonth ? "" : undefined,
      },
      onClick() {
        store.$calendar.selectDay(value);
        store.$presence.hide();
      },
    },
    children,
  );
}
