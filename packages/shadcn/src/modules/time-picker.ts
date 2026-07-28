import {
  classNames,
  combine,
  computed,
  Icon,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, View, ViewProps, Show } from "@timeless/timeless";
import {
  TimePickerPrimitive,
  ScrollViewPrimitive,
} from "@timeless/ui-primitive";
import { ScrollViewCore, TimePickerCore } from "@timeless/inner-vm";

export function TimePicker(
  props: ViewProps & {
    store: TimePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择时间", ...rest } = props;
  const state_ = refobj(store.state);
  const presence_ = refobj(store.$presence.state);

  store.onStateChange((v) => {
    state_.as(v);
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

  const empty_time_text = store.showSeconds ? "--:--:--" : "--:--";
  const item_height = 32;
  const scroll_padding_items = 2;

  const hourview$ = new ScrollViewCore({});
  const minuteview$ = new ScrollViewCore({});
  const secondview$ = new ScrollViewCore({});

  function format_temp_time(s: {
    t_hour: number | null;
    t_minute: number | null;
    t_second: number | null;
  }) {
    if (s.t_hour == null || s.t_minute == null) {
      return empty_time_text;
    }
    if (store.showSeconds && s.t_second == null) {
      return empty_time_text;
    }
    const h = String(s.t_hour).padStart(2, "0");
    const m = String(s.t_minute).padStart(2, "0");
    if (store.showSeconds) {
      const sec = String(s.t_second).padStart(2, "0");
      return `${h}:${m}:${sec}`;
    }
    return `${h}:${m}`;
  }

  function scroll_to_index(view$: ScrollViewCore, index: number) {
    const safeIndex = index >= 0 ? index : 0;
    const top = Math.max(0, (safeIndex - scroll_padding_items) * item_height);
    view$.setScrollTop(top);
  }

  return TimePickerPrimitive.Root({ store }, [
    TimePickerPrimitive.Trigger(
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
        TimePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-foreground"
              : "text-muted-foreground";
          }),
        }),
        Show({
          when: showClear,
          ok() {
            return [
              TimePickerPrimitive.Clear(
                {
                  store,
                  class:
                    "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                },
                [Icon({ name: "circle-x", size: 16 })],
              ),
            ];
          },
          else() {
            return [
              TimePickerPrimitive.Icon(
                { class: "size-4 text-muted-foreground" },
                [Icon({ name: "clock", size: 16 })],
              ),
            ];
          },
        }),
      ],
    ),
    TimePickerPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        store,
        class:
          "cn-menu-target cn-menu-translucent w-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
      },
      () => [
        View({ class: "flex flex-col" }, [
          View(
            {
              class: "pt-3 px-3 flex items-center text-sm font-medium mb-2",
            },
            [
              View(
                {
                  class: classNames([
                    "h-[28px] text-center",
                    store.showSeconds ? "w-30" : "w-18",
                  ]),
                  style: { "line-height": "28px" },
                },
                [
                  combine({ time: state_ }, (t) => {
                    return `${format_temp_time({
                      t_hour: t.time.tempHour,
                      t_minute: t.time.tempMinute,
                      t_second: t.time.tempSecond,
                    })}`;
                  }),
                ],
              ),
            ],
          ),
          View(
            {
              class: classNames([
                "grid h-48",
                store.showSeconds ? "grid-cols-3 w-36" : "grid-cols-2 w-24",
              ]),
            },
            [
              ScrollViewPrimitive.Root(
                {
                  store: hourview$,
                  class:
                    "min-w-12 w-full h-full border-r border-border overflow-y-auto overlay-scrollbar p-2",
                  onMounted() {
                    const hours = store.generateHours();
                    const target = store.state.tempHour;
                    const index =
                      typeof target === "number" ? hours.indexOf(target) : -1;
                    setTimeout(() => {
                      if (index !== -1) {
                        scroll_to_index(hourview$, index);
                      }
                    }, 0);
                  },
                },
                [
                  For({
                    each: store.generateHours(),
                    render(hour) {
                      return TimePickerPrimitive.HourItem(
                        {
                          store,
                          value: hour,
                          class: classNames([
                            "w-full h-8 text-sm rounded-md transition-colors outline-hidden",
                            computed(state_, (s) => {
                              const isSelected = s.tempHour === hour;
                              if (isSelected) {
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
              ScrollViewPrimitive.Root(
                {
                  store: minuteview$,
                  class: classNames([
                    "min-w-12 w-full h-full overflow-y-auto overlay-scrollbar p-2",
                    store.showSeconds ? "border-border border-r" : "",
                  ]),
                  onMounted() {
                    const minutes = store.generateMinutes();
                    const target = store.state.tempMinute;
                    const index =
                      typeof target === "number" ? minutes.indexOf(target) : -1;
                    setTimeout(() => {
                      if (index !== -1) {
                        scroll_to_index(minuteview$, index);
                      }
                    }, 0);
                  },
                },
                [
                  For({
                    each: store.generateMinutes(),
                    render(minute) {
                      return TimePickerPrimitive.MinuteItem(
                        {
                          store,
                          value: minute,
                          class: computed(state_, (s) => {
                            const isSelected = s.tempMinute === minute;
                            const baseClass =
                              "w-full h-8 text-sm rounded-md transition-colors outline-hidden";
                            if (isSelected) {
                              return `${baseClass} bg-primary text-primary-foreground`;
                            }
                            return `${baseClass} hover:bg-accent hover:text-accent-foreground`;
                          }),
                        },
                        [String(minute).padStart(2, "0")],
                      );
                    },
                  }),
                ],
              ),
              Show({
                when: store.showSeconds,
                ok() {
                  return [
                    ScrollViewPrimitive.Root(
                      {
                        store: secondview$,
                        class:
                          "min-w-12 w-full h-full overflow-y-auto overlay-scrollbar p-2",
                        onMounted() {
                          const seconds = store.generateSeconds();
                          const target = store.state.tempSecond;
                          const index =
                            typeof target === "number"
                              ? seconds.indexOf(target)
                              : -1;
                          setTimeout(() => {
                            if (index !== -1) {
                              scroll_to_index(secondview$, index);
                            }
                          }, 0);
                        },
                      },
                      [
                        For({
                          each: store.generateSeconds(),
                          render(second) {
                            return TimePickerPrimitive.SecondItem(
                              {
                                store,
                                value: second,
                                class: classNames([
                                  "w-full h-8 text-sm rounded-md transition-colors outline-hidden",
                                  computed(state_, (s) => {
                                    const isSelected = s.tempSecond === second;
                                    if (isSelected) {
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
          View(
            {
              class: "flex justify-end gap-2 border-t border-border p-3",
            },
            [
              TimePickerPrimitive.ClearButton(
                {
                  store,
                  class:
                    "px-3 py-1 text-sm rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                },
                ["清除"],
              ),
              TimePickerPrimitive.ConfirmButton(
                {
                  store,
                  class:
                    "px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                },
                ["确定"],
              ),
            ],
          ),
        ]),
      ],
    ),
  ]);
}
