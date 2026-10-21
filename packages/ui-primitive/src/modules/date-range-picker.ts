import { refobj, computed } from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Portal as NativePortal,
  Popover,
  Show,
  For,
  Button,
  ButtonProps,
  classNames,
  Input as PrimitiveInput,
} from "../core";
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
  const state = refobj(store.$presence.state);
  return Button(
    {
      ...rest,
      attributes: {
        ...rest.attributes,
        role: "combobox",
        "aria-haspopup": "dialog",
        "aria-expanded": computed(
          state,
          (value) => value.visible && !value.exit,
        ),
      },
      onClick(event) {
        rest.onClick?.(event);
        if (event.defaultPrevented) return;
        if (store.$presence.state.visible) store.$presence.hide();
        else store.$presence.show();
      },
      onKeyDown(event) {
        rest.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          store.$presence.show();
        }
        if (event.key === "Escape") store.$presence.hide();
      },
      onMounted(event) {
        const target = event.target;
        store.$popper.setReference(
          { $el: target.get$elm(), getRect: () => target.getBoundingClientRect() },
          { force: true },
        );
        const stop = store.$presence.onStateChange((value) => state.as(value));
        const cleanup = rest.onMounted?.(event);
        return () => {
          stop();
          cleanup?.();
        };
      },
    },
    children,
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

  return View({ class: "tt-content-inline", ...rest }, [
    computed(state, (d) => {
      return d.dateText || placeholder;
    }),
  ]);
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
  const state = refobj(store.$presence.state);
  const stop = store.$presence.onStateChange((value) => state.as(value));
  return Show({
    when: computed(state, (value) => value.visible && !value.exit),
    onUnmounted: stop,
    ok: () =>
      Popover(
        {
          ...rest,
          open: true,
          anchor: () => store.$popper.reference?.$el,
          onClose: () => store.$presence.hide(),
        },
        typeof children === "function" ? children() : children,
      ),
  });
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
      View({ class: "tt-content-inline" }, [
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
      View({ class: "tt-content-inline" }, [
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
    children ||
      weekDays.map((day) => View({ class: "tt-content-inline" }, [day])),
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
      attributes: {
        ...rest.attributes,
        "data-date": `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`,
        "aria-label": value.toLocaleDateString(),
      },
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
