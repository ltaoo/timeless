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
 * Cascader · Animal Island
 *
 * 结构：.animal-cascader（触发器）> __value + 清除/箭头
 *       .animal-cascader__content
 *         ├─ .animal-cascader__search（可选）
 *         ├─ .animal-cascader__search-results > .animal-cascader__search-result > .animal-cascader__path
 *         └─ .animal-cascader__panel × N > .animal-cascader__item（+ .is-active 左侧 4px 薄荷青 --primary 指示条）
 *
 * 触发器按输入盒处理（2.5px --input 描边、胶囊圆角、--control-height 高）。
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
            "animal-cascader",
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
              "animal-cascader__value",
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
                  { store, class: "animal-cascader__clear" },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                ui.CascaderPrimitive.Icon(
                  {
                    class: classNames([
                      "animal-cascader__icon",
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
          class: "animal-cascader__content",
        },
        () => [
          ui.CascaderPrimitive.Search({
            store,
            class: "animal-cascader__search",
          }),
          ui.CascaderPrimitive.SearchResults(
            { store, class: "animal-cascader__search-results" },
            [
              For({
                each: computed(state_, (d: any) => d.searchResults),
                render(result: { path: any[]; value: any[] }) {
                  return ui.CascaderPrimitive.SearchResultItem(
                    { store, result, class: "animal-cascader__search-result" },
                    [
                      View(
                        { as: "span", class: "animal-cascader__path" },
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
                  ? "animal-cascader__panels is-hidden"
                  : "animal-cascader__panels",
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
                  return View({ class: "animal-cascader__panel" }, [
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
                              "animal-cascader__item",
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
                              { class: "animal-cascader__item-text" },
                              [option.label],
                            ),
                            ui.CascaderPrimitive.ItemIndicator(
                              {
                                store,
                                hasChildren: Boolean(
                                  option.children &&
                                    option.children.length > 0,
                                ),
                                class: "animal-cascader__item-indicator",
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
