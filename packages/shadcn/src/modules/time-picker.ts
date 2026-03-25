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
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
          const openClass = d.visible
            ? "border-ring ring-3 ring-ring/50"
            : "dark:hover:bg-input/50";
          return `${baseClass} ${openClass}`;
        }),
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
        TimePickerPrimitive.Icon(
          { class: "size-4 text-muted-foreground" },
          [ClockOutlined({})],
        ),
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
          "cn-menu-target cn-menu-translucent z-50 w-auto p-3 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
      },
      [
        TimePickerPrimitive.TimePanel({ store, class: "flex flex-col gap-2" }, [
          View({ class: "flex gap-1" }, [
            // Hour Column
            View(
              {
                class: "flex flex-col h-48 overflow-y-auto",
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
                            "w-12 h-8 text-sm rounded-md transition-colors outline-hidden";
                          if (isSelected) {
                            return `${baseClass} bg-primary text-primary-foreground`;
                          }
                          return `${baseClass} hover:bg-accent hover:text-accent-foreground`;
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
                  "flex items-center text-muted-foreground text-lg font-medium",
              },
              [":"],
            ),
            // Minute Column
            View(
              {
                class: "flex flex-col h-48 overflow-y-auto",
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
                            "w-12 h-8 text-sm rounded-md transition-colors outline-hidden";
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
            // Second Column (conditional)
            Show(
              {
                when: store.showSeconds,
              },
              [
                View(
                  {
                    class:
                      "flex items-center text-muted-foreground text-lg font-medium",
                  },
                  [":"],
                ),
                View(
                  {
                    class: "flex flex-col h-48 overflow-y-auto",
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
                                "w-12 h-8 text-sm rounded-md transition-colors outline-hidden";
                              if (isSelected) {
                                return `${baseClass} bg-primary text-primary-foreground`;
                              }
                              return `${baseClass} hover:bg-accent hover:text-accent-foreground`;
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
              class: "flex justify-end gap-2 pt-2 border-t border-border",
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
