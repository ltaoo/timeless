import { BaseDomain, Handler } from "@timeless/base";

import { PopperCore } from "@/popper";
import { CollectionCore } from "@/collection";
import { DismissableLayerCore } from "@/dismissable-layer";
import { PopoverCore } from "@/popover";
import { Direction } from "@/direction";
import { PresenceCore } from "@/presence";
import { Rect } from "@/popper/types";

import { SelectContentCore } from "./content";
import { SelectViewportCore } from "./viewport";
import { SelectValueCore } from "./value";
import { SelectTriggerCore } from "./trigger";
import { SelectWrapCore } from "./wrap";
import { SelectItemCore } from "./item";
import { SelectGroupCore } from "./group";
import { clamp } from "./utils";
import { InputCore } from "@/input";

const CONTENT_MARGIN = 10;
enum Events {
  StateChange,
  Change,
  Focus,
  Blur,
  Placed,
}
type TheTypesOfEvents<T> = {
  [Events.StateChange]: SelectState<T>;
  [Events.Change]: T | null;
  [Events.Focus]: void;
  [Events.Blur]: void;
  [Events.Placed]: void;
};

export type SelectOption<T> = { value: T; label: string; disabled?: boolean };
export type SelectEntry<T> = SelectOption<T> | SelectGroupCore<T>;
type SelectOptionState<T> = {
  value: T;
  label: string;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
  key?: any;
};
type SelectGroupState<T> = {
  type: "group";
  label?: unknown;
  key: any;
  items: SelectEntryState<T>[];
};
type SelectEntryState<T> = SelectOptionState<T> | SelectGroupState<T>;

type SelectProps<T> = {
  id?: string;
  defaultValue: T | null;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  // options: SelectItemCore<T>[];
  options?: SelectEntry<T>[];
  onChange?: (v: T | null) => void;
  /** 是否支持搜索过滤 */
  search?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
};
type SelectState<T> = {
  options: SelectOptionState<T>[];
  entries: SelectEntryState<T>[];
  /** 过滤后的选项列表 */
  // filteredOptions: {
  //   value: T;
  //   label: string;
  //   selected: boolean;
  //   focused: boolean;
  // }[];
  value: T | null;
  value2: SelectOption<T> | null;
  /** 菜单是否展开 */
  open: boolean;
  /** 加载中 */
  loading: boolean;
  /** 提示 */
  placeholder: string;
  /** 禁用 */
  disabled: boolean;
  /** 是否必填 */
  required: boolean;
  dir: Direction;
  styles: Partial<CSSStyleDeclaration>;
  enter: boolean;
  visible: boolean;
  exit: boolean;
  /** 是否启用搜索 */
  search: boolean;
  allowClear: boolean;
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索框占位符 */
  searchPlaceholder: string;
};

function flattenEntries<T>(entries: SelectEntry<T>[]): SelectOption<T>[] {
  const result: SelectOption<T>[] = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry instanceof SelectGroupCore) {
      result.push(...flattenEntries(entry.items));
      continue;
    }
    result.push(entry);
  }
  return result;
}

function buildEntriesState<T>(
  entries: SelectEntry<T>[],
  optionByValue: Map<any, SelectOptionState<T>>,
  prefix = "",
): SelectEntryState<T>[] {
  const result: SelectEntryState<T>[] = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry instanceof SelectGroupCore) {
      const groupKey = `${prefix}g:${entry.label ?? ""}:${i}`;
      result.push({
        type: "group",
        label: entry.label,
        key: groupKey,
        items: buildEntriesState(entry.items, optionByValue, `${groupKey}/`),
      });
      continue;
    }
    const optionKey = `${prefix}o:${String(entry.value)}`;
    const matched = optionByValue.get(entry.value);
    result.push(
      matched
        ? { ...matched, key: optionKey }
        : {
            value: entry.value,
            label: entry.label,
            selected: false,
            focused: false,
            disabled: !!(entry as any).disabled,
            key: optionKey,
          },
    );
  }
  return result;
}

