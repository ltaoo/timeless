import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  View,
  ViewProps,
  classNames,
  combine,
  computed,
  refobj,
} from "@timeless/timeless";

import { Button } from "./button";
import { DateCalendarPanel } from "./date-picker";
import { TimeColumns, TimePreview } from "./time-picker";

/**
 * DateTimePicker · Fluent 2
 *
 * 单个触发器 + 浮层内左右两栏：左侧复用 date-picker 的日历面板
 * （.fl-datepicker__*），右侧复用 time-picker 的三列滚动（.fl-timepicker__*）。
 * 容器用 .fl-datetimepicker__panes / __pane / __footer。
 *
 * date$ 是 DatePickerCore（提供 popover/presence 与日历），time$ 是 TimePickerCore。
 */
export function DateTimePicker(
  props: ViewProps & {
    date: vm.DatePickerCore;
    time: vm.TimePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { date: date$, time: time$, id, placeholder = "选择日期时间", class: cls, ...rest } = props;

  const date_state_ = refobj(date$.state);
  const time_state_ = refobj(time$.state);
  const presence_ = refobj(date$.$presence.state);

  const has_date_ = computed(date_state_, (d: any) => d.value != null);
  const has_time_ = computed(time_state_, (d: any) => d.value != null);

  const hourview$ = new vm.ScrollViewCore({});
  const minuteview$ = new vm.ScrollViewCore({});
  const secondview$ = new vm.ScrollViewCore({});

  const listener$ = ListenerManager([
    date_state_,
    time_state_,
    presence_,
    has_date_,
    has_time_,
  ]);

  return ui.DatePickerPrimitive.Root(
    {
      store: date$,
      onMounted() {
        listener$.append([
          date$.onStateChange((v) => {
            date_state_.as(v);
          }),
          date$.$presence.onStateChange((v) => {
            presence_.as(v);
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
            "fl-datetimepicker",
            computed(presence_, (d: any) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          View(
            {
              as: "span",
              class: classNames([
                "fl-datetimepicker__value",
                combine(
                  { hasDate: has_date_, hasTime: has_time_ },
                  (t) =>
                    t.hasDate && t.hasTime ? "is-filled" : "is-placeholder",
                ),
              ]),
            },
            [
              combine({ date: date_state_, time: time_state_ }, (t: any) => {
                if (t.date.value != null && t.time.value != null) {
                  return `${t.date.date} ${t.time.time}`;
                }
                return placeholder;
              }),
            ],
          ),
          ui.DatePickerPrimitive.Icon(
            { class: "fl-datetimepicker__icon" },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DatePickerPrimitive.Content(
        {
          ...rest,
          store: date$,
          class: "fl-datetimepicker__content",
        },
        () => [
          View({ class: "fl-datetimepicker__panes" }, [
            View({ class: "fl-datetimepicker__pane is-left" }, [
              DateCalendarPanel({ store: date$ }),
            ]),
            View({ class: "fl-datetimepicker__pane is-right" }, [
              TimePreview({ store: time$ }),
              TimeColumns({
                store: time$,
                hourview$,
                minuteview$,
                secondview$,
              }),
            ]),
          ]),
          View({ class: "fl-datetimepicker__footer" }, [
            Button(
              {
                store: new vm.ButtonCore({
                  size: "sm",
                  variant: "subtle",
                  onClick() {
                    time$.clear();
                  },
                }),
              },
              ["清除"],
            ),
            Button(
              {
                store: new vm.ButtonCore({
                  size: "sm",
                  variant: "primary",
                  onClick() {
                    time$.confirm();
                    date$.$presence.hide();
                  },
                }),
              },
              ["确定"],
            ),
          ]),
        ],
      ),
    ],
  );
}
