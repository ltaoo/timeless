import { ui, vm } from "@timeless/timeless";
import {
  For,
  Fragment,
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
 * Material 3 下拉选择：触发器沿用 outlined 输入框的盒子指标，
 * 面板用 --surface-container 浮层 + --elevation-2 阴影，选中项 --secondary-container。
 */
export function Select(
  props: ViewProps & { store: vm.SelectCore<any>; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const hovering_ = ref(false);

  const allow_clear_ = computed(state_, (d) => d.allowClear);
  const has_value_ = computed(state_, (d) => d.value != null);
  const is_loading_ = computed(state_, (d) => d.loading || false);
  const is_disabled_ = computed(state_, (d) => d.disabled || false);

  const show_clear_ = combine(
    {
      allow_clear: allow_clear_,
      has_value: has_value_,
      is_loading: is_loading_,
      is_disabled: is_disabled_,
      hovering: hovering_,
    },
    (t) =>
      t.hovering &&
      t.allow_clear &&
      t.has_value &&
      !t.is_loading &&
      !t.is_disabled,
  );

  const listener$ = ListenerManager([
    state_,
    show_clear_,
    hovering_,
    allow_clear_,
    has_value_,
    is_loading_,
    is_disabled_,
  ]);

  const methods = {
    render_opt(option: vm.SelectItemCore<any>) {
      const item_ = refobj(option.state);
      const item_listener$ = ListenerManager([item_]);
      item_listener$.add(
        option.onStateChange((v) => {
          item_.as(v);
        }),
      );
      return ui.SelectPrimitive.Item(
        {
          select$: store,
          item$: option,
          class: classNames([
            "m3-select__item",
            computed(item_, (t) => (t.selected ? "is-selected" : "")),
            computed(item_, (t) =>
              !t.disabled && t.focused ? "is-focused" : "",
            ),
            computed(item_, (t) => (t.disabled ? "is-disabled" : "")),
          ]),
          onUnmounted() {
            item_listener$.destroy();
          },
        },
        [
          ui.SelectPrimitive.ItemIndicator(
            { store: option, class: "m3-select__item-indicator" },
            [Icon({ name: "check", size: 14 })],
          ),
          ui.SelectPrimitive.ItemText({ class: "m3-select__item-text" }, [
            option.label,
          ]),
        ],
      );
    },
    render_entry(entry: vm.SelectItemCore<any> | vm.SelectGroupCore<any>) {
      if (entry && entry instanceof vm.SelectGroupCore) {
        return Fragment({}, [
          Show({
            when: !!entry.label,
            ok() {
              const label_content =
                typeof entry.label === "function" ? entry.label() : entry.label;
              return [View({ class: "m3-select__group-label" }, [label_content])];
            },
          }),
          For({
            key: "value",
            each: entry.options || [],
            render: methods.render_entry,
          }),
        ]);
      }
      return methods.render_opt(entry as vm.SelectItemCore<any>);
    },
  };

  const entries_ = computed(state_, (t) => t.options);
  listener$.add(entries_);

  return ui.SelectPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        return listener$.destroy;
      },
    },
    [
      ui.SelectPrimitive.Trigger(
        {
          id,
          store,
          class: classNames([
            "m3-select",
            computed(state_, (t) => (t.focused ? "is-focused" : "")),
            computed(state_, (t) => (t.disabled ? "is-disabled" : "")),
            computed(state_, (t) => (t.status === "error" ? "is-invalid" : "")),
            computed(state_, (t) => (t.open ? "is-open" : "")),
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
          Show({
            when: computed(state_, (t) => !!t.search),
            ok() {
              return [
                ui.SelectPrimitive.Search({
                  store,
                  class: "m3-select__search",
                }),
              ];
            },
            else() {
              return [
                ui.SelectPrimitive.Value({
                  store,
                  class: classNames([
                    "m3-select__value",
                    computed(state_, (t) =>
                      hasItemWithValue(t.options, t.value)
                        ? ""
                        : "is-placeholder",
                    ),
                  ]),
                }),
              ];
            },
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.SelectPrimitive.Clear({ store, class: "m3-select__clear" }, [
                  Icon({ name: "circle-x", size: 16 }),
                ]),
              ];
            },
            else() {
              return [
                ui.SelectPrimitive.Icon(
                  {
                    store,
                    class: classNames([
                      "m3-select__icon",
                      computed(state_, (t) => (t.open ? "is-open" : "")),
                    ]),
                  },
                  [Icon({ name: "chevron-down", size: 16 })],
                ),
              ];
            },
          }),
        ],
      ),
      ui.SelectPrimitive.Content(
        { ...rest, store, class: "m3-select__content" },
        () => [
          ui.SelectPrimitive.Viewport({ store, class: "m3-select__viewport" }, [
            Show({
              when: computed(state_, (t) => !!t.loading),
              ok() {
                return [View({ class: "m3-select__loading" }, ["加载中..."])];
              },
              else() {
                return [
                  Show({
                    when: computed(entries_, (list) => list.length > 0),
                    ok() {
                      return [
                        For({
                          each: entries_,
                          render: methods.render_entry,
                        }),
                      ];
                    },
                    else() {
                      return [View({ class: "m3-select__empty" }, ["暂无数据"])];
                    },
                  }),
                ];
              },
            }),
          ]),
        ],
      ),
    ],
  );
}

function hasItemWithValue(
  entries: (vm.SelectGroupCore<any> | vm.SelectItemCore<any>)[],
  value: any,
): boolean {
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry instanceof vm.SelectGroupCore) {
      if (hasItemWithValue(entry.options, value)) return true;
    } else if (entry instanceof vm.SelectItemCore && entry.value === value) {
      return true;
    }
  }
  return false;
}
