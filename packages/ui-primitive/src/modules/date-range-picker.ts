import { refobj, computed } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Portal as NativePortal,
  For,
  Button,
  ButtonProps,
  classNames,
} from "@timeless/timeless";
import { DateRangePickerCore } from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DateRangePickerCore },
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
  props: ViewProps & { store: DateRangePickerCore; id?: string },
  children: ViewChildren = [],
) {
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
  props: ViewProps & { store: DateRangePickerCore; placeholder?: string },
  children?: ViewChildren,
) {
  const { store, placeholder = "Select date range...", ...rest } = props;
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
        return d.dateText || placeholder;
      }),
    ],
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Portal(
  props: ViewProps & {
    store: DateRangePickerCore;
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: DateRangePickerCore;
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

// 双日历容器
export function Calendars(
  props: ViewProps & { store: DateRangePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

// 左侧日历面板
export function LeftCalendar(
  props: ViewProps & { store: DateRangePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

// 右侧日历面板
export function RightCalendar(
  props: ViewProps & { store: DateRangePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

// 左侧日历头部
export function LeftCalendarHeader(
  props: ViewProps & { store: DateRangePickerCore },
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
        computed(state, (d) => `${d.left.year.text}年${d.left.month.text}`),
      ]),
    ],
  );
}

// 右侧日历头部
export function RightCalendarHeader(
  props: ViewProps & { store: DateRangePickerCore },
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
        computed(state, (d) => `${d.right.year.text}年${d.right.month.text}`),
      ]),
    ],
  );
}

// 左侧上一月按钮
export function LeftPrevButton(
  props: ButtonProps & { store: DateRangePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.leftPrevMonth();
      },
    },
    children,
  );
}

// 左侧下一月按钮
export function LeftNextButton(
  props: ButtonProps & { store: DateRangePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.leftNextMonth();
      },
    },
    children,
  );
}

// 右侧上一月按钮
export function RightPrevButton(
  props: ButtonProps & { store: DateRangePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.rightPrevMonth();
      },
    },
    children,
  );
}

// 右侧下一月按钮
export function RightNextButton(
  props: ButtonProps & { store: DateRangePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick() {
        store.$calendar.rightNextMonth();
      },
    },
    children,
  );
}

export function CalendarGrid(
  props: ViewProps & { store: DateRangePickerCore },
  children: ViewChildren,
) {
  return View(props, children);
}

export function CalendarGridHeader(
  props: ViewProps & { store: DateRangePickerCore },
  children?: ViewChildren,
) {
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return View(
    props,
    children || weekDays.map((day) => View({ as: "span" }, [day])),
  );
}

// 左侧日历网格内容
export function LeftCalendarGridBody(
  props: ViewProps & {
    store: DateRangePickerCore;
  },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.$calendar.state);

  store.$calendar.onChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  return View(rest, [
    For({
      each: computed(state, (s) => s.left.weeks),
      render(week) {
        return View({}, [
          For({
            each: week.dates,
            render(day) {
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

// 右侧日历网格内容
export function RightCalendarGridBody(
  props: ViewProps & {
    store: DateRangePickerCore;
  },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.$calendar.state);

  store.$calendar.onChange((v) => {
    state.as(v);
  });

  if (children) {
    return View(rest, children);
  }

  return View(rest, [
    For({
      each: computed(state, (s) => s.right.weeks),
      render(week) {
        return View({}, [
          For({
            each: week.dates,
            render(day) {
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
    store: DateRangePickerCore;
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
      onClick() {
        store.$calendar.selectDay(value);
        // 只有当范围选择完成后才关闭
        if (store.$calendar.value) {
          store.$presence.hide();
        }
      },
      onMouseEnter() {
        store.$calendar.hoverDay(value);
      },
      onMouseLeave() {
        store.$calendar.clearHover();
      },
    },
    children,
  );
}
