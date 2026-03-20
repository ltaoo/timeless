import { computed, refobj } from "@timeless/reactive";
import {
  DatePickerPrimitive,
  For,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { DatePickerCore } from "@timeless/ui";
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@timeless/icons";

export function DatePicker(
  props: ViewProps & {
    store: DatePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期", ...rest } = props;
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

  return DatePickerPrimitive.Root({ store }, [
    DatePickerPrimitive.Trigger(
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
        DatePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400";
          }),
        }),
        DatePickerPrimitive.Icon({ class: "h-4 w-4 opacity-50" }, [
          CalendarOutlined({}),
        ]),
      ],
    ),
    DatePickerPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95",
          out: "animate-out fade-out-0 zoom-out-95",
        },
        store,
        class:
          "z-50 w-auto p-3 rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      },
      [
        DatePickerPrimitive.Calendar({ store, class: "w-full" }, [
          // Calendar Header
          View(
            {
              class: "flex items-center justify-between mb-2",
            },
            [
              DatePickerPrimitive.CalendarPrevButton(
                {
                  store,
                  class:
                    "inline-flex items-center justify-center h-7 w-7 rounded-md border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800",
                },
                [ChevronLeftOutlined({ class: "h-4 w-4" })],
              ),
              DatePickerPrimitive.CalendarHeader({
                store,
                class: "text-sm font-medium",
              }),
              DatePickerPrimitive.CalendarNextButton(
                {
                  store,
                  class:
                    "inline-flex items-center justify-center h-7 w-7 rounded-md border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800",
                },
                [ChevronRightOutlined({ class: "h-4 w-4" })],
              ),
            ],
          ),
          // Calendar Grid
          DatePickerPrimitive.CalendarGrid({ store, class: "w-full" }, [
            // Weekday Headers
            View({ class: "grid grid-cols-7 mb-1" }, [
              ...["一", "二", "三", "四", "五", "六", "日"].map((day) =>
                View(
                  {
                    as: "span",
                    class:
                      "text-center text-xs text-zinc-500 dark:text-zinc-400 w-8 h-8 flex items-center justify-center",
                  },
                  [day],
                ),
              ),
            ]),
            // Calendar Body
            For({
              each: computed(calendar_state_, (s) => s.weeks),
              render(week) {
                return View({ class: "grid grid-cols-7" }, [
                  For({
                    each: computed(week, (t) => t.dates),
                    render(day) {
                      return DatePickerPrimitive.CalendarCell(
                        {
                          store,
                          value: day.value,
                          isToday: day.is_today,
                          isPrevMonth: day.is_prev_month,
                          isNextMonth: day.is_next_month,
                          class: computed(calendar_state_, (s) => {
                            const isSelected = s.selectedDay?.time === day.time;
                            const baseClass =
                              "inline-flex items-center justify-center w-8 h-8 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300";
                            const stateClasses = [];

                            if (isSelected) {
                              stateClasses.push(
                                "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50",
                              );
                            } else if (day.is_today) {
                              stateClasses.push(
                                "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
                              );
                            } else if (day.is_prev_month || day.is_next_month) {
                              stateClasses.push(
                                "text-zinc-400 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-800",
                              );
                            } else {
                              stateClasses.push(
                                "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800",
                              );
                            }

                            return [baseClass, ...stateClasses].join(" ");
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
        ]),
      ],
    ),
  ]);
}
