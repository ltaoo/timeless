import { ui, vm } from "@timeless/timeless";
import { combine, computed, Icon, ListenerManager, ref, refobj } from "@timeless/timeless";
import { For, Show, View, ViewProps, classNames } from "@timeless/timeless";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/**
 * DatePicker · Bootstrap 5.3
 *
 * 触发器沿用 .form-control 的盒子指标（.datepicker__trigger 补 flex 布局），
 * 弹层复用 .popover 的表面（背景 / 边框 / 阴影 / 进出场动画），再叠 .datepicker
 * 的日历网格。网格与单元格走 .datepicker__grid / .datepicker__cell。
 */
export function DatePicker(
  props: ViewProps & {
    store: vm.DatePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期", class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const calendar_state_ = refobj(store.$calendar.state);
  const presence_ = refobj(store.$presence.state);
  const hovering_ = ref(false);

  const listener$ = ListenerManager([
    state_,
    calendar_state_,
    presence_,
    hovering_,
  ]);

  const allow_clear_ = computed(state_, (d) => d.allowClear || false);
  const has_value_ = computed(state_, (d) => d.value != null);
  const show_clear_ = combine(
    { hovering: hovering_, allowClear: allow_clear_, hasValue: has_value_ },
    (t) => t.hovering && t.allowClear && t.hasValue,
  );
  listener$.append([allow_clear_, has_value_, show_clear_]);

  return ui.DatePickerPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.append([
          store.onStateChange((v) => state_.as(v)),
          store.$calendar.onChange((v) => calendar_state_.as(v)),
          store.$presence.onStateChange((v) => presence_.as(v)),
        ]);
        return listener$.destroy;
      },
    },
    [
      ui.DatePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "form-control",
            "datepicker__trigger",
            computed(presence_, (d) => (d.visible ? "is-open" : "")),
            cls,
          ]),
          onMouseEnter() {
            hovering_.as(true);
          },
          onMouseLeave() {
            hovering_.as(false);
          },
        },
        [
          ui.DatePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "datepicker__value",
              computed(state_, (d) => (d.value != null ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.DatePickerPrimitive.Clear(
                  { store, class: "datepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.DatePickerPrimitive.Icon(
                  {
                    class: classNames([
                      "datepicker__icon",
                      computed(presence_, (d) => (d.visible ? "is-open" : "")),
                    ]),
                  },
                  [Icon({ name: "calendar", size: 16 })],
                ),
              ];
            },
          }),
        ],
      ),
      ui.DatePickerPrimitive.Content(
        {
          ...rest,
          animation: { in: "is-enter", out: "is-exit" },
          store,
          class: computed(presence_, (d) =>
            ["popover", "datepicker", d.visible ? "is-open" : "", cls]
              .filter(Boolean)
              .join(" "),
          ),
        },
        () => [
          ui.DatePickerPrimitive.Calendar({ store, class: "datepicker__calendar" }, [
            View({ class: "datepicker__header" }, [
              ui.DatePickerPrimitive.CalendarPrevButton(
                { store, class: "datepicker__nav" },
                [Icon({ name: "chevron-left", size: 16 })],
              ),
              ui.DatePickerPrimitive.CalendarHeader({
                store,
                class: "datepicker__title",
              }),
              ui.DatePickerPrimitive.CalendarNextButton(
                { store, class: "datepicker__nav" },
                [Icon({ name: "chevron-right", size: 16 })],
              ),
            ]),
            ui.DatePickerPrimitive.CalendarGrid({ store, class: "datepicker__grid" }, [
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
                            store,
                            value: day.value,
                            isToday: day.is_today,
                            isPrevMonth: day.is_prev_month,
                            isNextMonth: day.is_next_month,
                            class: classNames([
                              "datepicker__cell",
                              computed(calendar_state_, (s) => {
                                const is_selected = s.selectedDay?.time === day.time;
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
            ]),
          ]),
        ],
      ),
    ],
  );
}
