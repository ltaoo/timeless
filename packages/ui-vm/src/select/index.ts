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

const logger = Logger({ prefix: "vm", scope: "select/index" });

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
  platform?: Platform;
  /** 是否支持搜索过滤 */
  search?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 定位模式 */
  position?: "popper" | "item-aligned";
  onChange?: (v: T | null) => void;
};
type SelectState<T> = {
  options: SelectOptionState<T>[];
  entries: SelectEntryState<T>[];
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
  /** item-aligned 定位状态 */
  itemAlignedPosition?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    height: string;
    minWidth: number;
    maxHeight: number;
    minHeight: number;
    margin: string;
  };
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
  /** 选中项的 DOM 节点引用（用于 item-aligned 模式计算偏移） */
  private _selected_item: {
    offsetTop: number;
    offsetHeight: number;
  } | null = null;
  /** item-aligned 定位所需的 DOM 元素引用 */
  private _content_el: HTMLElement | null = null;
  private _viewport_el: HTMLElement | null = null;
  private _value_el: HTMLElement | null = null;
  /** item-aligned 定位状态 */
  private _item_aligned_position: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    height: string;
    minWidth: number;
    maxHeight: number;
    minHeight: number;
    margin: string;
  } | null = null;

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
      itemAlignedPosition: this._item_aligned_position ?? undefined,
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
      search = false,
      searchPlaceholder = "搜索...",
      position = "popper",
      onChange,
    } = props;
    this.position = position;
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
      platform,
      mode: this.position,
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
  /** 设置选中项的 DOM 节点偏移（用于 item-aligned 模式） */
  setSelectedItemOffset(
    offsetTop: number,
    offsetHeight: number,
    contentPaddingTop: number = 0,
  ) {
    const itemOffsetMiddle = offsetTop + offsetHeight;
    const contentTopToItemMiddle = itemOffsetMiddle + contentPaddingTop;
    this._selected_item = { offsetTop, offsetHeight };
    logger.log(
      "setSelectedItemOffset",
      this.position,
      this.open,
      this._selected_item,
      itemOffsetMiddle,
      contentPaddingTop,
      contentTopToItemMiddle,
    );
    if (this.position === "item-aligned" && this.open) {
      this.popper.setItemOffset({
        x: this.triggerPos.x,
        y: this.triggerPos.y,
        height: offsetHeight,
        bottom: contentTopToItemMiddle,
      });
      this.popper.place();
    }
  }
  /** 清除选中项偏移（关闭时调用） */
  clearSelectedItemOffset() {
    this._selected_item = null;
    // this.popper.setItemOffset();
  }
  /** 设置 item-aligned 定位所需的 DOM 元素（分别设置） */
  setItemAlignedElements(elements: {
    contentEl?: HTMLElement;
    viewportEl?: HTMLElement;
    valueEl?: HTMLElement;
  }) {
    if (elements.contentEl) {
      this._content_el = elements.contentEl;
    }
    if (elements.viewportEl) {
      this._viewport_el = elements.viewportEl;
    }
    if (elements.valueEl) {
      this._value_el = elements.valueEl;
    }
    logger.log(
      "setItemAlignedElements",
      this.position,
      this.open,
      !!this._content_el,
      !!this._viewport_el,
      !!this._value_el,
    );
    if (this.position === "item-aligned" && this.open) {
      this.placeItemAligned();
    }
  }
  /** 执行 item-aligned 定位（参考 Radix 原版实现） */
  placeItemAligned() {
    if (
      !this.reference ||
      !this._content_el ||
      !this._viewport_el ||
      !this._value_el ||
      !this._selected_item
    ) {
      return;
    }
    const CONTENT_MARGIN = 10;
    const triggerRect = this.reference;
    const contentEl = this._content_el;
    const viewportEl = this._viewport_el;
    const valueEl = this._value_el;
    const selectedItem = this._selected_item;
    const selectedItemOffsetTop = selectedItem.offsetTop;
    const selectedItemOffsetHeight = selectedItem.offsetHeight;
    const contentRect = contentEl.getBoundingClientRect();
    const valueNodeRect = valueEl.getBoundingClientRect();
    const itemTextRect = valueNodeRect;
    const dir = this.state.dir || "ltr";
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const availableHeight = windowHeight - CONTENT_MARGIN * 2;
    const itemsHeight = viewportEl.scrollHeight;
    const contentStyles = window.getComputedStyle(contentEl);
    const contentBorderTopWidth =
      parseInt(contentStyles.borderTopWidth, 10) || 0;
    const contentPaddingTop = parseInt(contentStyles.paddingTop, 10) || 0;
    const contentBorderBottomWidth =
      parseInt(contentStyles.borderBottomWidth, 10) || 0;
    const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10) || 0;
    const fullContentHeight =
      contentBorderTopWidth +
      contentPaddingTop +
      itemsHeight +
      contentPaddingBottom +
      contentBorderBottomWidth;
    const minContentHeight = Math.min(
      selectedItemOffsetHeight * 5,
      fullContentHeight,
    );
    const viewportStyles = window.getComputedStyle(viewportEl);
    const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10) || 0;
    const viewportPaddingBottom = parseInt(viewportStyles.paddingTop, 10) || 0;
    const topEdgeToTriggerMiddle =
      triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
    const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;
    const selectedItemHalfHeight = selectedItemOffsetHeight / 2;
    const itemOffsetMiddle = selectedItemOffsetTop + selectedItemHalfHeight;
    const contentTopToItemMiddle =
      contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
    const itemMiddleToContentBottom =
      fullContentHeight - contentTopToItemMiddle;
    const willAlignWithoutTopOverflow =
      contentTopToItemMiddle <= topEdgeToTriggerMiddle;
    let clampedLeft = 0;
    let clampedRight = 0;
    let minContentWidth = 0;
    if (dir !== "rtl") {
      const itemTextOffset = itemTextRect.left - contentRect.left;
      let left = valueNodeRect.left - itemTextOffset;
      const leftDelta = triggerRect.left - left;
      minContentWidth = triggerRect.width + leftDelta;
      const rightEdge = windowWidth - CONTENT_MARGIN;
      clampedLeft = Math.max(
        CONTENT_MARGIN,
        Math.min(left, rightEdge - contentRect.width),
      );
      contentEl.style.minWidth = minContentWidth + "px";
      contentEl.style.left = clampedLeft + "px";
      contentEl.style.right = "auto";
    } else {
      const itemTextOffset = contentRect.right - itemTextRect.right;
      let right = windowWidth - valueNodeRect.right - itemTextOffset;
      const rightDelta = windowWidth - triggerRect.right - right;
      minContentWidth = triggerRect.width + rightDelta;
      const leftEdge = windowWidth - CONTENT_MARGIN;
      clampedRight = Math.max(
        CONTENT_MARGIN,
        Math.min(right, leftEdge - contentRect.width),
      );
      contentEl.style.minWidth = minContentWidth + "px";
      contentEl.style.right = clampedRight + "px";
      contentEl.style.left = "auto";
    }
    if (willAlignWithoutTopOverflow) {
      contentEl.style.bottom = "0";
      contentEl.style.top = "auto";
      contentEl.style.height =
        contentTopToItemMiddle + triggerMiddleToBottomEdge + "px";
    } else {
      contentEl.style.top = "0";
      contentEl.style.bottom = "auto";
      const clampedTopEdgeToTriggerMiddle = Math.max(
        topEdgeToTriggerMiddle,
        contentBorderTopWidth +
          viewportEl.offsetTop +
          viewportPaddingTop +
          selectedItemHalfHeight,
      );
      contentEl.style.height =
        clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom + "px";
      viewportEl.scrollTop =
        contentTopToItemMiddle - topEdgeToTriggerMiddle + viewportEl.offsetTop;
    }
    const position = {
      left: dir !== "rtl" ? clampedLeft : 0,
      right: dir === "rtl" ? clampedRight! : 0,
      top: willAlignWithoutTopOverflow
        ? 0
        : parseInt(contentEl.style.top, 10) || 0,
      bottom: willAlignWithoutTopOverflow ? 0 : 0,
      height: contentEl.style.height,
      minWidth: minContentWidth,
      maxHeight: availableHeight,
      minHeight: minContentHeight,
      margin: `${CONTENT_MARGIN}px 0`,
    };
    this._item_aligned_position = position;
    this.emit(Events.StateChange, { ...this.state });
    logger.log("placeItemAligned done", position);
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
        if (this.position === "item-aligned") {
          this.placeItemAligned();
        } else {
          this.popper.place();
        }
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
    if (this.position === "item-aligned") {
      this.placeItemAligned();
    } else {
      this.popper.place();
    }
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
    this.clearSelectedItemOffset();
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
