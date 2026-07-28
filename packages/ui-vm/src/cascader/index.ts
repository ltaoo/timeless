import { BaseDomain, Handler } from "@timeless/inner-base";

import { PopperCore } from "@/popper/index";
import { Rect } from "@/popper/types";
import { DismissableLayerCore } from "@/dismissable-layer/index";
import { PresenceCore } from "@/presence/index";

export type CascaderOption<T = any> = {
  value: T;
  label: string;
  disabled?: boolean;
  children?: CascaderOption<T>[];
};

enum Events {
  StateChange,
  Change,
  Focus,
  Blur,
}

type TheTypesOfEvents<T> = {
  [Events.StateChange]: CascaderState<T>;
  [Events.Change]: T[] | null;
  [Events.Focus]: void;
  [Events.Blur]: void;
};

type CascaderProps<T> = {
  id?: string;
  defaultValue?: T[];
  placeholder?: string;
  allowClear?: boolean;
  options?: CascaderOption<T>[];
  onChange?: (value: T[] | null, selectedOptions: CascaderOption<T>[]) => void;
  /** 是否支持搜索过滤 */
  search?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 展开触发方式 */
  expandTrigger?: "click" | "hover";
  /** 是否显示完整路径 */
  showFullPath?: boolean;
  /** 路径分隔符 */
  pathSeparator?: string;
};

type CascaderState<T> = {
  options: CascaderOption<T>[];
  /** 当前选中的值路径 */
  value: T[] | null;
  /** 当前展开的面板数据 */
  panels: {
    /** 面板唯一标识，用于 For 组件 diff */
    key: string;
    options: (CascaderOption<T> & { selected: boolean; focused: boolean })[];
    selectedValue: T | null;
  }[];
  /** 菜单是否展开 */
  open: boolean;
  /** 提示 */
  placeholder: string;
  /** 禁用 */
  disabled: boolean;
  allowClear: boolean;
  /** 显示文本 */
  displayText: string;
  /** 是否启用搜索 */
  search: boolean;
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索框占位符 */
  searchPlaceholder: string;
  /** 搜索结果 */
  searchResults: { path: CascaderOption<T>[]; value: T[] }[];
};

