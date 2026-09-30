import { ui, vm } from "@timeless/timeless";
import {
  For,
  Fragment,
  Icon,
  ListenerManager,
  Show,
  View,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

/**
 * Select 系列的共享渲染逻辑（Fluent 2 · fl-select__*）。
 *
 * Select 与 SearchSelect 的面板结构完全一致（Viewport > 条目列表 / 空态），
 * 差别只在触发区。把条目渲染抽到这里，避免两处各写一份。
 */

export function renderSelectOption(
  select$: vm.SelectCore<any>,
  option: vm.SelectItemCore<any>,
): any {
  const item_ = refobj(option.state);
  const item_listener$ = ListenerManager([item_]);
  item_listener$.add(
    option.onStateChange((v) => {
      item_.as(v);
    }),
  );
  return ui.SelectPrimitive.Item(
    {
      select$,
      item$: option,
      class: classNames([
        "fl-select__item",
        computed(item_, (t) => (t.selected ? "is-selected" : "")),
        computed(item_, (t) => (!t.disabled && t.focused ? "is-focused" : "")),
        computed(item_, (t) => (t.disabled ? "is-disabled" : "")),
      ]),
      onUnmounted() {
        item_listener$.destroy();
      },
    },
    [
      ui.SelectPrimitive.ItemIndicator(
        { store: option, class: "fl-select__item-indicator" },
        [Icon({ name: "check", size: 14 })],
      ),
      ui.SelectPrimitive.ItemText({ class: "fl-select__item-text" }, [
        option.label,
      ]),
    ],
  );
}

export function renderSelectEntry(
  select$: vm.SelectCore<any>,
  entry: vm.SelectItemCore<any> | vm.SelectGroupCore<any>,
): any {
  if (entry && entry instanceof vm.SelectGroupCore) {
    return Fragment({}, [
      Show({
        when: !!entry.label,
        ok() {
          const label_content =
            typeof entry.label === "function" ? entry.label() : entry.label;
          return [
            View({ class: "fl-select__group-label" }, [label_content]),
          ];
        },
      }),
      For({
        key: "value",
        each: entry.options || [],
        render: (e: vm.SelectItemCore<any> | vm.SelectGroupCore<any>) =>
          renderSelectEntry(select$, e),
      }),
    ]);
  }
  return renderSelectOption(select$, entry as vm.SelectItemCore<any>);
}

/**
 * 面板内容：Viewport + 加载态 / 条目列表 / 空态。
 *
 * 注意：For 必须常驻挂载，不能塞进 Show 的某个分支里。搜索时
 * startSearch/finishSearch 会让 loading 反复 true/false，一旦 For 处在
 * 被 Show 切换的分支内，重建时旧列表不会被清理，条目会不断叠加。
 */
export function SelectPanel(props: {
  store: vm.SelectCore<any>;
  entries: any;
  loading?: any;
  class?: any;
}): any {
  const { store, entries, loading, class: cls } = props;
  return ui.SelectPrimitive.Viewport(
    { store, class: classNames(["fl-select__viewport", cls]) },
    [
      Show({
        when: computed(loading, (t: any) => !!t),
        ok() {
          return [View({ class: "fl-select__loading" }, ["加载中..."])];
        },
      }),
      For({
        each: entries,
        render: (e: any) => renderSelectEntry(store, e),
      }),
      Show({
        when: computed(entries, (list: any[]) => list.length === 0),
        ok() {
          return [View({ class: "fl-select__empty" }, ["暂无数据"])];
        },
      }),
    ],
  );
}
