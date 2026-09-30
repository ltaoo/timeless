import { ui, vm } from "@timeless/timeless";
import { computed, Icon, ListenerManager, refobj } from "@timeless/timeless";
import { For, Show, View, ViewProps, classNames } from "@timeless/timeless";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/**
 * DateRangePicker · Bootstrap 5.3
 *
 * 弹层在 .popover + .datepicker 的基础上加 .is-range，双月并排。
 * 区间态用 .datepicker__cell 的 .is-in-range / .is-range-start / .is-range-end
 * 表达：单元格 ::before 画区间色带，内层 .datepicker__cell-inner 承载数字
 * 与端点圆角。
 */
function NavButton(props: {
  store: vm.DateRangePickerCore;
  type: "leftPrev" | "leftNext" | "rightPrev" | "rightNext";
  disabled?: any;
  children: any[];
}) {
  const { store, type, disabled, children } = props;

  const ButtonComponent = {
    leftPrev: ui.DateRangePickerPrimitive.LeftPrevButton,
    leftNext: ui.DateRangePickerPrimitive.LeftNextButton,
    rightPrev: ui.DateRangePickerPrimitive.RightPrevButton,
    rightNext: ui.DateRangePickerPrimitive.RightNextButton,
  }[type];

  return ButtonComponent(
    {
      store,
      class: classNames([
        "datepicker__nav",
        computed(disabled, (d: any) => (d ? "is-disabled" : "")),
      ]),
    },
    children,
  );
}

function CalendarPanel(props: {
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

  return View(
    {
      class: "datepicker__panel",
      onMounted() {
        listener$.append([
          store.$calendar.onChange((v) => calendar_state_.as(v)),
        ]);
        return listener$.destroy;
      },
    },
    [
      View({ class: "datepicker__header" }, [
        NavButton({
          store,
          type: side === "left" ? "leftPrev" : "rightPrev",
          disabled:
            side === "right"
              ? computed(calendar_state_, (s: any) => !s.canRightPrev)
              : undefined,
          children: [Icon({ name: "chevron-left", size: 16 })],
        }),
        Header({ store, class: "datepicker__title" }),
        NavButton({
          store,
          type: side === "left" ? "leftNext" : "rightNext",
          disabled:
            side === "left"
              ? computed(calendar_state_, (s: any) => !s.canLeftNext)
              : undefined,
          children: [Icon({ name: "chevron-right", size: 16 })],
        }),
      ]),
      ui.DateRangePickerPrimitive.CalendarGrid(
        { store, class: "datepicker__grid" },
        [
          View(
            { class: "datepicker__weekdays" },
            WEEKDAYS.map((day) =>
              View({ as: "span", class: "datepicker__weekday" }, [day]),
            ),
          ),
          For({
            each: computed(calendar_state_, (s: any) =>
              side === "left" ? s.left.weeks : s.right.weeks,
            ) as any,
            render(week: any) {
              return View({ class: "datepicker__week" }, [
                For({
                  each: computed(week, (t: any) => t.dates) as any,
                  render(day: any) {
                    return ui.DateRangePickerPrimitive.CalendarCell(
                      {
                        store,
                        value: day.value,
                        isToday: day.is_today,
                        isPrevMonth: day.is_prev_month,
                        isNextMonth: day.is_next_month,
                        class: classNames([
                          "datepicker__cell",
                          computed(calendar_state_, () => {
                            const is_in_range = store.$calendar.isInRange(
                              day.value,
                            );
                            const is_start = store.$calendar.isRangeStart(
                              day.value,
                            );
                            const is_end = store.$calendar.isRangeEnd(
                              day.value,
                            );
                            return [
                              is_in_range || is_start || is_end
                                ? "is-in-range"
                                : "",
                              is_start ? "is-range-start" : "",
                              is_end ? "is-range-end" : "",
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
                      [
                        View(
                          {
                            as: "span",
                            class: classNames([
                              "datepicker__cell-inner",
                              computed(calendar_state_, () => {
                                const is_start = store.$calendar.isRangeStart(
                                  day.value,
                                );
                                const is_end = store.$calendar.isRangeEnd(
                                  day.value,
                                );
                                return [
                                  is_start || is_end ? "is-edge" : "",
                                  store.$calendar.isInRange(day.value) &&
                                  !is_start &&
                                  !is_end
                                    ? "is-in"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ");
                              }),
                            ]),
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
          store.onStateChange((v) => state_.as(v)),
          store.$presence.onStateChange((v) => presence_.as(v)),
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
            "form-control",
            "datepicker__trigger",
            computed(presence_, (d) => (d.visible ? "is-open" : "")),
            cls,
          ]),
        },
        [
          ui.DateRangePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "datepicker__value",
              computed(state_, (d) =>
                d.value != null ? "" : "is-placeholder",
              ),
            ]),
          }),
          ui.DateRangePickerPrimitive.Icon(
            { class: "datepicker__icon" },
            [Icon({ name: "calendar", size: 16 })],
          ),
        ],
      ),
      ui.DateRangePickerPrimitive.Content(
        {
          ...rest,
          animation: { in: "is-enter", out: "is-exit" },
          store,
          class: computed(presence_, (d) =>
            [
              "popover",
              "datepicker",
              "is-range",
              d.visible ? "is-open" : "",
              cls,
            ]
              .filter(Boolean)
              .join(" "),
          ),
        },
        () => [
          ui.DateRangePickerPrimitive.Calendars(
            { store, class: "datepicker__calendars" },
            [
              CalendarPanel({ store, side: "left" }),
              CalendarPanel({ store, side: "right" }),
            ],
          ),
        ],
      ),
    ],
  );
}
