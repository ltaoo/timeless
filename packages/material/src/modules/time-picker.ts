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

import { PICKER_ANIMATION } from "./date-picker";

/** 选项行高（px），必须与 time-picker.css 里 .m3-timepicker__option 的高度一致。 */
const ITEM_HEIGHT = 36;
/** 选中项滚动到视口内时预留的上方条目数。 */
const SCROLL_PADDING_ITEMS = 2;

function scroll_to_index(view$: vm.ScrollViewCore, index: number) {
  const safe_index = index >= 0 ? index : 0;
  const top = Math.max(0, (safe_index - SCROLL_PADDING_ITEMS) * ITEM_HEIGHT);
  view$.setScrollTop(top);
}

function mount_column(
  view$: vm.ScrollViewCore,
  list: number[],
  target: number | null,
) {
  const index = typeof target === "number" ? list.indexOf(target) : -1;
  setTimeout(() => {
    if (index !== -1) scroll_to_index(view$, index);
  }, 0);
}

/**
 * 时 / 分 / 秒三列（ScrollViewPrimitive.Root + option 列表）。
 *
 * TimePicker 与 DateTimePicker 共用：两者只有外层容器与是否显示秒的差别，
 * 列本身的结构、选中态与滚动定位完全一致，故抽到此处。
 * 类名沿用 time-picker.css 的 `.m3-timepicker__columns` / `__column` / `__option`。
 */
export function TimeColumns(props: {
  store: vm.TimePickerCore;
  state_: any;
  class?: string;
}) {
  const { store, state_, class: cls } = props;

  const hours = store.generateHours();
  const minutes = store.generateMinutes();
  const seconds = store.generateSeconds();
  const show_seconds = store.showSeconds;

  const hourview$ = new vm.ScrollViewCore({});
  const minuteview$ = new vm.ScrollViewCore({});
  const secondview$ = new vm.ScrollViewCore({});

  function options(
    kind: "hour" | "minute" | "second",
    list: number[],
    field: "tempHour" | "tempMinute" | "tempSecond",
  ) {
    const Item = {
      hour: ui.TimePickerPrimitive.HourItem,
      minute: ui.TimePickerPrimitive.MinuteItem,
      second: ui.TimePickerPrimitive.SecondItem,
    }[kind];
    return For({
      each: list,
      render(value: number) {
        return Item(
          {
            store,
            value,
            class: classNames([
              "m3-timepicker__option",
              computed(state_, (s: any) => (s[field] === value ? "is-active" : "")),
            ]),
          },
          [String(value).padStart(2, "0")],
        );
      },
    });
  }

  return View(
    {
      class: classNames([
        "m3-timepicker__columns",
        show_seconds ? "is-with-seconds" : "",
        cls,
      ]),
    },
    [
      ui.ScrollViewPrimitive.Root(
        {
          store: hourview$,
          class: "m3-timepicker__column",
          onMounted() {
            mount_column(hourview$, hours, store.state.tempHour);
          },
        },
        [options("hour", hours, "tempHour")],
      ),
      ui.ScrollViewPrimitive.Root(
        {
          store: minuteview$,
          class: "m3-timepicker__column",
          onMounted() {
            mount_column(minuteview$, minutes, store.state.tempMinute);
          },
        },
        [options("minute", minutes, "tempMinute")],
      ),
      Show({
        when: show_seconds,
        ok() {
          return [
            ui.ScrollViewPrimitive.Root(
              {
                store: secondview$,
                class: "m3-timepicker__column",
                onMounted() {
                  mount_column(secondview$, seconds, store.state.tempSecond);
                },
              },
              [options("second", seconds, "tempSecond")],
            ),
          ];
        },
      }),
    ],
  );
}

/**
 * TimePicker · Material 3
 *
 * 类名：.m3-timepicker（触发器）+ .m3-timepicker__content（浮层，28px 圆角）
 *   + .m3-timepicker__display（顶部大字号时间）+ .m3-timepicker__columns
 *   + .m3-timepicker__column（细滚动条）+ .m3-timepicker__option（hover/pressed
 *     走 state layer）+ .m3-timepicker__footer / __action。
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
    presence_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  const show_seconds_ = store.showSeconds;
  const empty_text_ = show_seconds_ ? "--:--:--" : "--:--";

  return ui.TimePickerPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
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
      ui.TimePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "m3-timepicker",
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
              "m3-timepicker__value",
              computed(has_value_, (v) => (v ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.TimePickerPrimitive.Clear(
                  { store, class: "m3-timepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.TimePickerPrimitive.Icon(
                  {
                    class: classNames([
                      "m3-timepicker__icon",
                      computed(presence_, (d) => (d.visible ? "is-open" : "")),
                    ]),
                  },
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
          animation: PICKER_ANIMATION,
          store,
          class: "m3-timepicker__content",
        },
        () => [
          View({ class: "m3-timepicker__body" }, [
            View({ class: "m3-timepicker__display" }, [
              computed(state_, (s: any) => {
                const h = s.tempHour;
                const m = s.tempMinute;
                const sec = s.tempSecond;
                if (h == null || m == null) return empty_text_;
                if (show_seconds_ && sec == null) return empty_text_;
                const hh = String(h).padStart(2, "0");
                const mm = String(m).padStart(2, "0");
                if (show_seconds_) {
                  return `${hh}:${mm}:${String(sec).padStart(2, "0")}`;
                }
                return `${hh}:${mm}`;
              }),
            ]),
            TimeColumns({ store, state_ }),
          ]),
          View({ class: "m3-timepicker__footer" }, [
            ui.TimePickerPrimitive.ClearButton(
              { store, class: "m3-timepicker__action" },
              ["清除"],
            ),
            ui.TimePickerPrimitive.ConfirmButton(
              {
                store,
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