export class SelectCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  shape = "select" as const;
  name = "SelectCore";
  debug = true;

  // options: { text: string; store: SelectItemCore<T> }[] = [];
  id = null;
  placeholder: string;
  entries: SelectEntry<T>[] = [];
  options: SelectOptionState<T>[] = [];
  defaultValue: T | null = null;
  value: T | null = null;
  disabled: boolean = false;
  open: boolean = false;
  allowClear: boolean = false;
  /** 加载中 */
  loading: boolean = false;
  /** 是否启用搜索 */
  search: boolean = false;
  // /** 搜索关键字 */
  // searchKeyword: string = "";
  // /** 搜索框占位符 */
  // searchPlaceholder: string = "搜索...";

  popper: PopperCore;
  presence = new PresenceCore();
  // collection: CollectionCore;
  layer: DismissableLayerCore;
  input = new InputCore({ defaultValue: "", placeholder: "搜索" });

  position: "popper" | "item-aligned" = "popper";

  /** 参考点位置 */
  triggerPos: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0,
  };
  reference: Rect | null = null;
  /** 触发按钮 */
  trigger: SelectTriggerCore | null = null;
  wrap: SelectWrapCore | null = null;
  /** 下拉列表 */
  content: SelectContentCore | null = null;
  /** 下拉列表容器 */
  viewport: SelectViewportCore | null = null;
  /** 选中的 item */
  selectedItem: SelectItemCore<T> | null = null;

  _findFirstValidItem = false;

  private _isDisabledValue(value: T) {
    const matched = this.options.find((o) => o.value === value);
    return Boolean(matched?.disabled);
  }

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
    const optionByValue = new Map<any, SelectOptionState<T>>();
    for (let i = 0; i < this.options.length; i += 1) {
      const opt = this.options[i];
      optionByValue.set(opt.value, opt);
    }
    return {
      options: this.options,
      entries: buildEntriesState(this.entries, optionByValue),
      // filteredOptions: this.filteredOptions,
      value: this.value,
      value2: this.options.find((opt) => opt.value === this.value) ?? null,
      open: this.open,
      loading: this.loading,
      disabled: this.disabled,
      placeholder: this.placeholder,
      required: false,
      dir: "ltr",
      styles: {},
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
      search: this.search,
      allowClear: this.allowClear,
      searchKeyword: this.input.value,
      searchPlaceholder: this.input.placeholder,
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
      onChange,
      search = false,
      searchPlaceholder = "搜索...",
    } = props;
    // console.log("[DOMAIN]ui/select/index - constructor", defaultValue);
    this.search = search;
    this.input.setPlaceholder(searchPlaceholder);
    this.entries = options;
    const flatOptions = flattenEntries(options);
    this.options = flatOptions.map((opt, i) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.value === defaultValue,
        focused: i === 0,
        disabled: !!opt.disabled,
      };
    });
    if (id !== undefined) {
      this.id = id;
    }
    this.disabled = disabled;
    this.allowClear = allowClear;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.placeholder = placeholder;
    const matched = this.options.find((opt) => opt.value === defaultValue);
    if (matched) {
      this.emit(Events.StateChange, { ...this.state });
      this.emit(Events.Change, defaultValue);
    }
    this.popper = new PopperCore({
      align: "start",
    });
    this.layer = new DismissableLayerCore();
    // this.collection = new CollectionCore();
    this.popper.onReferenceMounted((reference) => {
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
    this.layer.onDismiss(() => {
      console.log(...this.log("this.layer.onDismiss"));
      this.hide();
    });
    this.presence.onStateChange(() =>
      this.emit(Events.StateChange, { ...this.state }),
    );
    if (onChange) {
      this.onChange(onChange);
    }
  }
  mapViewModelWithIndex(index: number) {
    return this.options[index];
  }

  setTriggerPointerDownPos(pos: { x: number; y: number }) {
    this.triggerPos = pos;
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
    this.selectedItem = item;
  }
  async show() {
    // console.log(...this.log("show", this.state));
    if (this.disabled) {
      return;
    }
    // if (this.open) {
    //   return;
    // }
    if (this.value !== null) {
      if (this._isDisabledValue(this.value)) {
        this.presence.show();
        this.popper.place();
        this.open = true;
        this.emit(Events.StateChange, { ...this.state });
        return;
      }
      const focused = this.options.find((opt) => opt.focused);
      if (!focused || focused.value !== this.value) {
        this.options = this.options.map((opt) => {
          return {
            label: opt.label,
            value: opt.value,
            selected: opt.selected,
            focused: opt.value === this.value,
            disabled: opt.disabled,
          };
        });
      }
    }
    this.presence.show();
    this.popper.place();
    // await sleep(800);
    this.open = true;
    // this.position();
    this.emit(Events.StateChange, { ...this.state });
  }
  hide() {
    this.presence.hide();
    // console.log(...this.log("hide", this));
    if (this.open === false) {
      return;
    }
    this.open = false;
    // 关闭时清空搜索关键字
    this.input.setValue("");
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
    if (this._isDisabledValue(value)) {
      return;
    }
    // if (item.state.selected) {
    //   this.hide();
    //   return;
    // }
    if (this.value === value) {
      this.hide();
      return;
    }
    this.value = value;
    this.options = this.options.map((opt) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.value === value,
        focused: opt.focused,
        disabled: opt.disabled,
      };
    });
    this.emit(Events.Change, value);
    this.emit(Events.StateChange, { ...this.state });
    this.hide();
  }
  focus() {
    this.emit(Events.Focus);
  }
  blur() {
    this.emit(Events.Blur);
  }
  setOptions(options: NonNullable<SelectProps<T>["options"]>) {
    this.entries = options;
    const flatOptions = flattenEntries(options);
    this.options = flatOptions.map((opt) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.value === this.value,
        focused: false,
        disabled: !!opt.disabled,
      };
    });
    // console.log("[DOMAIN]ui/select - setOptions", this.unique_id, this.value, options);
    if (this.value === null) {
      return;
    }
    const matched = this.options.find((opt) => opt.value === this.value);
    if (matched) {
      return;
    }
    this.value = null;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Change, this.value);
  }
  setId(v) {
    this.id = v;
  }
  setValue(v: T | null) {
    if (v === null) {
      this.value = null;
      this.emit(Events.StateChange, { ...this.state });
      this.emit(Events.Change, v);
      return;
    }
    // const matched = this.options.find((opt) => opt.value === v);
    // console.log("[DOMAIN]ui/select - setValue", v, matched, this.options);
    this.value = v;
    this.options = this.options.map((opt) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.value === this.value,
        focused: opt.focused,
        disabled: opt.disabled,
      };
    });
    this.emit(Events.Change, v);
    this.emit(Events.StateChange, { ...this.state });
  }
  clear() {
    this.value = null;
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
    if (this.input.value === keyword) {
      return;
    }
    this.input.setValue(keyword);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 清空搜索关键字 */
  clearSearch() {
    if (this.input.value === "") {
      return;
    }
    this.input.setValue("");
    this.emit(Events.StateChange, { ...this.state });
  }
  focusOption(value: T) {
    if (this._isDisabledValue(value)) {
      return;
    }
    // 检查是否需要更新
    const needsUpdate = this.options.some(
      (opt) =>
        (opt.value === value && !opt.focused) ||
        (opt.value !== value && opt.focused),
    );
    if (!needsUpdate) {
      return;
    }
    this.options = this.options.map((opt) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.selected,
        focused: opt.value === value,
        disabled: opt.disabled,
      };
    });
    this.emit(Events.StateChange, { ...this.state });
  }
  blurOption(value: T) {
    // 检查是否需要更新
    const needsUpdate = this.options.some(
      (opt) => opt.value === value && opt.focused,
    );
    if (!needsUpdate) {
      return;
    }
    this.options = this.options.map((opt) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: opt.selected,
        focused: opt.value === value ? false : opt.focused,
        disabled: opt.disabled,
      };
    });
    this.emit(Events.StateChange, { ...this.state });
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
      const idx = currentIndex < 0
        ? i
        : (currentIndex + 1 + i) % options.length;
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
      const idx = currentIndex < 0
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

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  onValueChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
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
