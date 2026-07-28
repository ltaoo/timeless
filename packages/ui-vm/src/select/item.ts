/**
 * @file Select 选项
 */
import { BaseDomain, Handler } from "@timeless/inner-base";

enum Events {
  StateChange,
  Select,
  Leave,
  Enter,
  Move,
  Focus,
  Blur,
}
type TheTypesOfEvents<T> = {
  [Events.StateChange]: SelectItemState<T>;
  [Events.Select]: void;
  [Events.Leave]: void;
  [Events.Enter]: void;
  [Events.Focus]: void;
  [Events.Blur]: void;
};
type SelectItemState<T> = {
  /** 标志唯一值 */
  value: T | null;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
};
type SelectItemProps<T> = {
  name?: string;
  label: string;
  value: T;
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  $node?: () => HTMLElement;
  getRect?: () => DOMRect;
  getStyles?: () => CSSStyleDeclaration;
};

export class SelectItemCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  name = "SelectItemCore";
  debug = true;

  value: T | null = null;
  label: string = "";
  selected: boolean = false;
  focused: boolean = false;
  disabled: boolean = false;

  offsetTop: number = 0;
  height: number = 0;
  // text: {
  //   $node: () => HTMLElement;
  //   getRect: () => DOMRect;
  //   getStyles: () => CSSStyleDeclaration;
  // } | null = null;

  _leave = false;
  _enter = false;

  get state(): SelectItemState<T> {
    return {
      value: this.value,
      selected: this.selected,
      focused: this.focused,
      disabled: this.disabled,
    };
  }

  constructor(options: Partial<{ _name: string }> & SelectItemProps<T>) {
    super(options);

    const { name, label, value, $node, getRect, getStyles } = options;
    this.label = label;
    this.value = value;
    if (name) {
      this.name = `${this.name}_${name}`;
    }
    if ($node) {
      this.$node = $node;
    }
    if (getRect) {
      this.getRect = getRect;
    }
    if (getStyles) {
      this.getStyles = getStyles;
    }
  }
  $node(): HTMLElement | null {
    return null;
  }
  getRect() {
    return {} as DOMRect;
  }
  getStyles() {
    return {} as CSSStyleDeclaration;
  }
  setLabel(label: string) {
    if (this.label === label) {
      return;
    }
    this.label = label;
    this.emit(Events.StateChange, { ...this.state });
  }
  setSelected(selected: boolean) {
    if (this.selected === selected) {
      return;
    }
    this.selected = selected;
    this.emit(Events.StateChange, { ...this.state });
  }
  setFocused(focused: boolean) {
    if (this.focused === focused) {
      return;
    }
    this.focused = focused;
    this.emit(Events.StateChange, { ...this.state });
  }
  select() {
    // if (this.state.selected) {
    //   return;
    // }
    if (this.selected) {
      return;
    }
    this.selected = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  unselect() {
    // if (this.state.selected === false) {
    //   return;
    // }
    if (!this.selected) {
      return;
    }
    this.selected = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  focus() {
    if (this.focused) {
      return;
    }
    this.focused = true;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Focus);
  }
  blur() {
    if (!this.focused) {
      return;
    }
    this.focused = false;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Blur);
  }
  leave() {
    this.emit(Events.Leave);
  }
  move(pos: { x: number; y: number }) {
    if (this.state.disabled) {
      this.leave();
      return;
    }
    // console.log("[SelectItemCore]move - prepare focus");
    this.focus();
  }
  enter() {
    if (this._enter === true) {
      return;
    }
    this._enter = true;
    this.emit(Events.Enter);
  }

  handleMounted(rect: { offsetTop: number; height: number }) {
    const { height, offsetTop } = rect;
    this.offsetTop = offsetTop;
    this.height = height;
  }

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents<T>[Events.Leave]>) {
    return this.on(Events.Leave, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents<T>[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
}
