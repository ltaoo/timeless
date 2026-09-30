import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  Show,
  ViewProps,
  classNames,
  combine,
  computed,
  ref,
  refobj,
} from "@timeless/timeless";
import { SelectPanel } from "./select-shared";

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
    { allow_clear: allow_clear_, has_value: has_value_, is_loading: is_loading_, is_disabled: is_disabled_, hovering: hovering_ },
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
            "form-select",
            computed(state_, (t) => (t.focused ? "is-focused" : "")),
            computed(state_, (t) => (t.disabled ? "is-disabled" : "")),
            computed(state_, (t) =>
              t.status === "error" ? "is-invalid" : "",
            ),
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
                  class: "select-search",
                }),
              ];
            },
            else() {
              return [
                ui.SelectPrimitive.Value({
                  store,
                  class: classNames([
                    "select-value",
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
                ui.SelectPrimitive.Clear(
                  { store, class: "select-clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.SelectPrimitive.Icon(
                  {
                    store,
                    class: classNames([
                      "select-icon",
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
        { ...rest, store, class: "select-content" },
        () => [
          SelectPanel({
            store,
            entries: entries_,
            loading: computed(state_, (t) => !!t.loading),
          }),
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
