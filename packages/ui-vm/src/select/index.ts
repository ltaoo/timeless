import { BaseDomain, Handler, Platform } from "@timeless/base";

import { InputCore } from "@/input/index";
import { PopperCore } from "@/popper/index";
import { Rect } from "@/popper/types";
import { DismissableLayerCore } from "@/dismissable-layer/index";
import { Direction } from "@/direction/index";
import { PresenceCore } from "@/presence/index";
import { Logger } from "@/util";

import { SelectContentCore } from "./content";
import { SelectViewportCore } from "./viewport";
import { SelectTriggerCore } from "./trigger";
import { SelectWrapCore } from "./wrap";
import { SelectItemCore } from "./item";
import { SelectGroupCore } from "./group";
import { ScrollViewCore } from "@/scroll-view";

const logger = Logger({ prefix: "vm", scope: "select/index" });

enum Events {
  StateChange,
  SearchChange,
  Change,
  Focus,
  Blur,
  Placed,
}
type TheTypesOfEvents<T> = {
  [Events.StateChange]: SelectState<T>;
  [Events.Change]: T | null;
  [Events.SearchChange]: string;
  [Events.Focus]: void;
  [Events.Blur]: void;
  [Events.Placed]: void;
};

// export type SelectOption<T> = { value: T; label: string; disabled?: boolean };
// enum SelectEntryType {
//   Group = "group",
//   Option = "option",
// }
// export type SelectEntry<T> = MutableRecord2<{
//   [SelectEntryType.Option]: SelectItemCore<T>;
//   [SelectEntryType.Group]: SelectGroupCore<T>;
// }>;
// type SelectOptionState<T> = {
//   type: SelectEntryType.Option;
//   idx: number;
//   value: T;
//   label: string;
//   selected: boolean;
//   focused: boolean;
//   disabled: boolean;
//   key?: any;
// };
// type SelectGroupState<T> = {
//   type: SelectEntryType.Group;
//   idx: number;
//   label?: unknown;
//   key: any;
//   items: SelectEntryState<T>[];
// };
// type SelectEntryState<T> = SelectOptionState<T> | SelectGroupState<T>;

type SelectProps<T> = {
  id?: string;
  defaultValue: T | null;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  // options: SelectItemCore<T>[];
  options?: (SelectGroupCore<T> | SelectItemCore<T>)[];
  platform?: Platform;
  /** Select 所在的可滚动容器 */
  view$?: ScrollViewCore;
  /** 是否支持搜索过滤 */
  search?: InputCore<any>;
  /** 搜索框占位符 */
  // searchPlaceholder?: string;
  /** 定位模式 */
  position?: "popper" | "item-aligned";
  onChange?: (v: T | null) => void;
};
type SelectState<T> = {
  options: (SelectGroupCore<T> | SelectItemCore<T>)[];
  // entries: SelectEntryState<T>[];
  value: T | null;
  // value2: SelectOption<T> | null;
  selectedOption: SelectItemCore<T> | null;
  allowClear: boolean;
  /** 菜单是否展开 */
  open: boolean;
  /** 加载中 */
  loading: boolean;
  /** 提示 */
  placeholder: string;
  /** 禁用 */
  disabled: boolean;
  focused: boolean;
  /** 是否必填 */
  required: boolean;
  dir: Direction;
  // styles: Partial<CSSStyleDeclaration>;
  enter: boolean;
  visible: boolean;
  exit: boolean;
  /** 是否启用搜索 */
  search: boolean;
};

