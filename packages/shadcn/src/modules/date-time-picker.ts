import { ui, vm } from "@timeless/timeless";
import {
  Button,
  classNames,
  combine,
  computed,
  Icon,
  ListenerManager,
  refobj,
} from "@timeless/timeless";
import { For, View, ViewProps, Show } from "@timeless/timeless";

export function DateTimePicker(
  props: ViewProps & {
    date: vm.DatePickerCore;
    time: vm.TimePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const {
    date: date$,
    time: time$,
    id,
    placeholder = "选择日期时间",
    ...rest
  } = props;
  const date_state_ = refobj(date$.state);
  const calendar_state_ = refobj(date$.$calendar.state);
  const time_state_ = refobj(time$.state);
  const presence_ = refobj(date$.$presence.state);

  const has_date_ = computed(date_state_, (d) => d.value != null);
  const has_time_ = computed(time_state_, (d) => d.value != null);
  // const time_headers = time$.showSeconds ? ["时", "分", "秒"] : ["时", "分"];
  const empty_time_text = time$.showSeconds ? "--:--:--" : "--:--";
  const item_height = 32;
  const scroll_padding_items = 2;
  let didInitDefaultTimeForThisOpen = false;

  const listener$ = ListenerManager([
    date_state_,
    calendar_state_,
    time_state_,
    presence_,
    has_date_,
    has_time_,
  ]);

  const picker_ui = {
    hourview$: new vm.ScrollViewCore({}),
    minuteview$: new vm.ScrollViewCore({}),
    secondview$: new vm.ScrollViewCore({}),
  };
  const methods = {
    pick_closest_not_greater(sorted: number[], target: number) {
      if (sorted.length === 0) return target;
      let best = sorted[0];
      for (const v of sorted) {
        if (v <= target) {
          best = v;
          continue;
        }
        break;
      }
      return best;
    },

    ensure_default_temp_time() {
      if (didInitDefaultTimeForThisOpen) return;
      didInitDefaultTimeForThisOpen = true;

      if (time$.value != null) return;

      const s = time$.state;
      const isTempReady =
        s.tempHour != null &&
        s.tempMinute != null &&
        (!time$.showSeconds || s.tempSecond != null);
      if (isTempReady) return;

      const now = new Date();
      const hours = time$.generateHours();
      const minutes = time$.generateMinutes();
      const seconds = time$.generateSeconds();

      const nowHour = now.getHours();
      const hourCandidate = time$.use12Hours
        ? nowHour % 12 === 0
          ? 12
          : nowHour % 12
        : nowHour;
      const hour = methods.pick_closest_not_greater(hours, hourCandidate);
      const minute = methods.pick_closest_not_greater(
        minutes,
        now.getMinutes(),
      );
      const second = methods.pick_closest_not_greater(
        seconds,
        now.getSeconds(),
      );

      time$.selectHour(hour);
      time$.selectMinute(minute);
      if (time$.showSeconds) {
        time$.selectSecond(second);
      }
    },

    format_temp_time(s: {
      t_hour: number | null;
      t_minute: number | null;
      t_second: number | null;
    }) {
      if (s.t_hour == null || s.t_minute == null) {
        return empty_time_text;
      }
      if (time$.showSeconds && s.t_second == null) {
        return empty_time_text;
      }
      const h = String(s.t_hour).padStart(2, "0");
      const m = String(s.t_minute).padStart(2, "0");
      if (time$.showSeconds) {
        const sec = String(s.t_second).padStart(2, "0");
        return `${h}:${m}:${sec}`;
      }
      return `${h}:${m}`;
    },
    scroll_to_index(view$: vm.ScrollViewCore, index: number) {
      const safeIndex = index >= 0 ? index : 0;
      const top = Math.max(0, (safeIndex - scroll_padding_items) * item_height);
      view$.setScrollTop(top);
    },
  };

  return ui.DatePickerPrimitive.Root(
    {
      store: date$,
      onMounted() {
        listener$.append([
          date$.onStateChange((v) => {
            date_state_.as(v);
          }),
          date$.$calendar.onChange((v) => {
            calendar_state_.as(v);
          }),
          date$.$presence.onStateChange((v) => {
            presence_.as(v);
            if (v.visible) {
              didInitDefaultTimeForThisOpen = false;
            }
          }),
          time$.onStateChange((v) => {
            time_state_.as(v);
          }),
        ]);
        return listener$.destroy;
      },
    },
    [
      ui.DatePickerPrimitive.Trigger(
        {
          store: date$,
          id,
          class: classNames([
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            computed(presence_, (d) => {
              return d.visible
                ? "border-ring ring-3 ring-ring/50"
                : "dark:hover:bg-input/50";
            }),
          ]),
        },
        [
          View(
            {
              as: "span",
              class: combine(
                { hasDate: has_date_, hasTime: has_time_ },
                (t) => {
                  return t.hasDate && t.hasTime
                    ? "text-foreground"
                    : "text-muted-foreground";
                },
              ),
            },
            [
              combine({ date: date_state_, time: time_state_ }, (t) => {
                const dv = t.date.value;
                const tv = t.time.value;
                if (dv != null && tv != null) {
                  return `${t.date.date} ${t.time.time}`;
                }
                return placeholder;
              }),
            ],
          ),
          ui.DatePickerPrimitive.Icon(
            { class: "size-4 text-muted-foreground" },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DatePickerPrimitive.Content(
        {
          ...rest,
          animation: {
            in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
          },
          store: date$,
          class:
            "cn-menu-target cn-menu-translucent w-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
        },
        () => [
          View({ class: "" }, [
            View({ class: "grid grid-cols-[280px_auto] items-start gap-0" }, [
              View({ class: "w-[280px] p-3 border-r border-border" }, [
                ui.DatePickerPrimitive.Calendar(
                  { store: date$, class: "w-full" },
                  [
                    View(
                      {
                        class: "flex items-center justify-between mb-2",
                      },
                      [
                        ui.DatePickerPrimitive.CalendarPrevButton(
                          {
                            store: date$,
                            class:
                              "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          },
                          [Icon({ name: "chevron-left", size: 16 })],
                        ),
                        ui.DatePickerPrimitive.CalendarHeader({
                          store: date$,
                          class: "text-sm font-medium",
                        }),
                        ui.DatePickerPrimitive.CalendarNextButton(
                          {
                            store: date$,
                            class:
                              "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          },
                          [Icon({ name: "chevron-right", size: 16 })],
                        ),
                      ],
                    ),
                    ui.DatePickerPrimitive.CalendarGrid(
                      { store: date$, class: "w-full" },
                      [
                        View({ class: "grid grid-cols-7 mb-1" }, [
                          For({
                            each: ["一", "二", "三", "四", "五", "六", "日"],
                            render(day) {
                              return View(
                                {
                                  as: "span",
                                  class:
                                    "text-center text-xs text-muted-foreground size-8 flex items-center justify-center",
                                },
                                [day],
                              );
                            },
                          }),
                        ]),
                        For({
                          each: computed(
                            calendar_state_,
                            (s) => s.weeks,
                          ) as any,
                          render(week: any) {
                            return View({ class: "grid grid-cols-7" }, [
                              For({
                                each: computed(
                                  week,
                                  (t: any) => t.dates,
                                ) as any,
                                render(day: any) {
                                  return ui.DatePickerPrimitive.CalendarCell(
                                    {
                                      store: date$,
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
                                        return [
                                          baseClass,
                                          ...stateClasses,
                                        ].join(" ");
                                      }),
                                    },
                                    [day.text],
                                  );
                                },
                              }),
                            ]);
                          },
                        }),
                      ],
                    ),
                  ],
                ),
              ]),
              View({ class: "flex flex-col h-full" }, [
                View(
                  {
                    class:
                      "pt-3 px-3 flex items-center text-sm font-medium mb-2",
                  },
                  [
                    View(
                      {
                        class: classNames([
                          "h-[28px] text-center",
                          time$.showSeconds ? "w-30" : "w-18",
                        ]),
                        style: { "line-height": "28px" },
                      },
                      [
                        computed(time_state_, (t) => {
                          return `${methods.format_temp_time({
                            t_hour: t.tempHour,
                            t_minute: t.tempMinute,
                            t_second: t.tempSecond,
                          })}`;
                        }),
                      ],
                    ),
                  ],
                ),
                View(
                  {
                    class: classNames(["relative flex flex-1 h-0"]),
                  },
                  [
                    ui.ScrollViewPrimitive.Root(
                      {
                        store: picker_ui.hourview$,
                        class:
                          "absolute top-0 left-0 w-12 h-full border-r border-border overflow-y-auto overlay-scrollbar p-2",
                        onMounted() {
                          methods.ensure_default_temp_time();
                          const hours = time$.generateHours();
                          const target = time$.state.tempHour;
                          const index =
                            typeof target === "number"
                              ? hours.indexOf(target)
                              : -1;
                          setTimeout(() => {
                            if (index !== -1) {
                              methods.scroll_to_index(
                                picker_ui.hourview$,
                                index,
                              );
                            }
                          }, 0);
                        },
                      },
                      [
                        For({
                          each: time$.generateHours(),
                          render(hour) {
                            return ui.TimePickerPrimitive.HourItem(
                              {
                                store: time$,
                                value: hour,
                                class: classNames([
                                  "w-full h-8 text-sm rounded-md transition-colors outline-hidden",
                                  computed(time_state_, (s) => {
                                    const is_selected = s.tempHour === hour;
                                    if (is_selected) {
                                      return `bg-primary text-primary-foreground`;
                                    }
                                    return `hover:bg-accent hover:text-accent-foreground`;
                                  }),
                                ]),
                              },
                              [String(hour).padStart(2, "0")],
                            );
                          },
                        }),
                      ],
                    ),
                    ui.ScrollViewPrimitive.Root(
                      {
                        store: picker_ui.minuteview$,
                        class: classNames([
                          "absolute top-0 left-12 w-12 h-full overflow-y-auto overlay-scrollbar p-2",
                          time$.showSeconds ? "border-border border-r" : "",
                        ]),
                        onMounted() {
                          methods.ensure_default_temp_time();
                          const minutes = time$.generateMinutes();
                          const target = time$.state.tempMinute;
                          const index =
                            typeof target === "number"
                              ? minutes.indexOf(target)
                              : -1;
                          setTimeout(() => {
                            if (index !== -1) {
                              methods.scroll_to_index(
                                picker_ui.minuteview$,
                                index,
                              );
                            }
                          }, 0);
                        },
                      },
                      [
                        For({
                          each: time$.generateMinutes(),
                          render(minute) {
                            return ui.TimePickerPrimitive.MinuteItem(
                              {
                                store: time$,
                                value: minute,
                                class: classNames([
                                  "w-full h-8 text-sm rounded-md transition-colors outline-hidden",
                                  computed(time_state_, (s) => {
                                    const is_selected = s.tempMinute === minute;
                                    if (is_selected) {
                                      return `bg-primary text-primary-foreground`;
                                    }
                                    return `hover:bg-accent hover:text-accent-foreground`;
                                  }),
                                ]),
                              },
                              [String(minute).padStart(2, "0")],
                            );
                          },
                        }),
                      ],
                    ),
                    Show({
                      when: time$.showSeconds,
                      ok() {
                        return [
                          ui.ScrollViewPrimitive.Root(
                            {
                              store: picker_ui.secondview$,
                              class:
                                "absolute top-0 left-24 w-12 h-full overflow-y-auto overlay-scrollbar p-2",
                              onMounted() {
                                methods.ensure_default_temp_time();
                                const seconds = time$.generateSeconds();
                                const target = time$.state.tempSecond;
                                const index =
                                  typeof target === "number"
                                    ? seconds.indexOf(target)
                                    : -1;
                                setTimeout(() => {
                                  if (index !== -1) {
                                    methods.scroll_to_index(
                                      picker_ui.secondview$,
                                      index,
                                    );
                                  }
                                }, 0);
                              },
                            },
                            [
                              For({
                                each: time$.generateSeconds(),
                                render(second) {
                                  return ui.TimePickerPrimitive.SecondItem(
                                    {
                                      store: time$,
                                      value: second,
                                      class: classNames([
                                        "w-full h-8 text-sm rounded-md transition-colors outline-hidden",
                                        computed(time_state_, (s) => {
                                          const is_selected =
                                            s.tempSecond === second;
                                          if (is_selected) {
                                            return `bg-primary text-primary-foreground`;
                                          }
                                          return `hover:bg-accent hover:text-accent-foreground`;
                                        }),
                                      ]),
                                    },
                                    [String(second).padStart(2, "0")],
                                  );
                                },
                              }),
                            ],
                          ),
                        ];
                      },
                    }),
                  ],
                ),
              ]),
            ]),
            View(
              { class: "flex justify-end gap-2 border-t border-border p-3" },
              [
                Button(
                  {
                    class:
                      "px-3 py-1 text-sm rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                    onClick() {
                      time$.clear();
                    },
                  },
                  ["清除"],
                ),
                Button(
                  {
                    class:
                      "px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                    onClick() {
                      time$.confirm();
                      date$.$presence.hide();
                    },
                  },
                  ["确定"],
                ),
              ],
            ),
          ]),
        ],
      ),
    ],
  );
}