export class CascaderCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  shape = "cascader" as const;
  name = "CascaderCore";
  debug = true;

  id: string | null = null;
  placeholder: string;
  options: CascaderOption<T>[] = [];
  defaultValue: T[] | null = null;
  value: T[] | null = null;
  disabled: boolean = false;
  open: boolean = false;
  allowClear: boolean = false;
  expandTrigger: "click" | "hover" = "click";
  showFullPath: boolean = true;
  pathSeparator: string = " / ";

  /** 是否启用搜索 */
  search: boolean = false;
  /** 搜索关键字 */
  searchKeyword: string = "";
  /** 搜索框占位符 */
  searchPlaceholder: string = "搜索...";

  popper: PopperCore;
  presence = new PresenceCore();
  layer: DismissableLayerCore;

  reference: Rect | null = null;

  /** 当前展开的面板 */
  private expandedPath: T[] = [];
  /** 当前聚焦的选项位置 [panelIndex, optionIndex] */
  private focusedPosition: [number, number] = [0, 0];

  get displayText(): string {
    if (!this.value || this.value.length === 0) {
      return "";
    }
    const selectedOptions = this.getSelectedOptions();
    if (this.showFullPath) {
      return selectedOptions.map((o) => o.label).join(this.pathSeparator);
    }
    return selectedOptions[selectedOptions.length - 1]?.label || "";
  }

  get panels(): CascaderState<T>["panels"] {
    const panels: CascaderState<T>["panels"] = [];

    // 第一级面板
    panels.push({
      key: "panel-0",
      options: this.options.map((opt) => ({
        ...opt,
        selected: this.expandedPath[0] === opt.value,
        focused:
          (this.focusedPosition[0] === 0 &&
            this.options[this.focusedPosition[1]]?.value === opt.value) ||
          (this.focusedPosition[0] > 0 && this.expandedPath[0] === opt.value),
      })),
      selectedValue: this.expandedPath[0] ?? null,
    });

    // 根据展开路径添加后续面板
    let currentOptions = this.options;
    for (let i = 0; i < this.expandedPath.length; i++) {
      const selectedOpt = currentOptions.find(
        (o) => o.value === this.expandedPath[i],
      );
      if (selectedOpt?.children && selectedOpt.children.length > 0) {
        const panelLevel = i + 1;
        panels.push({
          key: `panel-${panelLevel}`,
          options: selectedOpt.children.map((opt, idx) => ({
            ...opt,
            selected: this.expandedPath[panelLevel] === opt.value,
            focused:
              (this.focusedPosition[0] === panelLevel &&
                this.focusedPosition[1] === idx) ||
              (this.focusedPosition[0] > panelLevel &&
                this.expandedPath[panelLevel] === opt.value),
          })),
          selectedValue: this.expandedPath[panelLevel] ?? null,
        });
        currentOptions = selectedOpt.children;
      }
    }

    return panels;
  }

  /** 获取搜索结果 */
  get searchResults(): CascaderState<T>["searchResults"] {
    if (!this.search || !this.searchKeyword) {
      return [];
    }
    const keyword = this.searchKeyword.toLowerCase();
    const results: { path: CascaderOption<T>[]; value: T[] }[] = [];

    const searchInOptions = (
      options: CascaderOption<T>[],
      path: CascaderOption<T>[],
      valuePath: T[],
    ) => {
      for (const opt of options) {
        const currentPath = [...path, opt];
        const currentValuePath = [...valuePath, opt.value];

        if (opt.label.toLowerCase().includes(keyword)) {
          // 只添加叶子节点或当前匹配项
          if (!opt.children || opt.children.length === 0) {
            results.push({ path: currentPath, value: currentValuePath });
          }
        }

        if (opt.children && opt.children.length > 0) {
          searchInOptions(opt.children, currentPath, currentValuePath);
        }
      }
    };

    searchInOptions(this.options, [], []);
    return results;
  }

  get state(): CascaderState<T> {
    return {
      options: this.options,
      value: this.value,
      panels: this.panels,
      open: this.open,
      disabled: this.disabled,
      placeholder: this.placeholder,
      allowClear: this.allowClear,
      displayText: this.displayText,
      search: this.search,
      searchKeyword: this.searchKeyword,
      searchPlaceholder: this.searchPlaceholder,
      searchResults: this.searchResults,
    };
  }

  constructor(props: Partial<{ _name: string }> & CascaderProps<T>) {
    super(props);

    const {
      id,
      defaultValue,
      placeholder = "请选择",
      allowClear = false,
      options = [],
      onChange,
      search = false,
      searchPlaceholder = "搜索...",
      expandTrigger = "click",
      showFullPath = true,
      pathSeparator = " / ",
    } = props;

    this.search = search;
    this.searchPlaceholder = searchPlaceholder;
    this.options = options;
    this.expandTrigger = expandTrigger;
    this.showFullPath = showFullPath;
    this.pathSeparator = pathSeparator;

    if (id !== undefined) {
      this.id = id;
    }

    this.value = defaultValue ?? null;
    this.defaultValue = defaultValue ?? null;
    this.placeholder = placeholder;
    this.allowClear = allowClear;

    // 如果有默认值，展开到默认值路径
    if (defaultValue && defaultValue.length > 0) {
      this.expandedPath = [...defaultValue];
    }

    this.popper = new PopperCore({
      align: "start",
    });

    this.layer = new DismissableLayerCore();

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
      this.hide();
    });

    this.presence.onStateChange(() =>
      this.emit(Events.StateChange, { ...this.state }),
    );

    if (onChange) {
      this.onChange(onChange);
    }
  }

  /** 获取选中选项的完整路径 */
  getSelectedOptions(): CascaderOption<T>[] {
    if (!this.value || this.value.length === 0) {
      return [];
    }

    const result: CascaderOption<T>[] = [];
    let currentOptions = this.options;

    for (const val of this.value) {
      const opt = currentOptions.find((o) => o.value === val);
      if (opt) {
        result.push(opt);
        currentOptions = opt.children || [];
      } else {
        break;
      }
    }

    return result;
  }

  /** 根据面板索引和值查找原始选项 */
  private findOptionByPanelAndValue(
    panelIndex: number,
    value: T,
  ): CascaderOption<T> | null {
    let currentOptions = this.options;

    for (let i = 0; i < panelIndex; i++) {
      const selectedValue = this.expandedPath[i];
      const opt = currentOptions.find((o) => o.value === selectedValue);
      if (opt?.children) {
        currentOptions = opt.children;
      } else {
        return null;
      }
    }

    return currentOptions.find((o) => o.value === value) || null;
  }

  show() {
    if (this.disabled) {
      return;
    }
    this.presence.show();
    this.popper.place();
    this.open = true;
    // 重置展开路径为当前选中值
    if (this.value) {
      this.expandedPath = [...this.value];
    } else {
      this.expandedPath = [];
    }
    // 将焦点定位到已选中值的最深层级
    if (this.expandedPath.length > 0) {
      const lastPanelIndex = this.expandedPath.length - 1;
      const panels = this.panels;
      const lastPanel = panels[lastPanelIndex];
      if (lastPanel) {
        const optIndex = lastPanel.options.findIndex(
          (o) => o.value === this.expandedPath[lastPanelIndex],
        );
        this.focusedPosition = [lastPanelIndex, Math.max(0, optIndex)];
      } else {
        this.focusedPosition = [0, 0];
      }
    } else {
      this.focusedPosition = [0, 0];
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  hide() {
    this.presence.hide();
    if (this.open === false) {
      return;
    }
    this.open = false;
    this.searchKeyword = "";
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 展开某个选项 */
  expand(panelIndex: number, value: T) {
    // 更新展开路径
    this.expandedPath = this.expandedPath.slice(0, panelIndex);
    this.expandedPath.push(value);
    this.focusedPosition = [panelIndex, 0];
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 选择某个选项（叶子节点） */
  select(valuePath: T[]) {
    this.value = valuePath;
    this.expandedPath = [...valuePath];
    const selectedOptions = this.getSelectedOptions();
    this.emit(Events.Change, valuePath);
    this.emit(Events.StateChange, { ...this.state });
    this.hide();
  }

  /** 点击某个选项 */
  clickOption(panelIndex: number, option: CascaderOption<T>) {
    if (option.disabled) {
      return;
    }

    // 从原始选项树中查找选项，确保获取正确的 children 属性
    const actualOption = this.findOptionByPanelAndValue(
      panelIndex,
      option.value,
    );
    if (!actualOption) {
      return;
    }

    // 更新展开路径
    this.expandedPath = this.expandedPath.slice(0, panelIndex);
    this.expandedPath.push(actualOption.value);

    // 如果没有子选项，则完成选择
    if (!actualOption.children || actualOption.children.length === 0) {
      this.select([...this.expandedPath]);
    } else {
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  /** hover 某个选项 */
  hoverOption(panelIndex: number, option: CascaderOption<T>) {
    if (option.disabled) {
      return;
    }

    // 从原始选项树中查找选项，确保获取正确的 children 属性
    const actualOption = this.findOptionByPanelAndValue(
      panelIndex,
      option.value,
    );
    if (!actualOption) {
      return;
    }

    // 始终在 hover 时展开有子选项的选项，让用户可以预览子菜单
    if (actualOption.children && actualOption.children.length > 0) {
      // 直接更新展开路径，不调用 expand() 以避免多次触发 StateChange
      this.expandedPath = this.expandedPath.slice(0, panelIndex);
      this.expandedPath.push(actualOption.value);
    }

    // 更新焦点位置
    const panel = this.panels[panelIndex];
    if (panel) {
      const optionIndex = panel.options.findIndex(
        (o) => o.value === actualOption.value,
      );
      if (optionIndex >= 0) {
        this.focusedPosition = [panelIndex, optionIndex];
      }
    }

    // 只触发一次 StateChange
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 设置选项 */
  setOptions(options: CascaderOption<T>[]) {
    this.options = options;
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 设置值 */
  setValue(value: T[] | null) {
    this.value = value;
    if (value) {
      this.expandedPath = [...value];
    } else {
      this.expandedPath = [];
    }
    this.emit(Events.Change, value);
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 清空值 */
  clear() {
    this.value = null;
    this.expandedPath = [];
    this.emit(Events.Change, null);
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 设置搜索关键字 */
  setSearchKeyword(keyword: string) {
    if (this.searchKeyword === keyword) {
      return;
    }
    this.searchKeyword = keyword;
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 选择搜索结果 */
  selectSearchResult(result: { path: CascaderOption<T>[]; value: T[] }) {
    this.select(result.value);
  }

  /** 键盘导航 - 下一个选项 */
  focusNextOption() {
    const [panelIdx, optIdx] = this.focusedPosition;
    const panel = this.panels[panelIdx];
    if (!panel) return;

    if (optIdx < panel.options.length - 1) {
      this.focusedPosition = [panelIdx, optIdx + 1];
    } else {
      this.focusedPosition = [panelIdx, 0];
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 键盘导航 - 上一个选项 */
  focusPrevOption() {
    const [panelIdx, optIdx] = this.focusedPosition;
    const panel = this.panels[panelIdx];
    if (!panel) return;

    if (optIdx > 0) {
      this.focusedPosition = [panelIdx, optIdx - 1];
    } else {
      this.focusedPosition = [panelIdx, panel.options.length - 1];
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  /** 键盘导航 - 进入子级 */
  focusNextPanel() {
    const [panelIdx, optIdx] = this.focusedPosition;
    const panel = this.panels[panelIdx];
    if (!panel) return;

    const option = panel.options[optIdx];
    if (option && option.children && option.children.length > 0) {
      this.expand(panelIdx, option.value);
      this.focusedPosition = [panelIdx + 1, 0];
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  /** 键盘导航 - 返回父级 */
  focusPrevPanel() {
    const [panelIdx] = this.focusedPosition;
    if (panelIdx > 0) {
      this.expandedPath = this.expandedPath.slice(0, panelIdx - 1);
      this.focusedPosition = [panelIdx - 1, 0];
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  /** 选择当前聚焦的选项 */
  selectFocusedOption() {
    const [panelIdx, optIdx] = this.focusedPosition;
    const panel = this.panels[panelIdx];
    if (!panel) return;

    const option = panel.options[optIdx];
    if (option) {
      this.clickOption(panelIdx, option);
    }
  }

  focus() {
    this.emit(Events.Focus);
  }

  blur() {
    this.emit(Events.Blur);
  }

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  onValueChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  onChange(
    handler: (value: T[] | null, selectedOptions: CascaderOption<T>[]) => void,
  ) {
    return this.on(Events.Change, (value) => {
      handler(value, this.getSelectedOptions());
    });
  }

  onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }

  onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
}
