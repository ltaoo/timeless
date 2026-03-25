// @ts-nocheck
import { computed, refobj } from "@timeless/reactive";
import {
  DateRangePickerPrimitive,
  For,
  View,
  ViewProps,
  Show,
} from "@timeless/headless";
import { DateRangePickerCore, TooltipCore } from "@timeless/ui";
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@timeless/icons";
import { Tooltip } from "./tooltip";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

const NAV_BTN_CLASS =
  "inline-flex items-center justify-center h-7 w-7 rounded-md border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800";

const NAV_BTN_DISABLED_CLASS =
  "inline-flex items-center justify-center h-7 w-7 rounded-md border border-zinc-100 bg-transparent text-zinc-300 cursor-not-allowed dark:border-zinc-800 dark:text-zinc-600";

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
      Show(
        {
          when: computed(calendar_state_, (s) => !s.canLeftNext),
        },
        [
          Tooltip(
            {
              store: tooltip$,
              content: ["不能超过右侧面板"],
            },
            [View({ class: NAV_BTN_DISABLED_CLASS }, children)],
          ),
        ],
      ),
      Show(
        {
          when: computed(calendar_state_, (s) => s.canLeftNext),
        },
        [ButtonComponent({ store, class: NAV_BTN_CLASS }, children)],
      ),
    ]);
  }

  if (type === "rightPrev") {
    const tooltip$ = new TooltipCore({ side: "top" });
    return View({}, [
      Show(
        {
          when: computed(calendar_state_, (s) => !s.canRightPrev),
        },
        [
          Tooltip(
            {
              store: tooltip$,
              content: ["不能早于左侧面板"],
            },
            [View({ class: NAV_BTN_DISABLED_CLASS }, children)],
          ),
        ],
      ),
      Show(
        {
          when: computed(calendar_state_, (s) => s.canRightPrev),
        },
        [ButtonComponent({ store, class: NAV_BTN_CLASS }, children)],
      ),
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

  return View({ class: "w-[280px]" }, [
    // Header
    View({ class: "flex items-center justify-between mb-2" }, [
      NavButton({
        store,
        calendar_state_,
        type: side === "left" ? "leftPrev" : "rightPrev",
        children: [ChevronLeftOutlined({ class: "h-4 w-4" })],
      }),
      Header({ store, class: "text-sm font-medium" }),
      NavButton({
        store,
        calendar_state_,
        type: side === "left" ? "leftNext" : "rightNext",
        children: [ChevronRightOutlined({ class: "h-4 w-4" })],
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
                "text-center text-xs text-zinc-500 dark:text-zinc-400 w-9 h-8 flex items-center justify-center",
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
                    class: computed(calendar_state_, () => {
                      const isInRange = store.$calendar.isInRange(day.value);
                      const isRangeStart = store.$calendar.isRangeStart(
                        day.value,
                      );
                      const isRangeEnd = store.$calendar.isRangeEnd(day.value);

                      const baseClass =
                        "inline-flex items-center justify-center w-9 h-8 text-sm transition-colors focus:outline-none";
                      const clas: string[] = [];

                      if (isRangeStart || isRangeEnd) {
                        clas.push(
                          "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
                        );
                        if (isRangeStart && !isRangeEnd) {
                          clas.push("rounded-l-md rounded-r-none");
                        } else if (isRangeEnd && !isRangeStart) {
                          clas.push("rounded-r-md rounded-l-none");
                        } else {
                          clas.push("rounded-md");
                        }
                      } else if (isInRange) {
                        clas.push(
                          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 rounded-none",
                        );
                      } else if (day.is_today) {
                        clas.push(
                          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 rounded-md",
                        );
                      } else if (day.is_prev_month || day.is_next_month) {
                        clas.push(
                          "text-zinc-400 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-800 rounded-md",
                        );
                      } else {
                        clas.push(
                          "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800 rounded-md",
                        );
                      }

                      return [baseClass, ...clas].join(" ");
                    }),
                  },
                  [day.text],
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
            "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300";
          const focusedClass = d.visible
            ? "border-zinc-950 bg-zinc-50 dark:border-zinc-300 dark:bg-zinc-900"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
          return `${baseClass} ${focusedClass}`;
        }),
      },
      [
        DateRangePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400";
          }),
        }),
        DateRangePickerPrimitive.Icon({ class: "h-4 w-4 opacity-50" }, [
          CalendarOutlined({}),
        ]),
      ],
    ),
    DateRangePickerPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95",
          out: "animate-out fade-out-0 zoom-out-95",
        },
        store,
        class:
          "z-50 p-4 rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      },
      [
        DateRangePickerPrimitive.Calendars({ store, class: "flex gap-4" }, [
          CalendarPanel({ store, side: "left", calendar_state_ }),
          // 分隔线
          View({
            class: "w-px bg-zinc-200 dark:bg-zinc-800 self-stretch my-2",
          }),
          CalendarPanel({ store, side: "right", calendar_state_ }),
        ]),
      ],
    ),
  ]);
}
