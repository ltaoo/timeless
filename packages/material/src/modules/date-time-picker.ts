import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  classNames,
  combine,
  computed,
  refobj,
} from "@timeless/timeless";
import { For, View, ViewProps } from "@timeless/timeless";

import { Button } from "./button";
import { PICKER_ANIMATION, render_cell } from "./date-picker";
import { TimeColumns } from "./time-picker";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/**
 * DateTimePicker · Material 3
 *
 * 由 DatePickerCore + TimePickerCore 组合：左日历右时间列，底部操作条。
 * 日历部分直接复用 date-picker.css 的 `.m3-datepicker__*` 类；
 * 时间列复用 time-picker.css / TimeColumns。
 * 外层类名：.m3-datetimepicker（触发器）+ .m3-datetimepicker__content。
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

  const has_date_ = computed(date_state_, (d) => d.value != null);
  const has_time_ = computed(time_state_, (d) => d.value != null);
  const show_seconds_ = time$.showSeconds;
  const empty_time_text_ = show_seconds_ ? "--:--:--" : "--:--";

  const listener$ = ListenerManager([
    date_state_,
    calendar_state_,
    time_state_,
    presence_,
    has_date_,
    has_time_,
  ]);

  let did_init_time = false;

  /** 打开时若还没选过时间，用「当前时间」预填临时值，避免三列空白。 */
  function ensure_default_temp_time() {
    if (did_init_time) return;
    did_init_time = true;
    if (time$.value != null) return;

    const now = new Date();
    const hours = time$.generateHours();
    const minutes = time$.generateMinutes();
    const seconds = time$.generateSeconds();
    const pick = (list: number[], target: number) => {
      let best = list[0];
      for (const v of list) {
        if (v <= target) best = v;
        else break;
      }
      return best;
    };
    const hour_candidate = time$.use12Hours
      ? now.getHours() % 12 === 0
        ? 12
        : now.getHours() % 12
      : now.getHours();

    time$.selectHour(pick(hours, hour_candidate));
    time$.selectMinute(pick(minutes, now.getMinutes()));
    if (show_seconds_) time$.selectSecond(pick(seconds, now.getSeconds()));
  }

  const weeks_ = computed(calendar_state_, (s) => s.weeks);

  return ui.DatePickerPrimitive.Root(
    {
      store: date$,
      onMounted() {
        listener$.add(
          date$.onStateChange((v) => {
            date_state_.as(v);
          }),
        );
        listener$.add(
          date$.$calendar.onChange((v) => {
            calendar_state_.as(v);
          }),
        );
        listener$.add(
          date$.$presence.onStateChange((v) => {
            presence_.as(v);
            if (v.visible) did_init_time = false;
          }),
        );
        listener$.add(
          time$.onStateChange((v) => {
            time_state_.as(v);
          }),
        );
        return listener$.destroy;
      },
    },
    [
      ui.DatePickerPrimitive.Trigger(
        {
          store: date$,
          id,
          class: classNames([
            "m3-datetimepicker",
            computed(presence_, (d) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          View(
            {
              as: "span",
              class: classNames([
                "m3-datetimepicker__value",
                combine(
                  { has_date: has_date_, has_time: has_time_ },
                  (t) =>
                    t.has_date && t.has_time ? "" : "is-placeholder",
                ),
              ]),
            },
            [
              combine({ date: date_state_, time: time_state_ }, (t) => {
                if (t.date.value != null && t.time.value != null) {
                  return `${t.date.date} ${t.time.time}`;
                }
                return placeholder;
              }),
            ],
          ),
          ui.DatePickerPrimitive.Icon(
            {
              class: classNames([
                "m3-datetimepicker__icon",
                computed(presence_, (d) => (d.visible ? "is-open" : "")),
              ]),
            },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DatePickerPrimitive.Content(
        {
          ...rest,
          animation: PICKER_ANIMATION,
          store: date$,
          class: "m3-datetimepicker__content",
        },
        () => [
          View({ class: "m3-datetimepicker__panels" }, [
            ui.DatePickerPrimitive.Calendar(
              { store: date$, class: "m3-datepicker__calendar" },
              [
                View({ class: "m3-datepicker__header" }, [
                  ui.DatePickerPrimitive.CalendarPrevButton(
                    { store: date$, class: "m3-datepicker__nav" },
                    [Icon({ name: "chevron-left", size: 18 })],
                  ),
                  ui.DatePickerPrimitive.CalendarHeader({
                    store: date$,
                    class: "m3-datepicker__title",
                  }),
                  ui.DatePickerPrimitive.CalendarNextButton(
                    { store: date$, class: "m3-datepicker__nav" },
                    [Icon({ name: "chevron-right", size: 18 })],
                  ),
                ]),
                ui.DatePickerPrimitive.CalendarGrid(
                  { store: date$, class: "m3-datepicker__grid" },
                  [
                    View(
                      { class: "m3-datepicker__weekdays" },
                      WEEKDAYS.map((day) =>
                        View(
                          { as: "span", class: "m3-datepicker__weekday" },
                          [day],
                        ),
                      ),
                    ),
                    For({
                      each: weeks_ as any,
                      render(week: any) {
                        return View({ class: "m3-datepicker__week" }, [
                          For({
                            each: computed(week, (t: any) => t.dates) as any,
                            render(day: any) {
                              return render_cell(
                                date$,
                                calendar_state_,
                                day,
                                "m3-datepicker",
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
            View({ class: "m3-datetimepicker__time" }, [
              View({ class: "m3-timepicker__display" }, [
                computed(time_state_, (s: any) => {
                  const h = s.tempHour;
                  const m = s.tempMinute;
                  const sec = s.tempSecond;
                  if (h == null || m == null) return empty_time_text_;
                  if (show_seconds_ && sec == null) return empty_time_text_;
                  const hh = String(h).padStart(2, "0");
                  const mm = String(m).padStart(2, "0");
                  if (show_seconds_) {
                    return `${hh}:${mm}:${String(sec).padStart(2, "0")}`;
                  }
                  return `${hh}:${mm}`;
                }),
              ]),
              View(
                {
                  class: "m3-datetimepicker__columns",
                  onMounted() {
                    ensure_default_temp_time();
                  },
                },
                [TimeColumns({ store: time$, state_: time_state_ })],
              ),
            ]),
          ]),
          View({ class: "m3-timepicker__footer" }, [
            Button(
              {
                store: new vm.ButtonCore({
                  variant: "text",
                  size: "sm",
                  onClick() {
                    time$.clear();
                  },
                }),
                class: "m3-timepicker__action",
              },
              ["清除"],
            ),
            Button(
              {
                store: new vm.ButtonCore({
                  variant: "filled",
                  size: "sm",
                  onClick() {
                    time$.confirm();
                    date$.$presence.hide();
                  },
                }),
                class: "m3-timepicker__action m3-timepicker__action--confirm",
              },
              ["确定"],
            ),
          ]),
        ],
      ),
    ],
  );
}
