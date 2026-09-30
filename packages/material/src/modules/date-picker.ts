import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  classNames,
  combine,
  computed,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/** 浮层进出场类名（CSS 里对应 .is-enter / .is-exit 的关键帧）。 */
export const PICKER_ANIMATION = { in: "is-enter", out: "is-exit" };

/**
 * DatePicker · Material 3
 *
 * 类名：.m3-datepicker（触发器，沿用 outlined 输入框指标）
 *   + .m3-datepicker__content（浮层：--surface-container-high + --elevation-3 + 28px 圆角）
 *   + .m3-datepicker__header / __title / __nav / __weekdays / __weekday
 *   + .m3-datepicker__grid / __week / __cell（40px 圆形 cell）
 *
 * cell 状态：.is-active（--primary 填充）/ .is-today（1px --primary 描边）/
 * .is-outside（相邻月份）。hover / pressed 走 state layer（::before）。
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
  const allow_clear_ = computed(state_, (d) => d.allowClear || false);
  const has_value_ = computed(state_, (d) => d.value != null);
  const show_clear_ = combine(
    {
      hovering: hovering_,
      allow_clear: allow_clear_,
      has_value: has_value_,
    },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );

  const listener$ = ListenerManager([
    state_,
    calendar_state_,
    presence_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  const weeks_ = computed(calendar_state_, (s) => s.weeks);

  return ui.DatePickerPrimitive.Root(
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
      ui.DatePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "m3-datepicker",
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
              "m3-datepicker__value",
              computed(has_value_, (v) => (v ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.DatePickerPrimitive.Clear(
                  { store, class: "m3-datepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.DatePickerPrimitive.Icon(
                  {
                    class: classNames([
                      "m3-datepicker__icon",
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
          animation: PICKER_ANIMATION,
          store,
          class: "m3-datepicker__content",
        },
        () => [
          ui.DatePickerPrimitive.Calendar(
            { store, class: "m3-datepicker__calendar" },
            [
              View({ class: "m3-datepicker__header" }, [
                ui.DatePickerPrimitive.CalendarPrevButton(
                  { store, class: "m3-datepicker__nav" },
                  [Icon({ name: "chevron-left", size: 18 })],
                ),
                ui.DatePickerPrimitive.CalendarHeader({
                  store,
                  class: "m3-datepicker__title",
                }),
                ui.DatePickerPrimitive.CalendarNextButton(
                  { store, class: "m3-datepicker__nav" },
                  [Icon({ name: "chevron-right", size: 18 })],
                ),
              ]),
              ui.DatePickerPrimitive.CalendarGrid(
                { store, class: "m3-datepicker__grid" },
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
                              store,
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
        ],
      ),
    ],
  );
}

/**
 * 单个日期 cell 的渲染。date-picker / date-time-picker 两处结构一致，
 * 只有 block 前缀不同，故抽成共享函数。
 */
export function render_cell(
  store: any,
  calendar_state_: any,
  day: any,
  block: string,
): any {
  const cell_class = computed(calendar_state_, (s: any) => {
    const names: string[] = [];
    const selected = s.selectedDay ? s.selectedDay.time === day.time : false;
    if (selected) names.push("is-active");
    if (day.is_today) names.push("is-today");
    if (day.is_prev_month || day.is_next_month) names.push("is-outside");
    return names.filter(Boolean).join(" ");
  });

  return ui.DatePickerPrimitive.CalendarCell(
    {
      store,
      value: day.value,
      isToday: day.is_today,
      isPrevMonth: day.is_prev_month,
      isNextMonth: day.is_next_month,
      class: classNames([`${block}__cell`, cell_class]),
    },
    [day.text],
  );
}
