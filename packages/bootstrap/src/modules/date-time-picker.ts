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
import { For, Show, View, ViewProps } from "@timeless/timeless";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const ITEM_HEIGHT = 32;
const SCROLL_PADDING_ITEMS = 2;

/**
 * DateTimePicker · Bootstrap 5.3
 *
 * 把 DatePickerCore 与 TimePickerCore 组合成一个面板：左侧复用 .datepicker__*
 * 日历，右侧复用 .timepicker__* 三列滚动选择。弹层仍是 .popover + .datetimepicker。
 */
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
    class: cls,
    ...rest
  } = props;

  const date_state_ = refobj(date$.state);
  const calendar_state_ = refobj(date$.$calendar.state);
  const time_state_ = refobj(time$.state);
  const presence_ = refobj(date$.$presence.state);

  const listener$ = ListenerManager([
    date_state_,
    calendar_state_,
    time_state_,
    presence_,
  ]);

  const has_date_ = computed(date_state_, (d) => d.value != null);
  const has_time_ = computed(time_state_, (d) => d.value != null);
  const has_both_ = combine(
    { hasDate: has_date_, hasTime: has_time_ },
    (t) => t.hasDate && t.hasTime,
  );
  listener$.append([has_date_, has_time_, has_both_]);

  const empty_time_text = time$.showSeconds ? "--:--:--" : "--:--";
  let did_init_temp = false;

  const hourview$ = new vm.ScrollViewCore({});
  const minuteview$ = new vm.ScrollViewCore({});
  const secondview$ = new vm.ScrollViewCore({});

  function format_temp_time(s: {
    t_hour: number | null;
    t_minute: number | null;
    t_second: number | null;
  }) {
    if (s.t_hour == null || s.t_minute == null) return empty_time_text;
    if (time$.showSeconds && s.t_second == null) return empty_time_text;
    const h = String(s.t_hour).padStart(2, "0");
    const m = String(s.t_minute).padStart(2, "0");
    if (time$.showSeconds) {
      return `${h}:${m}:${String(s.t_second).padStart(2, "0")}`;
    }
    return `${h}:${m}`;
  }

  function pick_closest_not_greater(sorted: number[], target: number) {
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
  }

  function ensure_default_temp_time() {
    if (did_init_temp) return;
    did_init_temp = true;
    if (time$.value != null) return;
    const s = time$.state;
    const is_ready =
      s.tempHour != null &&
      s.tempMinute != null &&
      (!time$.showSeconds || s.tempSecond != null);
    if (is_ready) return;

    const now = new Date();
    const hours = time$.generateHours();
    const minutes = time$.generateMinutes();
    const seconds = time$.generateSeconds();
    const now_hour = now.getHours();
    const hour_candidate = time$.use12Hours
      ? now_hour % 12 === 0
        ? 12
        : now_hour % 12
      : now_hour;
    time$.selectHour(pick_closest_not_greater(hours, hour_candidate));
    time$.selectMinute(pick_closest_not_greater(minutes, now.getMinutes()));
    if (time$.showSeconds) {
      time$.selectSecond(pick_closest_not_greater(seconds, now.getSeconds()));
    }
  }

  function scroll_to_index(view$: vm.ScrollViewCore, index: number) {
    const safe = index >= 0 ? index : 0;
    view$.setScrollTop(
      Math.max(0, (safe - SCROLL_PADDING_ITEMS) * ITEM_HEIGHT),
    );
  }

  function timeColumn(
    view$: vm.ScrollViewCore,
    values: number[],
    target: number | null,
    is_active: (v: number) => boolean,
    Item: any,
    extra_class: string,
  ) {
    return ui.ScrollViewPrimitive.Root(
      {
        store: view$,
        class: classNames(["timepicker__column", extra_class]),
        onMounted() {
          ensure_default_temp_time();
          const index = typeof target === "number" ? values.indexOf(target) : -1;
          setTimeout(() => {
            if (index !== -1) scroll_to_index(view$, index);
          }, 0);
        },
      },
      [
        For({
          each: values,
          render(value: number) {
            return Item(
              {
                store: time$,
                value,
                class: classNames([
                  "timepicker__option",
                  computed(time_state_, () =>
                    is_active(value) ? "is-active" : "",
                  ),
                ]),
              },
              [String(value).padStart(2, "0")],
            );
          },
        }),
      ],
    );
  }

  return ui.DatePickerPrimitive.Root(
    {
      store: date$,
      onMounted() {
        listener$.append([
          date$.onStateChange((v) => date_state_.as(v)),
          date$.$calendar.onChange((v) => calendar_state_.as(v)),
          date$.$presence.onStateChange((v) => {
            presence_.as(v);
            if (v.visible) did_init_temp = false;
          }),
          time$.onStateChange((v) => time_state_.as(v)),
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
            "form-control",
            "datetimepicker__trigger",
            computed(presence_, (d) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          View(
            {
              as: "span",
              class: classNames([
                "datetimepicker__value",
                combine(
                  { hasBoth: has_both_ },
                  (t) => (t.hasBoth ? "" : "is-placeholder"),
                ),
              ]),
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
            { class: "datetimepicker__icon" },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DatePickerPrimitive.Content(
        {
          ...rest,
          animation: { in: "is-enter", out: "is-exit" },
          store: date$,
          class: computed(presence_, (d) =>
            ["popover", "datetimepicker", d.visible ? "is-open" : "", cls]
              .filter(Boolean)
              .join(" "),
          ),
        },
        () => [
          View({ class: "datetimepicker__body" }, [
            ui.DatePickerPrimitive.Calendar(
              { store: date$, class: "datepicker__calendar" },
              [
                View({ class: "datepicker__header" }, [
                  ui.DatePickerPrimitive.CalendarPrevButton(
                    { store: date$, class: "datepicker__nav" },
                    [Icon({ name: "chevron-left", size: 16 })],
                  ),
                  ui.DatePickerPrimitive.CalendarHeader({
                    store: date$,
                    class: "datepicker__title",
                  }),
                  ui.DatePickerPrimitive.CalendarNextButton(
                    { store: date$, class: "datepicker__nav" },
                    [Icon({ name: "chevron-right", size: 16 })],
                  ),
                ]),
                ui.DatePickerPrimitive.CalendarGrid(
                  { store: date$, class: "datepicker__grid" },
                  [
                    View(
                      { class: "datepicker__weekdays" },
                      WEEKDAYS.map((day) =>
                        View({ as: "span", class: "datepicker__weekday" }, [day]),
                      ),
                    ),
                    For({
                      each: computed(calendar_state_, (s) => s.weeks) as any,
                      render(week: any) {
                        return View({ class: "datepicker__week" }, [
                          For({
                            each: computed(week, (t: any) => t.dates) as any,
                            render(day: any) {
                              return ui.DatePickerPrimitive.CalendarCell(
                                {
                                  store: date$,
                                  value: day.value,
                                  isToday: day.is_today,
                                  isPrevMonth: day.is_prev_month,
                                  isNextMonth: day.is_next_month,
                                  class: classNames([
                                    "datepicker__cell",
                                    computed(calendar_state_, (s) => {
                                      const is_selected =
                                        s.selectedDay?.time === day.time;
                                      return [
                                        is_selected ? "is-active" : "",
                                        day.is_today ? "is-today" : "",
                                        day.is_prev_month || day.is_next_month
                                          ? "is-outside"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ");
                                    }),
                                  ]),
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
            View({ class: "datetimepicker__time" }, [
              View(
                { class: "timepicker__header" },
                [
                  computed(time_state_, (t) =>
                    format_temp_time({
                      t_hour: t.tempHour,
                      t_minute: t.tempMinute,
                      t_second: t.tempSecond,
                    }),
                  ),
                ],
              ),
              View(
                {
                  class: classNames([
                    "timepicker__columns",
                    time$.showSeconds ? "is-three" : "is-two",
                  ]),
                },
                [
                  timeColumn(
                    hourview$,
                    time$.generateHours(),
                    time$.state.tempHour,
                    (v) => time$.state.tempHour === v,
                    ui.TimePickerPrimitive.HourItem,
                    "",
                  ),
                  timeColumn(
                    minuteview$,
                    time$.generateMinutes(),
                    time$.state.tempMinute,
                    (v) => time$.state.tempMinute === v,
                    ui.TimePickerPrimitive.MinuteItem,
                    time$.showSeconds ? "is-bordered" : "",
                  ),
                  Show({
                    when: time$.showSeconds,
                    ok() {
                      return [
                        timeColumn(
                          secondview$,
                          time$.generateSeconds(),
                          time$.state.tempSecond,
                          (v) => time$.state.tempSecond === v,
                          ui.TimePickerPrimitive.SecondItem,
                          "",
                        ),
                      ];
                    },
                  }),
                ],
              ),
            ]),
          ]),
          View({ class: "datetimepicker__footer" }, [
            ui.TimePickerPrimitive.ClearButton(
              { store: time$, class: "btn btn-outline-secondary btn-sm" },
              ["清除"],
            ),
            Button(
              {
                class: "btn btn-primary btn-sm",
                onClick() {
                  time$.confirm();
                  date$.$presence.hide();
                },
              },
              ["确定"],
            ),
          ]),
        ],
      ),
    ],
  );
}
