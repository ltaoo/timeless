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

/**
 * Cascader · Material 3
 *
 * 类名：.m3-cascader（触发器）+ .m3-cascader__content（浮层，28px 圆角）
 *   + .m3-cascader__search / __results / __result
 *   + .m3-cascader__panels / __panel / __item（hover 用 state layer）
 *   + .m3-cascader__item.is-active（--secondary-container 底）
 *   + .m3-cascader__path（搜索结果的路径文字）。
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
    {
      hovering: hovering_,
      allow_clear: allow_clear_,
      has_value: has_value_,
    },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );
  const panels_hidden_ = computed(
    state_,
    (d) => !!(d.search && d.searchKeyword),
  );

  const listener$ = ListenerManager([
    state_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
    panels_hidden_,
  ]);

  return ui.CascaderPrimitive.Root(
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
      ui.CascaderPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "m3-cascader",
            computed(state_, (d) => (d.open ? "is-open" : "")),
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
              "m3-cascader__value",
              computed(has_value_, (v) => (v ? "" : "is-placeholder")),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.CascaderPrimitive.Clear(
                  { store, class: "m3-cascader__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.CascaderPrimitive.Icon(
                  {
                    class: classNames([
                      "m3-cascader__icon",
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
          animation: PICKER_ANIMATION,
          store,
          class: "m3-cascader__content",
        },
        () => [
          ui.CascaderPrimitive.Search({
            store,
            class: "m3-cascader__search",
          }),
          ui.CascaderPrimitive.SearchResults(
            { store, class: "m3-cascader__results" },
            [
              For({
                each: computed(state_, (d) => d.searchResults),
                render(result: { path: any[]; value: any[] }) {
                  return ui.CascaderPrimitive.SearchResultItem(
                    {
                      store,
                      result,
                      class: "m3-cascader__result",
                    },
                    [
                      View({ as: "span", class: "m3-cascader__path" }, [
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
                "m3-cascader__panels",
                computed(panels_hidden_, (v) => (v ? "is-hidden" : "")),
              ]),
            },
            [
              For({
                key: "key",
                each: computed(state_, (d) => d.panels),
                render(_: any, idx: any) {
                  const cur_panel_ = combine({ state: state_, idx }, (t) => {
                    return t.state.panels[t.idx] ?? null;
                  });
                  const options_ = computed(cur_panel_, (t) => {
                    return t ? t.options : [];
                  });
                  return View({ class: "m3-cascader__panel" }, [
                    For({
                      key: "value",
                      each: options_,
                      render(option: any) {
                        const matched_ = computed(cur_panel_, (t) => {
                          return t
                            ? t.options.find(
                                (o: any) => o.value === option.value,
                              )
                            : null;
                        });
                        return ui.CascaderPrimitive.Item(
                          {
                            store,
                            panelIndex: idx.value,
                            option,
                            class: classNames([
                              "m3-cascader__item",
                              computed(matched_, (d: any) => {
                                const names: string[] = [];
                                if (d ? d.selected : false) {
                                  names.push("is-active");
                                }
                                if (d ? d.focused : false) {
                                  names.push("is-focused");
                                }
                                if (d ? d.disabled : false) {
                                  names.push("is-disabled");
                                }
                                return names.join(" ");
                              }),
                            ]),
                          },
                          [
                            ui.CascaderPrimitive.ItemText(
                              { class: "m3-cascader__item-text" },
                              [option.label],
                            ),
                            ui.CascaderPrimitive.ItemIndicator(
                              {
                                store,
                                hasChildren: Boolean(
                                  option.children &&
                                    option.children.length > 0,
                                ),
                                class: "m3-cascader__item-arrow",
                              },
                              [Icon({ name: "chevron-right", size: 16 })],
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
      ),
    ],
  );
}
