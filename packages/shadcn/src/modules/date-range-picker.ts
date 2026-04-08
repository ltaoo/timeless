// @ts-nocheck
import { computed, refobj } from "@timeless/timeless";
import {
  DateRangePickerPrimitive,
  For,
  View,
  ViewProps,
  Show,
  h,
} from "@timeless/timeless";
import { DateRangePickerCore, TooltipCore } from "@timeless/ui";
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@timeless/icons";
import { Tooltip } from "./tooltip";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

const NAV_BTN_CLASS =
  "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

const NAV_BTN_DISABLED_CLASS =
  "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground/40 cursor-not-allowed";

function NavButton(props: {
  store: DateRangePickerCore;
  calendar_state_: ReturnType<typeof refobj>;
  type: "leftPrev" | "leftNext" | "rightPrev" | "rightNext";
  children: any[];
}) {
  const { store, calendar_state_, type, children } = props;

  const ButtonComponent = {
    leftPrev: DateRangePickerPrimitive.LeftPrevButton,
    leftNext: DateRangePickerPrimitive.LeftNextButton,
    rightPrev: DateRangePickerPrimitive.RightPrevButton,
    rightNext: DateRangePickerPrimitive.RightNextButton,
  }[type];

  // 左面板下一月和右面板上一月有限制
  if (type === "leftNext") {
    const tooltip$ = new TooltipCore({ side: "top" });
    return View({}, [
      Show({
        when: computed(calendar_state_, (s) => !s.canLeftNext),
        ok() {
          return [
            h(
              Tooltip,
              {
                store: tooltip$,
                content: ["不能超过右侧面板"],
              },
              [h(View, { class: NAV_BTN_DISABLED_CLASS }, children)],
            ),
          ];
        },
      }),
      Show({
        when: computed(calendar_state_, (s) => s.canLeftNext),
        ok() {
          return [h(ButtonComponent, { store, class: NAV_BTN_CLASS }, children)];
        },
      }),
    ]);
  }

  if (type === "rightPrev") {
    const tooltip$ = new TooltipCore({ side: "top" });
    return View({}, [
      Show({
        when: computed(calendar_state_, (s) => !s.canRightPrev),
        ok() {
          return [
            h(
              Tooltip,
              {
                store: tooltip$,
                content: ["不能早于左侧面板"],
              },
              [h(View, { class: NAV_BTN_DISABLED_CLASS }, children)],
            ),
          ];
        },
      }),
      Show({
        when: computed(calendar_state_, (s) => s.canRightPrev),
        ok() {
          return [h(ButtonComponent, { store, class: NAV_BTN_CLASS }, children)];
        },
      }),
    ]);
  }

  // 左面板上一月和右面板下一月没有限制
  return ButtonComponent({ store, class: NAV_BTN_CLASS }, children);
}

