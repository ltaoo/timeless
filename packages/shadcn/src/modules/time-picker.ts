import { computed, refobj } from "@timeless/reactive";
import {
  TimePickerPrimitive,
  For,
  View,
  ViewProps,
  Show,
} from "@timeless/headless";
import { TimePickerCore } from "@timeless/ui";
import { ClockOutlined } from "@timeless/icons";

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

  return TimePickerPrimitive.Root({ store }, [
    TimePickerPrimitive.Trigger(
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
        TimePickerPrimitive.Value({
          store,
          placeholder,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400";
          }),
        }),
        TimePickerPrimitive.Icon({ class: "h-4 w-4 opacity-50" }, [
          ClockOutlined({}),
        ]),
      ],
    ),
    TimePickerPrimitive.Content(
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
        TimePickerPrimitive.TimePanel({ store, class: "flex flex-col gap-2" }, [
          View({ class: "flex gap-1" }, [
            // Hour Column
            View(
              {
                class:
                  "flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700",
              },
              [
                For({
                  each: store.generateHours(),
                  render(hour) {
                    return TimePickerPrimitive.HourItem(
                      {
                        store,
                        value: hour,
                        class: computed(state_, (s) => {
                          const isSelected = s.tempHour === hour;
                          const baseClass =
                            "w-12 h-8 text-sm rounded-md transition-colors focus:outline-none";
                          if (isSelected) {
                            return `${baseClass} bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900`;
                          }
                          return `${baseClass} text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800`;
                        }),
                      },
                      [String(hour).padStart(2, "0")],
                    );
                  },
                }),
              ],
            ),
            // Separator
            View(
              {
                class:
                  "flex items-center text-zinc-400 dark:text-zinc-600 text-lg font-medium",
              },
              [":"],
            ),
            // Minute Column
            View(
              {
                class:
                  "flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700",
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
                            "w-12 h-8 text-sm rounded-md transition-colors focus:outline-none";
                          if (isSelected) {
                            return `${baseClass} bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900`;
                          }
                          return `${baseClass} text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800`;
                        }),
                      },
                      [String(minute).padStart(2, "0")],
                    );
                  },
                }),
              ],
            ),
            // Second Column (conditional)
            Show(
              {
                when: store.showSeconds,
              },
              [
                View(
                  {
                    class:
                      "flex items-center text-zinc-400 dark:text-zinc-600 text-lg font-medium",
                  },
                  [":"],
                ),
                View(
                  {
                    class:
                      "flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700",
                  },
                  [
                    For({
                      each: store.generateSeconds(),
                      render(second) {
                        return TimePickerPrimitive.SecondItem(
                          {
                            store,
                            value: second,
                            class: computed(state_, (s) => {
                              const isSelected = s.tempSecond === second;
                              const baseClass =
                                "w-12 h-8 text-sm rounded-md transition-colors focus:outline-none";
                              if (isSelected) {
                                return `${baseClass} bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900`;
                              }
                              return `${baseClass} text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800`;
                            }),
                          },
                          [String(second).padStart(2, "0")],
                        );
                      },
                    }),
                  ],
                ),
              ],
            ),
          ]),
          // Footer with buttons
          View(
            {
              class:
                "flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800",
            },
            [
              TimePickerPrimitive.ClearButton(
                {
                  store,
                  class:
                    "px-3 py-1 text-sm rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors",
                },
                ["清除"],
              ),
              TimePickerPrimitive.ConfirmButton(
                {
                  store,
                  class:
                    "px-3 py-1 text-sm rounded-md bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors",
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
