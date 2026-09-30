import { ui, vm } from "@timeless/timeless";
import {
  CascaderOption,
  classNames,
  combine,
  computed,
  Icon,
  ListenerManager,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";

/**
 * Cascader · Bootstrap 5.3
 *
 * 触发器沿用 .form-control（.cascader__trigger 补 flex），弹层复用 .popover。
 * 逐级面板 .cascader__panel > .cascader__item，展开 / 选中态 .is-active，
 * 顶部展示已选路径 .cascader__path；开启 search 时渲染搜索框与结果列表。
 */
export function Cascader(
  props: ViewProps & { store: vm.CascaderCore<any>; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const hovering_ = ref(false);

  const allow_clear_ = computed(state_, (d) => d.allowClear);
  const has_value_ = computed(
    state_,
    (d) => d.value != null && d.value.length > 0,
  );
  const show_clear_ = combine(
    { hovering: hovering_, allowClear: allow_clear_, hasValue: has_value_ },
    (t) => t.hovering && t.allowClear && t.hasValue,
  );

  const listener$ = ListenerManager([
    state_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  return ui.CascaderPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.append([store.onStateChange((v) => state_.as(v))]);
        return listener$.destroy;
      },
    },
    [
      ui.CascaderPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "form-control",
            "cascader__trigger",
            computed(state_, (d) => (d.open ? "is-open" : "")),
            computed(state_, (d) => (d.disabled ? "is-disabled" : "")),
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
          ui.CascaderPrimitive.Value({
            store,
            class: classNames([
              "cascader__value",
              computed(state_, (d) =>
                d.value != null && d.value.length > 0 ? "" : "is-placeholder",
              ),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.CascaderPrimitive.Clear(
                  { store, class: "cascader__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.CascaderPrimitive.Icon(
                  {
                    class: classNames([
                      "cascader__icon",
                      computed(state_, (d) => (d.open ? "is-open" : "")),
                    ]),
                  },
                  [Icon({ name: "chevron-down", size: 16 })],
                ),
              ];
            },
          }),
        ],
      ),
      ui.CascaderPrimitive.Content(
        {
          ...rest,
          animation: { in: "is-enter", out: "is-exit" },
          store,
          class: classNames([
            "popover",
            "cascader",
            computed(state_, (d) => (d.open ? "is-open" : "")),
            cls,
          ]),
        },
        () => [
          ui.CascaderPrimitive.Search({
            store,
            class: "cascader__search",
          }),
          ui.CascaderPrimitive.SearchResults(
            { store, class: "cascader__search-results" },
            [
              For({
                each: computed(state_, (d) => d.searchResults),
                render(result: { path: CascaderOption<any>[]; value: any[] }) {
                  return ui.CascaderPrimitive.SearchResultItem(
                    {
                      store,
                      result,
                      class: "cascader__item",
                    },
                    [
                      View({ as: "span", class: "cascader__path" }, [
                        result.path.map((o) => o.label).join(" / "),
                      ]),
                    ],
                  );
                },
              }),
            ],
          ),
          View(
            {
              class: classNames([
                "cascader__panels",
                computed(state_, (d) =>
                  d.search && d.searchKeyword ? "is-hidden" : "",
                ),
              ]),
            },
            [
              For({
                key: "key",
                each: computed(state_, (d) => d.panels) as any,
                render(_: any, idx: any) {
                  const cur_panel = combine({ state: state_, idx }, (t) => {
                    return t.state.panels[t.idx] ?? null;
                  });
                  const options = computed(cur_panel, (t) => (t ? t.options : []));
                  return View(
                    { class: "cascader__panel" },
                    [
                      For({
                        key: "value",
                        each: options as any,
                        render(
                          option: CascaderOption<any> & {
                            selected: boolean;
                            focused: boolean;
                          },
                        ) {
                          return ui.CascaderPrimitive.Item(
                            {
                              store,
                              panelIndex: idx.value,
                              option,
                              class: classNames([
                                "cascader__item",
                                computed(cur_panel, (t: any) => {
                                  const opt = t
                                    ? t.options.find(
                                        (o: any) => o.value === option.value,
                                      )
                                    : null;
                                  const is_selected = opt
                                    ? Boolean(opt.selected)
                                    : false;
                                  const is_focused = opt
                                    ? Boolean(opt.focused)
                                    : false;
                                  const disabled = opt
                                    ? Boolean(opt.disabled)
                                    : false;
                                  return [
                                    disabled ? "is-disabled" : "",
                                    is_selected || is_focused
                                      ? "is-active"
                                      : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ");
                                }),
                              ]),
                            },
                            [
                              ui.CascaderPrimitive.ItemText(
                                { class: "cascader__item-text" },
                                [option.label],
                              ),
                              ui.CascaderPrimitive.ItemIndicator(
                                {
                                  store,
                                  hasChildren: Boolean(
                                    option.children &&
                                      option.children.length > 0,
                                  ),
                                  class: "cascader__item-indicator",
                                },
                                [Icon({ name: "chevron-right", size: 16 })],
                              ),
                            ],
                          );
                        },
                      }),
                    ],
                  );
                },
              }),
            ],
          ),
        ],
      ),
    ],
  );
}