function CalendarPanel(props: {
  store: DateRangePickerCore;
  side: "left" | "right";
  calendar_state_: ReturnType<typeof refobj>;
}) {
  const { store, side, calendar_state_ } = props;

  const Header =
    side === "left"
      ? DateRangePickerPrimitive.LeftCalendarHeader
      : DateRangePickerPrimitive.RightCalendarHeader;

  return View({ class: "w-full" }, [
    // Header
    View({ class: "flex items-center justify-between mb-2" }, [
      NavButton({
        store,
        calendar_state_,
        type: side === "left" ? "leftPrev" : "rightPrev",
        children: [ChevronLeftOutlined({ class: "size-4" })],
      }),
      Header({ store, class: "text-sm font-medium" }),
      NavButton({
        store,
        calendar_state_,
        type: side === "left" ? "leftNext" : "rightNext",
        children: [ChevronRightOutlined({ class: "size-4" })],
      }),
    ]),
    // Grid
    DateRangePickerPrimitive.CalendarGrid({ store, class: "w-full" }, [
      // Weekday Headers
      View(
        { class: "grid grid-cols-7 mb-1" },
        WEEKDAYS.map((day) =>
          View(
            {
              as: "span",
              class:
                "text-center text-xs text-muted-foreground w-full h-8 flex items-center justify-center",
            },
            [day],
          ),
        ),
      ),
      // Calendar Body
      For({
        each: computed(calendar_state_, (s) =>
          side === "left" ? s.left.weeks : s.right.weeks,
        ),
        /**
         * @param {{dates: {value: number; is_today: boolean; is_prev_month: boolean; is_next_month: boolean; text: string}[]}} week
         */
        render(week) {
          return View({ class: "grid grid-cols-7" }, [
            For({
              each: computed(week, (t) => t.dates),
              /**
               * @param {{value: number; is_today: boolean; is_prev_month: boolean; is_next_month: boolean; text: string}} day
               */
              render(day) {
                return DateRangePickerPrimitive.CalendarCell(
                  {
                    store,
                    value: day.value,
                    isToday: day.is_today,
                    isPrevMonth: day.is_prev_month,
                    isNextMonth: day.is_next_month,
                    class: computed(calendar_state_, (s) => {
                      const isInRange = store.$calendar.isInRange(day.value);
                      const isRangeStart = store.$calendar.isRangeStart(
                        day.value,
                      );
                      const isRangeEnd = store.$calendar.isRangeEnd(day.value);
                      const hasEnd = Boolean(s.endDate || s.hoverDate);
                      const isSingle = isRangeStart && !hasEnd;

                      const baseClass =
                        "relative w-full h-8 inline-flex items-center justify-center text-sm transition-colors outline-hidden select-none";
                      const clas: string[] = [];

                      if (isInRange) {
                        clas.push(
                          "before:content-[''] before:absolute before:inset-y-1 before:left-0 before:right-0 before:bg-accent/70",
                        );
                        if (isSingle) {
                          clas.push("before:rounded-md");
                        } else if (isRangeStart && !isRangeEnd) {
                          clas.push("before:rounded-l-md");
                        } else if (isRangeEnd && !isRangeStart) {
                          clas.push("before:rounded-r-md");
                        } else if (isRangeStart && isRangeEnd) {
                          clas.push("before:rounded-md");
                        }
                      }

                      return [baseClass, ...clas].join(" ");
                    }),
                  },
                  [
                    View(
                      {
                        as: "span",
                        class: computed(calendar_state_, (s) => {
                          const isInRange = store.$calendar.isInRange(
                            day.value,
                          );
                          const isRangeStart = store.$calendar.isRangeStart(
                            day.value,
                          );
                          const isRangeEnd = store.$calendar.isRangeEnd(
                            day.value,
                          );
                          const hasEnd = Boolean(s.endDate || s.hoverDate);
                          const isSingle = isRangeStart && !hasEnd;

                          const baseClass =
                            "relative z-10 inline-flex size-8 items-center justify-center rounded-md";
                          const clas: string[] = [];

                          if (isSingle || isRangeStart || isRangeEnd) {
                            clas.push("bg-primary text-primary-foreground");
                          } else if (isInRange) {
                            clas.push("text-accent-foreground");
                          } else if (day.is_prev_month || day.is_next_month) {
                            clas.push(
                              "text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground",
                            );
                          } else if (day.is_today) {
                            clas.push(
                              "bg-accent text-accent-foreground font-medium",
                            );
                          } else {
                            clas.push(
                              "hover:bg-accent hover:text-accent-foreground",
                            );
                          }

                          if (
                            day.is_today &&
                            !(isSingle || isRangeStart || isRangeEnd)
                          ) {
                            clas.push("ring-1 ring-ring/50");
                          }

                          return [baseClass, ...clas].join(" ");
                        }),
                      },
                      [day.text],
                    ),
                  ],
                );
              },
            }),
          ]);
        },
      }),
    ]),
  ]);
}

export function DateRangePicker(
  props: ViewProps & {
    store: DateRangePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期范围", ...rest } = props;
  const state_ = refobj(store.state);
  const calendar_state_ = refobj(store.$calendar.state);
  const presence_ = refobj(store.$presence.state);

  store.onStateChange((v) => {
    state_.as(v);
  });
  store.$calendar.onChange((v) => {
    calendar_state_.as(v);
  });
  store.$presence.onStateChange((v) => {
    presence_.as(v);
  });

  return DateRangePickerPrimitive.Root({ store }, [
    DateRangePickerPrimitive.Trigger(
      {
        store,
        id,
        class: computed(presence_, (d) => {
          const baseClass =
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
          const openClass = d.visible
            ? "border-ring ring-3 ring-ring/50"
            : "dark:hover:bg-input/50";
          return `${baseClass} ${openClass}`;
        }),
      },
      [
        DateRangePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-foreground"
              : "text-muted-foreground";
          }),
        }),
        DateRangePickerPrimitive.Icon(
          { class: "size-4 text-muted-foreground" },
          [CalendarOutlined({})],
        ),
      ],
    ),
    DateRangePickerPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        store,
        class:
          "cn-menu-target cn-menu-translucent z-50 w-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
      },
      [
        DateRangePickerPrimitive.Calendars({ store, class: "w-full" }, [
          View({ class: "grid grid-cols-[280px_280px] items-start gap-0" }, [
            View({ class: "w-[280px] p-3 border-r border-border" }, [
              CalendarPanel({ store, side: "left", calendar_state_ }),
            ]),
            View({ class: "w-[280px] p-3" }, [
              CalendarPanel({ store, side: "right", calendar_state_ }),
            ]),
          ]),
        ]),
      ],
    ),
  ]);
}