export class SelectCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  shape = "select" as const;
  name = "SelectCore";
  debug = true;

  // options: { text: string; store: SelectItemCore<T> }[] = [];
  id = null;
  placeholder: string;
  // entries: SelectEntry<T>[] = [];
  options: SelectItemCore<T>[] = [];
  /** 保留原始的分组结构，供渲染使用 */
  raw_options: (SelectGroupCore<T> | SelectItemCore<T>)[] = [];
  defaultValue: T | null = null;
  value: T | null = null;
  disabled: boolean = false;
  focused = false;
  open: boolean = false;
  status: "error" | "success" | "normal" = "normal";
  allowClear: boolean = false;
  /** 加载中 */
  loading: boolean = false;
  /** 是否启用搜索 */
  search: boolean = false;
  // /** 搜索关键字 */
  // searchKeyword: string = "";
  // /** 搜索框占位符 */
  // searchPlaceholder: string = "搜索...";
  aligned: boolean = false;
  hasItemMounted = false;

  popper$: PopperCore;
  presence$ = new PresenceCore();
  layer$: DismissableLayerCore;
  search_input$ = new InputCore({ defaultValue: "", placeholder: "搜索" });
  // collection: CollectionCore;

  position: "popper" | "item-aligned" = "popper";

  reference: Rect | null = null;
  /** 触发按钮 */
  trigger: SelectTriggerCore | null = null;
  wrap: SelectWrapCore | null = null;
  /** 下拉列表 */
  content: SelectContentCore | null = null;
  /** 下拉列表容器 */
  viewport: SelectViewportCore | null = null;
  /** 选中的 item */
  selected_item$: SelectItemCore<T> | null = null;
  focused_item$: SelectItemCore<T> | null = null;

  _tmp_searching = false;
  _tmp_options: null | SelectItemCore<T>[] = null;
  input_dirty = false;
  can_search = true;

  // _findFirstValidItem = false;

  // private _isDisabledValue(value: T) {
  //   const matched = this.options.find((o) => o.value === value);
  //   return Boolean(matched?.disabled);
  // }

  /** 获取过滤后的选项 */
  // get filteredOptions() {
  //   if (!this.search || !this.searchKeyword) {
  //     return this.options;
  //   }
  //   const keyword = this.searchKeyword.toLowerCase();
  //   return this.options.filter((opt) =>
  //     opt.label.toLowerCase().includes(keyword),
  //   );
  // }

  get state(): SelectState<T> {
    // const optionByValue = new Map<any, SelectOptionState<T>>();
    // for (let i = 0; i < this.options.length; i += 1) {
    //   const opt = this.options[i];
    //   optionByValue.set(opt.value, opt);
    // }
    return {
      options: this.raw_options,
      placeholder: this.placeholder,
      value: this.value,
      selectedOption: this.selected_item$,
      allowClear: this.allowClear,
      focused: this.focused,
      open: this.open,
      loading: this.loading,
      disabled: this.disabled,
      required: false,
      dir: "ltr",
      enter: this.presence$.state.enter,
      visible: this.presence$.state.visible,
      exit: this.presence$.state.exit,
      search: this.search,
    };
  }

  constructor(props: Partial<{ _name: string }> & SelectProps<T>) {
    super(props);

    const {
      id,
      defaultValue,
      disabled = false,
      placeholder = "点击选择",
      allowClear = false,
      options = [],
      platform,
      view$,
      search,
      position = "item-aligned",
      onChange,
    } = props;

    this.position = position;
    this.search = !!search;
    this.raw_options = options;
    this.options = flatten_entries(options, { value: defaultValue });
    this.selected_item$ = this.options.find((opt) => opt.selected) ?? null;
    this.disabled = disabled;
    this.allowClear = allowClear;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.placeholder = placeholder;

    if (id !== undefined) {
      this.id = id;
    }
    if (search) {
      this.position = "popper";
      this.search_input$ = search;
      this.search_input$.onChange((v) => {
        this.emit(Events.SearchChange, v);
      });
    }

    this.popper$ = new PopperCore({
      align: "start",
      platform,
      view$,
      mode: this.position,
    });
    this.layer$ = new DismissableLayerCore();

    // this.collection = new CollectionCore();
    this.popper$.onReferenceMounted((reference) => {
      const { x, y, width, height } = reference.getRect();
      this.reference = {
        width,
        height,
        x,
        y,
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
      };
    });
    this.layer$.onDismiss(() => {
      console.log(...this.log("this.layer.onDismiss"));
      this.hide();
    });
    this.presence$.onStateChange(() =>
      this.emit(Events.StateChange, { ...this.state }),
    );
    this.search_input$.onChange(() => {
      this.input_dirty = true;
    });
    if (onChange) {
      this.onChange(onChange);
    }
  }

  mapViewModelWithIndex(index: number) {
    return this.options[index];
  }

  setTrigger(trigger: SelectTriggerCore) {
    this.trigger = trigger;
  }
  setWrap(wrap: SelectWrapCore) {
    this.wrap = wrap;
  }
  setContent(content: SelectContentCore) {
    this.content = content;
  }
  setViewport(viewport: SelectViewportCore) {
    this.viewport = viewport;
  }
  // setValue(value: SelectValueCore) {
  //   this.value = value;
  // }
  setSelectedItem(item: SelectItemCore<T>) {
    this.selected_item$ = item;
  }
  /**
   * 将 Select 对齐 下拉项列表 中的 选中项
   * 模拟原生 select 交互
   */
  alignSpecialItem(
    offsetTop: number,
    height: number,
    isFirst = false,
    isLast = false,
  ) {
    // this._selected_item = { offsetTop, height, isFirst, isLast };
    if (this.position !== "item-aligned" || !this.open) {
      return;
    }
    this.popper$.adjustContentPositionWithOffsetTop({
      selectedItem: {
        offsetTop,
        offsetHeight: height,
        bottom: offsetTop + height,
        isFirst,
        isLast,
      },
    });
  }
  async show() {
    logger.log("show", this.state, this.search);
    if (this.disabled) {
      return;
    }
    // if (this.open) {
    //   return;
    // }
    if (this.value !== null) {
      const focused_item$ = this.options.find((opt) => opt.focused);
      if (!focused_item$ || focused_item$.value !== this.value) {
        const matched_item$ = this.options.find(
          (opt) => opt.value === this.value,
        );
        if (matched_item$) {
          matched_item$.focus();
        }
      }
    }
    if (this.selected_item$) {
      this.popper$.setViewportOffsetTop(this.selected_item$.offsetTop - 24);
    }
    this.presence$.show();
    this.open = true;
    this.focused = true;
    if (this.search) {
      this.search_input$.focus();
    }
    this.emit(Events.StateChange, { ...this.state });
  }
  hide() {
    this.presence$.hide();
    // console.log(...this.log("hide", this));
    if (this.open === false) {
      return;
    }
    this.loading = false;
    this.open = false;
    this.focused = false;
    this.aligned = false;
    this.hasItemMounted = false;
    this._tmp_searching = false;
    if (this.input_dirty) {
      this.input_dirty = false;
      this.disableSearch();
      if (this.selected_item$) {
        setTimeout(() => {
          if (this._tmp_options) {
            this.options = this._tmp_options;
            logger.log("clear tmp_options");
            this._tmp_options = null;
          }
        }, 800);
        this.search_input$.setValue(this.selected_item$.label);
        this.search_input$.setPlaceholder(this.selected_item$.label);
      }
    }
    this.emit(Events.StateChange, { ...this.state });
  }
  addNativeOption() {}
  removeNativeOption() {}
  // appendItem(item: SelectItemCore<T>) {
  //   if (this.options.find((opt) => opt.store === item)) {
  //     return;
  //   }
  //   item.onLeave(() => {
  //     this.focus();
  //   });
  //   item.onUnmounted(() => {
  //     this.options = this.options.filter((opt) => opt.store !== item);
  //   });
  //   const findFirstValidItem = !this._findFirstValidItem && !this.state.disabled;
  //   if (findFirstValidItem) {
  //     this._findFirstValidItem = true;
  //   }
  //   const isSelected = this.state.value === item.state.value;
  //   if (findFirstValidItem || isSelected) {
  //     this.setSelectedItem(item);
  //   }
  //   this.options.push({
  //     text: item.text,
  //     store: item,
  //   });
  // }
  /** 选择 item */
  select(value: T) {
    if (this.value === value) {
      this.hide();
      return;
    }
    this.value = value;
    const matched = this.options.find((opt) => opt.value === value);
    if (matched) {
      if (this.selected_item$) {
        this.selected_item$.setSelected(false);
        this.selected_item$.setFocused(false);
      }
      matched.setSelected(true);
      matched.setFocused(true);
      this.selected_item$ = matched;
    }
    this.hide();
    this.emit(Events.Change, value);
    this.emit(Events.StateChange, { ...this.state });
  }
  focusSearchInput() {
    this.search_input$.focus();
  }
  focus() {
    this.emit(Events.Focus);
  }
  blurSearchInput() {
    // this.emit(Events.Blur);
  }
  blur() {
    this.emit(Events.Blur);
  }
  setOptions(options: NonNullable<SelectProps<T>["options"]>) {
    this.raw_options = options;
    this.options = flatten_entries(options, { value: this.value });
    // console.log("[DOMAIN]ui/select - setOptions", this.unique_id, this.value, options);
    if (this.value === null) {
      return;
    }
    const matched = this.options.find((opt) => opt.value === this.value);
    if (matched) {
      return;
    }
    this.value = null;
    // this.selected_item$ = null;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Change, this.value);
  }
  setId(v) {
    this.id = v;
  }
  setValue(v: T | null) {
    if (v === null) {
      this.value = null;
      this.selected_item$ = null;
      this.emit(Events.StateChange, { ...this.state });
      this.emit(Events.Change, v);
      return;
    }
    // const matched = this.options.find((opt) => opt.value === v);
    // console.log("[DOMAIN]ui/select - setValue", v, matched, this.options);
    // this.value = v;
    this.select(v);
    // this.emit(Events.Change, v);
    // this.emit(Events.StateChange, { ...this.state });
  }
  setStatus(status: "error" | "success" | "normal") {
    this.status = status;
    this.emit(Events.StateChange, { ...this.state });
  }
  clear() {
    this.value = null;
    this.selected_item$ = null;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Change, this.value);
  }
  /** 设置加载状态 */
  setLoading(loading: boolean) {
    if (this.loading === loading) {
      return;
    }
    this.loading = loading;
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 设置搜索关键字 */
  setSearchKeyword(keyword: string) {
    if (this.search_input$.value === keyword) {
      return;
    }
    this.search_input$.setValue(keyword);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 清空搜索关键字 */
  clearSearch() {
    if (this.search_input$.value === "") {
      return;
    }
    this.search_input$.setValue("");
    this.emit(Events.StateChange, { ...this.state });
  }
  enableSearch() {
    this.can_search = true;
  }
  disableSearch() {
    this.can_search = false;
  }
  canSearch() {
    return this.can_search;
  }
  startSearch() {
    logger.log(
      "startSearch save tmp_options",
      this.loading,
      this.options.length,
    );
    if (this.loading) {
      return;
    }
    this.loading = true;
    if (!this._tmp_searching) {
      this._tmp_options = [...this.options];
      this._tmp_searching = true;
    }
    // this.value = null;
    // this.selected_item$ = null;
    this.emit(Events.StateChange, { ...this.state });
  }
  finishSearch() {
    this.loading = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  focusOption(value: T) {
    const foucse_cur_focused_item =
      this.focused_item$ && this.focused_item$.value === value;
    // logger.log("focus option", value, foucse_cur_focused_item);
    if (foucse_cur_focused_item) {
      return;
    }
    const matched = this.options.find((opt) => opt.value === value);
    // logger.log("prepare focus option", value, matched);
    if (matched) {
      if (this.focused_item$) {
        this.focused_item$.blur();
      }
      if (this.selected_item$) {
        this.selected_item$.setFocused(false);
      }
      this.focused_item$ = matched;
      this.focused_item$.setFocused(true);
    }
    // this.emit(Events.StateChange, { ...this.state });
  }
  blurOption(value: T) {
    // logger.log("prepare blur option", value, this.focused_item$);
    if (this.focused_item$ && this.focused_item$.value === value) {
      this.focused_item$.setFocused(false);
      this.focused_item$ = null;
    }
  }
  /** 获取当前焦点选项的索引 */
  getFocusedIndex(): number {
    const options = this.options;
    return options.findIndex((opt) => opt.focused);
  }
  /** 聚焦下一个选项 */
  focusNextOption() {
    const options = this.options;
    if (options.length === 0) return;

    const currentIndex = this.getFocusedIndex();
    for (let i = 0; i < options.length; i += 1) {
      const idx =
        currentIndex < 0 ? i : (currentIndex + 1 + i) % options.length;
      const nextOption = options[idx];
      if (nextOption && !nextOption.disabled) {
        this.focusOption(nextOption.value);
        break;
      }
    }
  }
  /** 聚焦上一个选项 */
  focusPrevOption() {
    const options = this.options;
    if (options.length === 0) return;

    const currentIndex = this.getFocusedIndex();
    for (let i = 0; i < options.length; i += 1) {
      const idx =
        currentIndex < 0
          ? options.length - 1 - i
          : (currentIndex - 1 - i + options.length * 10) % options.length;
      const prevOption = options[idx];
      if (prevOption && !prevOption.disabled) {
        this.focusOption(prevOption.value);
        break;
      }
    }
  }
  /** 选择当前焦点的选项 */
  selectFocusedOption() {
    const options = this.options;
    const focusedOption = options.find((opt) => opt.focused);
    if (focusedOption) {
      if (focusedOption.disabled) {
        return;
      }
      this.select(focusedOption.value);
    }
  }
  setPosition(rect) {
    this.reference = rect;
    this.emit(Events.StateChange, { ...this.state });
  }
  refresh() {
    this.emit(Events.StateChange, { ...this.state });
  }

  handleFocus() {
    this.focused = true;
    if (this.presence$.state.visible) {
      return;
    }
    this.show();
  }
  handleBlur() {
    this.focused = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  handleClickTrigger() {
    logger.log("handleClickTrigger", this.disabled, this.open);
    if (this.disabled) {
      return;
    }
    if (this.open) {
      this.hide();
      return;
    }
    this.show();
  }
  handleClickItem(item$: SelectItemCore<T>) {
    if (item$.disabled) {
      return;
    }
    this.input_dirty = false;
    this.select(item$.value);
    if (this.search) {
      this.disableSearch();
      this.search_input$.setValue(item$.label);
      this.search_input$.setPlaceholder(item$.label);
    }
    this.hide();
  }
  handleMouseEnterItem(item$: SelectItemCore<T>) {
    if (item$.disabled) {
      return;
    }
    this.focusOption(item$.value);
  }
  handleMouseLeaveItem(item$: SelectItemCore<T>) {
    if (item$.disabled) {
      return;
    }
    this.blurOption(item$.value);
  }
  handleItemMounted(data: {
    offsetTop: number;
    height: number;
    store: SelectItemCore<T>;
  }) {
    data.store.handleMounted({
      offsetTop: data.offsetTop,
      height: data.height,
    });
    if (this.hasItemMounted) {
      return;
    }
    logger.log(
      "[]handle item mounted",
      data.store.label,
      data.offsetTop,
      data.height,
      this.selected_item$?.label,
    );
    this.hasItemMounted = true;
    if (this.position === "item-aligned") {
      const selected_item$ = this.selected_item$ || this.options[0];
      if (!selected_item$) {
        return;
      }
      const idx = this.options.findIndex((opt) => opt === selected_item$);
      const is_first = idx === 0;
      const is_last = idx === this.options.length - 1;
      const offset_top = idx * data.height + data.offsetTop;
      logger.log(
        "[]before alignSpecialItem",
        selected_item$.label,
        offset_top,
        data.height,
        is_first,
        is_last,
      );
      this.alignSpecialItem(offset_top, data.height, is_first, is_last);
      this.aligned = true;
    } else {
      // popper 模式下，在 floating mounted 后计算位置
      // if (this.aligned) {
      //   return;
      // }
      // this.popper$.place();
      // this.aligned = true;
    }
  }

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  onValueChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onSearchChange(handler: Handler<TheTypesOfEvents<T>[Events.SearchChange]>) {
    return this.on(Events.SearchChange, handler);
  }
  onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
}

type SelectInListProps<T = unknown> = {
  onChange: (record: T) => void;
} & SelectProps<T>;
type TheTypesInListOfEvents<K extends string, T> = {
  [Events.Change]: [K, T | null];
  [Events.StateChange]: SelectProps<T>;
};

export class SelectInListCore<K extends string, T> extends BaseDomain<
  TheTypesInListOfEvents<K, T>
> {
  options: SelectProps<T>["options"] = [];
  list: SelectCore<T>[] = [];
  cached = new Map<K, SelectCore<T>>();
  values: Map<K, T | null> = new Map();

  constructor(props: Partial<{ _name: string } & SelectInListProps<T>> = {}) {
    super(props);

    const { options = [] } = props;
    this.options = options;
  }

  bind(
    unique_id: K,
    extra?: {
      defaultValue: T | null;
    },
  ) {
    const { defaultValue } = extra || { defaultValue: null };
    const existing = this.cached.get(unique_id);
    // console.log("[DOMAIN]ui/select/index - bind", unique_id, existing, this.options);
    if (existing) {
      return existing;
    }
    const select = new SelectCore<T>({
      defaultValue,
      options: this.options,
      onChange: (value) => {
        this.values.set(unique_id, value);
        this.emit(Events.Change, [unique_id, value]);
      },
    });
    this.list.push(select);
    this.values.set(unique_id, defaultValue);
    this.cached.set(unique_id, select);
    return select;
  }
  setOptions(options: NonNullable<SelectProps<T>["options"]>) {
    // console.log("[DOMAIN]ui/select - SelectInListCore item count is", this.list.length);
    this.options = options;
    if (this.list.length === 0) {
      return;
    }
    for (let i = 0; i < this.list.length; i += 1) {
      const item = this.list[i];
      item.setOptions(options);
    }
  }
  setValue(v: T | null) {
    for (let i = 0; i < this.list.length; i += 1) {
      const item = this.list[i];
      item.setValue(v);
    }
  }
  getValue(key: K) {
    return this.values.get(key) ?? null;
  }
  clear() {
    this.list = [];
    this.cached = new Map();
    this.values = new Map();
  }
  toJson<R>(handler: (value: [K, T | null]) => R) {
    const result: R[] = [];
    for (const [obj, value] of this.values) {
      const r = handler([obj, value]);
      result.push(r);
    }
    return result;
  }
  /** 清空触发点击事件时保存的按钮 */
  // clear() {
  //   this.cur = null;
  // }

  onChange(handler: Handler<TheTypesInListOfEvents<K, T>[Events.Change]>) {
    this.on(Events.Change, handler);
  }
  onStateChange(
    handler: Handler<TheTypesInListOfEvents<K, T>[Events.StateChange]>,
  ) {
    this.on(Events.StateChange, handler);
  }
}

export { SelectGroupCore };
export { clamp } from "./utils";

function flatten_entries<T>(
  entries: (SelectGroupCore<T> | SelectItemCore<T>)[],
  extra: { value: T | null },
): SelectItemCore<T>[] {
  const result: SelectItemCore<T>[] = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry instanceof SelectGroupCore) {
      const items_in_group = entry.options;
      result.push(...flatten_entries(items_in_group, extra));
      continue;
    }
    if (entry.value === extra.value) {
      entry.setSelected(true);
    }
    result.push(entry);
  }
  return result;
}

// function build_entries_state<T>(
//   entries: SelectEntry<T>[],
//   option_by_value: Map<any, SelectOptionState<T>>,
//   prefix = "",
// ): SelectEntryState<T>[] {
//   const result: SelectEntryState<T>[] = [];
//   for (let i = 0; i < entries.length; i += 1) {
//     const entry = entries[i];
//     if (entry.type === SelectEntryType.Group) {
//       const group_key = `${prefix}g:${entry.label ?? ""}:${i}`;
//       result.push({
//         type: SelectEntryType.Group,
//         idx: i,
//         label: entry.label,
//         key: group_key,
//         items: build_entries_state(
//           entry.items,
//           option_by_value,
//           `${group_key}/`,
//         ),
//       });
//       continue;
//     }
//     const option_key = `${prefix}o:${String(entry.value)}`;
//     const matched = option_by_value.get(entry.value);
//     result.push(
//       matched
//         ? { ...matched, key: option_key }
//         : {
//             type: SelectEntryType.Option,
//             idx: i,
//             value: entry.value,
//             label: entry.label,
//             selected: false,
//             focused: false,
//             disabled: !!(entry as any).disabled,
//             key: option_key,
//           },
//     );
//   }
//   return result;
// }
