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
 * TimePicker · Animal Island
 *
 * 结构：.animal-timepicker（触发器）> __value + 图标/清除
 *       .animal-timepicker__content（浮层）
 *         ├─ .animal-timepicker__preview   当前临时时间
 *         ├─ .animal-timepicker__columns > .animal-timepicker__column（时/分/秒三列滚动）
 *         └─ .animal-timepicker__footer > .animal-timepicker__action
 *
 * 选中项（.is-active）用左侧 4px 薄荷青（--primary）指示条，与 Menu 一致。
 *
 * 三列滚动区抽成 `TimeColumns` 导出，供 date-time-picker 复用。
 */

const ITEM_HEIGHT = 32;
const SCROLL_PADDING_ITEMS = 2;

function scrollToIndex(view$: vm.ScrollViewCore, index: number) {
  const safeIndex = index >= 0 ? index : 0;
  const top = Math.max(0, (safeIndex - SCROLL_PADDING_ITEMS) * ITEM_HEIGHT);
  view$.setScrollTop(top);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatTempTime(
  store: vm.TimePickerCore,
  s: { t_hour: number | null; t_minute: number | null; t_second: number | null },
) {
  const empty = store.showSeconds ? "--:--:--" : "--:--";
  if (s.t_hour == null || s.t_minute == null) return empty;
  if (store.showSeconds && s.t_second == null) return empty;
  if (store.showSeconds) {
    return `${pad(s.t_hour)}:${pad(s.t_minute)}:${pad(s.t_second as number)}`;
  }
  return `${pad(s.t_hour)}:${pad(s.t_minute)}`;
}

export function TimePreview(props: { store: vm.TimePickerCore; class?: any }) {
  const { store, class: cls } = props;
  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  return View(
    {
      class: classNames(["animal-timepicker__preview", cls]),
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
      },
      onUnmounted() {
        listener$.destroy();
      },
    },
    [
      computed(state_, (s: any) =>
        formatTempTime(store, {
          t_hour: s.tempHour,
          t_minute: s.tempMinute,
          t_second: s.tempSecond,
        }),
      ),
    ],
  );
}

export function TimeColumns(props: {
  store: vm.TimePickerCore;
  hourview$: vm.ScrollViewCore;
  minuteview$: vm.ScrollViewCore;
  secondview$: vm.ScrollViewCore;
  class?: any;
}) {
  const { store, hourview$, minuteview$, secondview$, class: cls } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  const renderColumn = (opts: {
    view$: vm.ScrollViewCore;
    values: number[];
    active_key: "tempHour" | "tempMinute" | "tempSecond";
    component: any;
    border?: boolean;
    onMount(itemIndex: number): void;
  }) => {
    const { view$, values, active_key, component, border, onMount } = opts;
    return View(
      {
        class: classNames([
          "animal-timepicker__column",
          border ? "is-bordered" : "",
        ]),
      },
      [
        ui.ScrollViewPrimitive.Root(
          {
            store: view$,
            class: "animal-timepicker__scroll",
            onMounted() {
              onMount(
                typeof store.state[active_key] === "number"
                  ? values.indexOf(store.state[active_key] as number)
                  : -1,
              );
            },
          },
          [
            For({
              each: values,
              render(value: number) {
                return component(
                  {
                    store,
                    value,
                    class: classNames([
                      "animal-timepicker__option",
                      computed(state_, (s: any) =>
                        s[active_key] === value ? "is-active" : "",
                      ),
                    ]),
                  },
                  [pad(value)],
                );
              },
            }),
          ],
        ),
      ],
    );
  };

  return View(
    {
      class: classNames(["animal-timepicker__columns", cls]),
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
      },
      onUnmounted() {
        listener$.destroy();
      },
    },
    [
      renderColumn({
        view$: hourview$,
        values: store.generateHours(),
        active_key: "tempHour",
        component: ui.TimePickerPrimitive.HourItem,
        onMount(index) {
          setTimeout(() => scrollToIndex(hourview$, index), 0);
        },
      }),
      renderColumn({
        view$: minuteview$,
        values: store.generateMinutes(),
        active_key: "tempMinute",
        component: ui.TimePickerPrimitive.MinuteItem,
        border: store.showSeconds,
        onMount(index) {
          setTimeout(() => scrollToIndex(minuteview$, index), 0);
        },
      }),
      Show({
        when: store.showSeconds,
        ok() {
          return [
            renderColumn({
              view$: secondview$,
              values: store.generateSeconds(),
              active_key: "tempSecond",
              component: ui.TimePickerPrimitive.SecondItem,
              onMount(index) {
                setTimeout(() => scrollToIndex(secondview$, index), 0);
              },
            }),
          ];
        },
      }),
    ],
  );
}

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
  const allow_clear_ = computed(state_, (d: any) => d.allowClear || false);
  const has_value_ = computed(state_, (d: any) => d.value != null);
  const show_clear_ = combine(
    { hovering: hovering_, allow_clear: allow_clear_, has_value: has_value_ },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );

  const hourview$ = new vm.ScrollViewCore({});
  const minuteview$ = new vm.ScrollViewCore({});
  const secondview$ = new vm.ScrollViewCore({});

  const listener$ = ListenerManager([
    state_,
    presence_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  return ui.TimePickerPrimitive.Root(
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
      ui.TimePickerPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "animal-timepicker",
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
          ui.TimePickerPrimitive.Value({
            store,
            placeholder,
            class: classNames([
              "animal-timepicker__value",
              computed(state_, (d: any) => (d.value != null ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.TimePickerPrimitive.Clear(
                  { store, class: "animal-timepicker__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.TimePickerPrimitive.Icon(
                  { class: "animal-timepicker__icon" },
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
          store,
          class: "animal-timepicker__content",
        },
        () => [
          View({ class: "animal-timepicker__panel" }, [
            TimePreview({ store }),
            TimeColumns({ store, hourview$, minuteview$, secondview$ }),
            View({ class: "animal-timepicker__footer" }, [
              ui.TimePickerPrimitive.ClearButton(
                { store, class: "animal-timepicker__action" },
                ["清除"],
              ),
              ui.TimePickerPrimitive.ConfirmButton(
                { store, class: "animal-timepicker__action is-primary" },
                ["确定"],
              ),
            ]),
          ]),
        ],
      ),
    ],
  );
}
