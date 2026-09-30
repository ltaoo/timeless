import { ui, vm } from "@timeless/timeless";
import { Icon, classNames, computed, refobj } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";
import { SelectPanel } from "./select-shared";

/**
 * SearchSelect · Animal Island
 *
 * 触发器沿用 .animal-select 的盒子指标（2.5px --input 描边 / 胶囊圆角 /
 * --control-height），内部换成 .animal-select__search 输入框，下拉面板同样是
 * .animal-select__content（样式复用 select.css）。
 *
 * 与 Select 的区别：触发区固定渲染搜索框，展开时把触发器注册为 popper 的
 * reference，使面板宽度与触发器对齐。
 */
export function SearchSelect<T>(
  props: ViewProps & {
    store: vm.SelectCore<T>;
  },
  _children?: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  store.onStateChange((next) => {
    state_.as(next);
  });

  const entries_ = computed(state_, (t: any) => t.options);

  return ui.SelectPrimitive.Root({ store }, [
    View(
      {
        class: classNames([
          "animal-select",
          "animal-select--search",
          computed(state_, (s) => (s.open || s.focused ? "is-focused" : "")),
          computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
          cls,
        ]),
        onMounted(el) {
          if (
            !el ||
            typeof el !== "object" ||
            !("getBoundingClientRect" in el)
          ) {
            return;
          }
          const elm = el as unknown as HTMLElement;
          store.popper$.setReference(
            {
              $el: elm,
              getRect() {
                return elm.getBoundingClientRect();
              },
            },
            { force: true },
          );
        },
        onPointerDown(e) {
          const target = e.target as any;
          if (target && target.tagName === "INPUT") {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (!store.open && !store.disabled) {
            store.show();
          }
        },
      },
      [
        ui.SelectPrimitive.Search({ store, class: "animal-select__search" }),
        ui.SelectPrimitive.Icon(
          { store, class: "animal-select__icon" },
          [Icon({ name: "chevron-down", size: 16 })],
        ),
      ],
    ),
    ui.SelectPrimitive.Content(
      {
        ...rest,
        store,
        class: "animal-select__content",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0 ? { "min-width": `${width}px` } : {};
        }),
      },
      [
        SelectPanel({
          store,
          entries: entries_,
          loading: computed(state_, (t: any) => !!t.loading),
        }),
      ],
    ),
  ]);
}
