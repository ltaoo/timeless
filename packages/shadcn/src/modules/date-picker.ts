import { combine, computed, ref, refobj } from "@timeless/reactive";
import { DatePickerPrimitive, For, Show, View, ViewProps } from "@timeless/timeless";
import { DatePickerCore } from "@timeless/ui";
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CircleXOutlined,
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

  const allowClear = computed(state_, (d) => d.allowClear || false);
  const hasValue = computed(state_, (d) => d.value != null);
  const hovering = ref(false);
  const showClear = combine(
    { hovering, allowClear, hasValue },
    (t) => t.hovering && t.allowClear && t.hasValue,
  );

  return DatePickerPrimitive.Root({ store }, [
    DatePickerPrimitive.Trigger(
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
        onMouseEnter() {
          hovering.as(true);
        },
        onMouseLeave() {
          hovering.as(false);
        },
      },
      [
        DatePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-foreground"
              : "text-muted-foreground";
          }),
        }),
        Show(
          {
            when: showClear,
            fallback: [
              DatePickerPrimitive.Icon(
                { class: "size-4 text-muted-foreground" },
                [CalendarOutlined({})],
              ),
            ],
          },
          [
            DatePickerPrimitive.Clear(
              {
                store,
                class:
                  "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
              },
              [CircleXOutlined({ class: "size-4" })],
            ),
          ],
        ),
      ],
    ),
    DatePickerPrimitive.Content(
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
        View({ class: "w-[280px] p-3" }, [
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
                      "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  },
                  [ChevronLeftOutlined({ class: "size-4" })],
                ),
                DatePickerPrimitive.CalendarHeader({
                  store,
                  class: "text-sm font-medium",
                }),
                DatePickerPrimitive.CalendarNextButton(
                  {
                    store,
                    class:
                      "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  },
                  [ChevronRightOutlined({ class: "size-4" })],
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
                        "text-center text-xs text-muted-foreground size-8 flex items-center justify-center",
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
                              const isSelected =
                                s.selectedDay?.time === day.time;
                              const baseClass =
                                "inline-flex items-center justify-center size-8 text-sm rounded-md transition-colors outline-hidden";
                              const stateClasses = [];

                              if (isSelected) {
                                stateClasses.push(
                                  "bg-primary text-primary-foreground hover:bg-primary",
                                );
                              } else if (day.is_today) {
                                stateClasses.push(
                                  "bg-accent text-accent-foreground",
                                );
                              } else if (
                                day.is_prev_month ||
                                day.is_next_month
                              ) {
                                stateClasses.push(
                                  "text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground",
                                );
                              } else {
                                stateClasses.push(
                                  "hover:bg-accent hover:text-accent-foreground",
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
        ]),
      ],
    ),
  ]);
}
