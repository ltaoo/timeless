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
 * Cascader · Fluent 2
 *
 * 结构：.fl-cascader（触发器）> __value + 清除/箭头
 *       .fl-cascader__content
 *         ├─ .fl-cascader__search（可选）
 *         ├─ .fl-cascader__search-results > .fl-cascader__search-result > .fl-cascader__path
 *         └─ .fl-cascader__panel × N > .fl-cascader__item（+ .is-active 左侧 3px --compound-brand）
 *
 * 触发器与 select 同盒子指标（1px --stroke1、4px 圆角、32px 高）。
 */
export function Cascader(
  props: ViewProps & { store: vm.CascaderCore<any>; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  const hovering_ = ref(false);

  const allow_clear_ = computed(state_, (d: any) => d.allowClear);
  const has_value_ = computed(
    state_,
    (d: any) => d.value != null && d.value.length > 0,
  );
  const show_clear_ = combine(
    { hovering: hovering_, allow_clear: allow_clear_, has_value: has_value_ },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );

  const listener$ = ListenerManager([
    state_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  const panels_ = computed(state_, (d: any) => d.panels);

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
            "fl-cascader",
            computed(state_, (d: any) => (d.open ? "is-open" : "")),
            computed(state_, (d: any) => (d.disabled ? "is-disabled" : "")),
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
              "fl-cascader__value",
              computed(state_, (d: any) =>
                d.value != null && d.value.length > 0 ? "" : "is-placeholder",
              ),
            ]),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                ui.CascaderPrimitive.Clear(
                  { store, class: "fl-cascader__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.CascaderPrimitive.Icon(
                  {
                    class: classNames([
                      "fl-cascader__icon",
                      computed(state_, (d: any) => (d.open ? "is-open" : "")),
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
          class: "fl-cascader__content",
        },
        () => [
          ui.CascaderPrimitive.Search({
            store,
            class: "fl-cascader__search",
          }),
          ui.CascaderPrimitive.SearchResults(
            { store, class: "fl-cascader__search-results" },
            [
              For({
                each: computed(state_, (d: any) => d.searchResults),
                render(result: { path: any[]; value: any[] }) {
                  return ui.CascaderPrimitive.SearchResultItem(
                    { store, result, class: "fl-cascader__search-result" },
                    [
                      View(
                        { as: "span", class: "fl-cascader__path" },
                        [result.path.map((o) => o.label).join(" / ")],
                      ),
                    ],
                  );
                },
              }),
            ],
          ),
          // 面板区：搜索命中时隐藏
          View(
            {
              class: computed(state_, (d: any) =>
                d.search && d.searchKeyword
                  ? "fl-cascader__panels is-hidden"
                  : "fl-cascader__panels",
              ),
            },
            [
              For({
                key: "key",
                each: panels_,
                render(panel: any, idx: any) {
                  const cur_panel = combine(
                    { state: state_, idx },
                    (t: any) => t.state.panels[t.idx] ?? null,
                  );
                  const options = computed(cur_panel, (t: any) =>
                    t ? t.options : [],
                  );
                  return View({ class: "fl-cascader__panel" }, [
                    For({
                      key: "value",
                      each: options,
                      render(option: any) {
                        const matched_opt = computed(
                          cur_panel,
                          (t: any) =>
                            t
                              ? t.options.find(
                                  (o: any) => o.value === option.value,
                                )
                              : null,
                        );
                        return ui.CascaderPrimitive.Item(
                          {
                            store,
                            panelIndex: idx.value,
                            option,
                            class: classNames([
                              "fl-cascader__item",
                              computed(matched_opt, (opt: any) => {
                                if (!opt) return "";
                                return [
                                  opt.disabled ? "is-disabled" : "",
                                  opt.selected ? "is-selected" : "",
                                  opt.focused ? "is-active" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ");
                              }),
                            ]),
                          },
                          [
                            ui.CascaderPrimitive.ItemText(
                              { class: "fl-cascader__item-text" },
                              [option.label],
                            ),
                            ui.CascaderPrimitive.ItemIndicator(
                              {
                                store,
                                hasChildren: Boolean(
                                  option.children &&
                                    option.children.length > 0,
                                ),
                                class: "fl-cascader__item-indicator",
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
