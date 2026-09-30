import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";
import { For, View, ViewProps } from "@timeless/timeless";

import { PICKER_ANIMATION } from "./date-picker";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/**
 * DateRangePicker · Material 3
 *
 * 双月面板。类名：.m3-daterangepicker（触发器）+ .m3-daterangepicker__content
 *   + .m3-daterangepicker__panels / __panel / __header / __title / __nav
 *   + .m3-daterangepicker__weekdays / __weekday / __grid / __week / __cell。
 *
 * cell 状态：.is-in-range（--primary-container 底带）/ .is-range-start /
 * .is-range-end（--primary 圆形端点）/ .is-today / .is-outside。
 * 端点之间用 ::before 画连续底带，端头用 pill 圆角。
 */
export function DateRangePicker(
  props: ViewProps & {
    store: vm.DateRangePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期范围", class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const calendar_state_ = refobj(store.$calendar.state);
  const presence_ = refobj(store.$presence.state);

  const has_value_ = computed(state_, (d) => d.value != null);

  const listener$ = ListenerManager([
    state_,
    calendar_state_,
    presence_,
    has_value_,
  ]);

  function nav_button(type: "leftPrev" | "leftNext" | "rightPrev" | "rightNext") {
    const ButtonComponent = {
      leftPrev: ui.DateRangePickerPrimitive.LeftPrevButton,
      leftNext: ui.DateRangePickerPrimitive.LeftNextButton,
      rightPrev: ui.DateRangePickerPrimitive.RightPrevButton,
      rightNext: ui.DateRangePickerPrimitive.RightNextButton,
    }[type];
    const is_forward: boolean = type === "leftNext" || type === "rightNext";
    const children = [
      Icon({
        name: is_forward ? "chevron-right" : "chevron-left",
        size: 18,
      }),
    ];
    // 左面板下一月 / 右面板上一月受另一面板月份限制（primitive 内部也会再校验）。
    const guard = type === "leftNext" || type === "rightPrev";
    return ButtonComponent(
      {
        store,
        class: classNames([
          "m3-daterangepicker__nav",
          computed(calendar_state_, (s) =>
            guard &&
            !(type === "leftNext" ? s.canLeftNext : s.canRightPrev)
              ? "is-disabled"
              : "",
          ),
        ]),
      },
      children,
    );
  }

  function panel(side: "left" | "right") {
    const Header =
      side === "left"
        ? ui.DateRangePickerPrimitive.LeftCalendarHeader
        : ui.DateRangePickerPrimitive.RightCalendarHeader;
    const weeks_ = computed(calendar_state_, (s) =>
      side === "left" ? s.left.weeks : s.right.weeks,
    );

    return View({ class: "m3-daterangepicker__panel" }, [
      View({ class: "m3-daterangepicker__header" }, [
        nav_button(side === "left" ? "leftPrev" : "rightPrev"),
        Header({ store, class: "m3-daterangepicker__title" }),
        nav_button(side === "left" ? "leftNext" : "rightNext"),
      ]),
      ui.DateRangePickerPrimitive.CalendarGrid(
        { store, class: "m3-daterangepicker__grid" },
        [
          View(
            { class: "m3-daterangepicker__weekdays" },
            WEEKDAYS.map((day) =>
              View(
                { as: "span", class: "m3-daterangepicker__weekday" },
                [day],
              ),
            ),
          ),
          For({
            each: weeks_ as any,
            render(week: any) {
              return View({ class: "m3-daterangepicker__week" }, [
                For({
                  each: computed(week, (t: any) => t.dates) as any,
                  render(day: any) {
                    const cell_class = computed(calendar_state_, (s: any) => {
                      const is_start = store.$calendar.isRangeStart(day.value);
                      const is_end = store.$calendar.isRangeEnd(day.value);
                      const in_range = store.$calendar.isInRange(day.value);
                      const has_end = Boolean(s.endDate || s.hoverDate);
                      const names: string[] = [];
                      if (in_range) names.push("is-in-range");
                      if (is_start) names.push("is-range-start");
                      if (is_end) names.push("is-range-end");
                      if (is_start && is_end && !has_end) {
                        names.push("is-range-single");
                      }
                      if (day.is_today) names.push("is-today");
                      if (day.is_prev_month || day.is_next_month) {
                        names.push("is-outside");
                      }
                      return names.filter(Boolean).join(" ");
                    });
                    return ui.DateRangePickerPrimitive.CalendarCell(
                      {
                        store,
                        value: day.value,
                        isToday: day.is_today,
                        isPrevMonth: day.is_prev_month,
                        isNextMonth: day.is_next_month,
                        class: classNames([
                          "m3-daterangepicker__cell",
                          cell_class,
                        ]),
                      },
                      [
                        View(
                          { as: "span", class: "m3-daterangepicker__cell-label" },
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
    ]);
  }

  return ui.DateRangePickerPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        listener$.add(
          store.$calendar.onChange((v) => {
            calendar_state_.as(v);
          }),
        );
        listener$.add(
          store.$presence.onStateChange((v) => {
            presence_.as(v);
          }),
        );
        return listener$.destroy;
      },
    },
    [
      ui.DateRangePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "m3-daterangepicker",
            computed(presence_, (d) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          ui.DateRangePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "m3-daterangepicker__value",
              computed(has_value_, (v) => (v ? "" : "is-placeholder")),
            ]),
          }),
          ui.DateRangePickerPrimitive.Icon(
            {
              class: classNames([
                "m3-daterangepicker__icon",
                computed(presence_, (d) => (d.visible ? "is-open" : "")),
              ]),
            },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DateRangePickerPrimitive.Content(
        {
          ...rest,
          animation: PICKER_ANIMATION,
          store,
          class: "m3-daterangepicker__content",
        },
        () => [
          ui.DateRangePickerPrimitive.Calendars(
            { store, class: "m3-daterangepicker__panels" },
            [panel("left"), panel("right")],
          ),
        ],
      ),
    ],
  );
}
