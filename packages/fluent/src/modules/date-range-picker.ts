import { ui, vm } from "@timeless/timeless";
import {
  For,
  Icon,
  ListenerManager,
  View,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

/**
 * DateRangePicker · Fluent 2
 *
 * 双月面板：.fl-daterange__content > .fl-daterange__calendars > 两个 __panel。
 * 日期格与 date-picker 同构（32px 圆角方块），额外用：
 *   · .is-in-range   区间内（--brand-fill 12% 淡底）
 *   · .is-range-start / .is-range-end  区间端点（--compound-brand 填充）
 *   · .is-today      今天（1px --compound-brand 描边）
 *   · .is-outside    非当月（--foreground-3）
 */

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function RangeCalendarPanel(props: {
  store: vm.DateRangePickerCore;
  side: "left" | "right";
}) {
  const { store, side } = props;

  const calendar_state_ = refobj(store.$calendar.state);
  const listener$ = ListenerManager([calendar_state_]);

  const Header =
    side === "left"
      ? ui.DateRangePickerPrimitive.LeftCalendarHeader
      : ui.DateRangePickerPrimitive.RightCalendarHeader;
  const Prev =
    side === "left"
      ? ui.DateRangePickerPrimitive.LeftPrevButton
      : ui.DateRangePickerPrimitive.RightPrevButton;
  const Next =
    side === "left"
      ? ui.DateRangePickerPrimitive.LeftNextButton
      : ui.DateRangePickerPrimitive.RightNextButton;

  const cellState = (day: any) => {
    const s = calendar_state_.value as any;
    const isInRange = store.$calendar.isInRange(day.value);
    const isRangeStart = store.$calendar.isRangeStart(day.value);
    const isRangeEnd = store.$calendar.isRangeEnd(day.value);
    const hasEnd = Boolean(s.endDate);
    const isSingle = isRangeStart && !hasEnd && !isRangeEnd;
    return [
      "fl-daterange__cell",
      isInRange ? "is-in-range" : "",
      isRangeStart ? "is-range-start" : "",
      isRangeEnd ? "is-range-end" : "",
      isSingle ? "is-single" : "",
      day.is_today ? "is-today" : "",
      day.is_prev_month || day.is_next_month ? "is-outside" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const daySpanClass = (day: any) => {
    const isRangeStart = store.$calendar.isRangeStart(day.value);
    const isRangeEnd = store.$calendar.isRangeEnd(day.value);
    const hasEnd = Boolean((calendar_state_.value as any).endDate);
    const isSingle = isRangeStart && !hasEnd && !isRangeEnd;
    return [
      "fl-daterange__day",
      isSingle || isRangeStart || isRangeEnd ? "is-active" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return View(
    {
      class: classNames([
        "fl-daterange__panel",
        side === "left" ? "is-left" : "is-right",
      ]),
      onMounted() {
        listener$.add(
          store.$calendar.onChange((v) => {
            calendar_state_.as(v);
          }),
        );
      },
      onUnmounted() {
        listener$.destroy();
      },
    },
    [
      View({ class: "fl-daterange__header" }, [
        Prev({ store, class: "fl-daterange__nav" }, [
          Icon({ name: "chevron-left", size: 16 }),
        ]),
        Header({ store, class: "fl-daterange__title" }),
        Next({ store, class: "fl-daterange__nav" }, [
          Icon({ name: "chevron-right", size: 16 }),
        ]),
      ]),
      ui.DateRangePickerPrimitive.CalendarGrid(
        { store, class: "fl-daterange__grid" },
        [
          View(
            { class: "fl-daterange__weekdays" },
            WEEKDAYS.map((day) =>
              View({ as: "span", class: "fl-daterange__weekday" }, [day]),
            ),
          ),
          For({
            each: computed(
              calendar_state_,
              (s: any) => (side === "left" ? s.left.weeks : s.right.weeks),
            ),
            render(week: any) {
              return View({ class: "fl-daterange__week" }, [
                For({
                  each: computed(week, (t: any) => t.dates),
                  render(day: any) {
                    return ui.DateRangePickerPrimitive.CalendarCell(
                      {
                        store,
                        value: day.value,
                        isToday: day.is_today,
                        isPrevMonth: day.is_prev_month,
                        isNextMonth: day.is_next_month,
                        class: computed(calendar_state_, () => cellState(day)),
                      },
                      [
                        View(
                          {
                            as: "span",
                            class: computed(calendar_state_, () =>
                              daySpanClass(day),
                            ),
                          },
                          [day.text],
                        ),
                      ],
                    );
                  },
                }),
              ]);
            },
          }),
        ],
      ),
    ],
  );
}

export function DateRangePicker(
  props: ViewProps & {
    store: vm.DateRangePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期范围", class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const presence_ = refobj(store.$presence.state);

  const listener$ = ListenerManager([state_, presence_]);

  return ui.DateRangePickerPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.append([
          store.onStateChange((v) => {
            state_.as(v);
          }),
          store.$presence.onStateChange((v) => {
            presence_.as(v);
          }),
        ]);
        return listener$.destroy;
      },
    },
    [
      ui.DateRangePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "fl-daterange",
            computed(presence_, (d: any) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          ui.DateRangePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "fl-daterange__value",
              computed(state_, (d: any) => (d.value != null ? "" : "is-placeholder")),
            ]),
          }),
          ui.DateRangePickerPrimitive.Icon(
            { class: "fl-daterange__icon" },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DateRangePickerPrimitive.Content(
        {
          ...rest,
          store,
          class: "fl-daterange__content",
        },
        () => [
          ui.DateRangePickerPrimitive.Calendars(
            { store, class: "fl-daterange__calendars" },
            [
              RangeCalendarPanel({ store, side: "left" }),
              RangeCalendarPanel({ store, side: "right" }),
            ],
          ),
        ],
      ),
    ],
  );
}
