import { ui, vm } from "@timeless/timeless";
import {
  classNames,
  combine,
  computed,
  Icon,
  ListenerManager,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";

const ITEM_HEIGHT = 32;
const SCROLL_PADDING_ITEMS = 2;

/**
 * TimePicker · Bootstrap 5.3
 *
 * 触发器沿用 .form-control（.timepicker__trigger 补 flex），弹层复用 .popover。
 * 时 / 分 / 秒各一列 (.timepicker__column)，列内选项 .timepicker__option，
 * 选中态 .is-active。列身是 ScrollViewCore，挂载时滚动到当前值。
 */
export function TimePicker(
  props: ViewProps & {
    store: vm.TimePickerCore;
    id?: string;
    placeholder?: string;
  },
) {
  const { store, id, placeholder = "选择时间", class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const presence_ = refobj(store.$presence.state);
  const hovering_ = ref(false);
  const listener$ = ListenerManager([state_, presence_, hovering_]);

  const allow_clear_ = computed(state_, (d) => d.allowClear || false);
  const has_value_ = computed(state_, (d) => d.value != null);
  const show_clear_ = combine(
    { hovering: hovering_, allowClear: allow_clear_, hasValue: has_value_ },
    (t) => t.hovering && t.allowClear && t.hasValue,
  );
  listener$.append([allow_clear_, has_value_, show_clear_]);

  const empty_time_text = store.showSeconds ? "--:--:--" : "--:--";

  const hourview$ = new vm.ScrollViewCore({});
  const minuteview$ = new vm.ScrollViewCore({});
  const secondview$ = new vm.ScrollViewCore({});

  function format_temp_time(s: {
    t_hour: number | null;
    t_minute: number | null;
    t_second: number | null;
  }) {
    if (s.t_hour == null || s.t_minute == null) return empty_time_text;
    if (store.showSeconds && s.t_second == null) return empty_time_text;
    const h = String(s.t_hour).padStart(2, "0");
    const m = String(s.t_minute).padStart(2, "0");
    if (store.showSeconds) {
      return `${h}:${m}:${String(s.t_second).padStart(2, "0")}`;
    }
    return `${h}:${m}`;
  }

  function scroll_to_index(view$: vm.ScrollViewCore, index: number) {
    const safe = index >= 0 ? index : 0;
    const top = Math.max(0, (safe - SCROLL_PADDING_ITEMS) * ITEM_HEIGHT);
    view$.setScrollTop(top);
  }

  function renderColumn(
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
                store,
                value,
                class: classNames([
                  "timepicker__option",
                  computed(state_, () => (is_active(value) ? "is-active" : "")),
                ]),
              },
              [String(value).padStart(2, "0")],
            );
          },
        }),
      ],
    );
  }

  return ui.TimePickerPrimitive.Root(
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
      ui.TimePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "form-control",
            "timepicker__trigger",
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
          ui.TimePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "timepicker__value",
              computed(state_, (d) => (d.value != null ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.TimePickerPrimitive.Clear(
                  { store, class: "timepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.TimePickerPrimitive.Icon(
                  { class: "timepicker__icon" },
                  [Icon({ name: "clock", size: 16 })],
                ),
              ];
            },
          }),
        ],
      ),
      ui.TimePickerPrimitive.Content(
        {
          ...rest,
          animation: { in: "is-enter", out: "is-exit" },
          store,
          class: computed(presence_, (d) =>
            ["popover", "timepicker", d.visible ? "is-open" : "", cls]
              .filter(Boolean)
              .join(" "),
          ),
        },
        () => [
          ui.TimePickerPrimitive.TimePanel({ store, class: "timepicker__panel" }, [
            View(
              { class: "timepicker__header" },
              [
                combine({ time: state_ }, (t) =>
                  format_temp_time({
                    t_hour: t.time.tempHour,
                    t_minute: t.time.tempMinute,
                    t_second: t.time.tempSecond,
                  }),
                ),
              ],
            ),
            View(
              {
                class: classNames([
                  "timepicker__columns",
                  store.showSeconds ? "is-three" : "is-two",
                ]),
              },
              [
                renderColumn(
                  hourview$,
                  store.generateHours(),
                  store.state.tempHour,
                  (v) => store.state.tempHour === v,
                  ui.TimePickerPrimitive.HourItem,
                  "",
                ),
                renderColumn(
                  minuteview$,
                  store.generateMinutes(),
                  store.state.tempMinute,
                  (v) => store.state.tempMinute === v,
                  ui.TimePickerPrimitive.MinuteItem,
                  store.showSeconds ? "is-bordered" : "",
                ),
                Show({
                  when: store.showSeconds,
                  ok() {
                    return [
                      renderColumn(
                        secondview$,
                        store.generateSeconds(),
                        store.state.tempSecond,
                        (v) => store.state.tempSecond === v,
                        ui.TimePickerPrimitive.SecondItem,
                        "",
                      ),
                    ];
                  },
                }),
              ],
            ),
            View({ class: "timepicker__footer" }, [
              ui.TimePickerPrimitive.ClearButton(
                { store, class: "btn btn-outline-secondary btn-sm" },
                ["清除"],
              ),
              ui.TimePickerPrimitive.ConfirmButton(
                { store, class: "btn btn-primary btn-sm" },
                ["确定"],
              ),
            ]),
          ]),
        ],
      ),
    ],
  );
}
