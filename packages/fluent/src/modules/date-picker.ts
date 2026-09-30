import { ui, vm } from "@timeless/timeless";
import {
  For,
  Icon,
  ListenerManager,
  Show,
  View,
  ViewProps,
  classNames,
  combine,
  computed,
  ref,
  refobj,
} from "@timeless/timeless";

/**
 * DatePicker · Fluent 2
 *
 * 结构：.fl-datepicker（触发器）> .fl-datepicker__value + 图标/清除
 *       .fl-datepicker__content（浮层，--surface-1 + 1px --stroke1 + 8px 圆角 + --shadow-16）
 *         └─ .fl-datepicker__calendar > __header(__nav + __title) + __grid
 *
 * Fluent 的 Calendar 用「圆角方块」表达日期格：32px 方形、4px 圆角；
 * 选中 = --compound-brand 填充 + 白字；今天 = 1px --compound-brand 描边；
 * 非当月 = --foreground-3。
 *
 * 日历面板抽成 `DateCalendarPanel` 导出，供 date-time-picker 复用。
 */

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function DateCalendarPanel(props: { store: vm.DatePickerCore; class?: any }) {
  const { store, class: cls } = props;

  const calendar_state_ = refobj(store.$calendar.state);
  const listener$ = ListenerManager([calendar_state_]);

  return View(
    {
      class: classNames(["fl-datepicker__calendar", cls]),
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
      // 头部：上一月 / 标题 / 下一月
      View({ class: "fl-datepicker__header" }, [
        ui.DatePickerPrimitive.CalendarPrevButton(
          { store, class: "fl-datepicker__nav" },
          [Icon({ name: "chevron-left", size: 16 })],
        ),
        ui.DatePickerPrimitive.CalendarHeader({
          store,
          class: "fl-datepicker__title",
        }),
        ui.DatePickerPrimitive.CalendarNextButton(
          { store, class: "fl-datepicker__nav" },
          [Icon({ name: "chevron-right", size: 16 })],
        ),
      ]),
      // 网格：星期表头 + 6 周
      ui.DatePickerPrimitive.CalendarGrid(
        { store, class: "fl-datepicker__grid" },
        [
          View(
            { class: "fl-datepicker__weekdays" },
            WEEKDAYS.map((day) =>
              View({ as: "span", class: "fl-datepicker__weekday" }, [day]),
            ),
          ),
          For({
            each: computed(calendar_state_, (s: any) => s.weeks),
            render(week: any) {
              return View({ class: "fl-datepicker__week" }, [
                For({
                  each: computed(week, (t: any) => t.dates),
                  render(day: any) {
                    return ui.DatePickerPrimitive.CalendarCell(
                      {
                        store,
                        value: day.value,
                        isToday: day.is_today,
                        isPrevMonth: day.is_prev_month,
                        isNextMonth: day.is_next_month,
                        class: computed(calendar_state_, (s: any) => {
                          const isSelected = s.selectedDay?.time === day.time;
                          return [
                            "fl-datepicker__cell",
                            isSelected ? "is-active" : "",
                            day.is_today ? "is-today" : "",
                            day.is_prev_month || day.is_next_month
                              ? "is-outside"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ");
                        }),
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
  );
}

export function DatePicker(
  props: ViewProps & {
    store: vm.DatePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择日期", class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const presence_ = refobj(store.$presence.state);

  const hovering_ = ref(false);
  const allow_clear_ = computed(state_, (d: any) => d.allowClear || false);
  const has_value_ = computed(state_, (d: any) => d.value != null);
  const show_clear_ = combine(
    { hovering: hovering_, allow_clear: allow_clear_, has_value: has_value_ },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );

  const listener$ = ListenerManager([
    state_,
    presence_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  return ui.DatePickerPrimitive.Root(
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
      ui.DatePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "fl-datepicker",
            computed(presence_, (d: any) => (d.visible ? "is-open" : "")),
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
              "fl-datepicker__value",
              computed(state_, (d: any) => (d.value != null ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.DatePickerPrimitive.Clear(
                  { store, class: "fl-datepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.DatePickerPrimitive.Icon(
                  { class: "fl-datepicker__icon" },
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
          store,
          class: "fl-datepicker__content",
        },
        () => [DateCalendarPanel({ store })],
      ),
    ],
  );
}
