import { BaseDomain, Handler } from "@timeless/base";

import { PopperCore } from "@/popper/index";
import { Rect } from "@/popper/types";
import { DismissableLayerCore } from "@/dismissable-layer/index";
import { PresenceCore } from "@/presence/index";
import { Direction } from "@/direction/index";

enum Events {
  StateChange,
  Change,
  Focus,
  Blur,
}
type TheTypesOfEvents<T> = {
  [Events.StateChange]: TagSelectState<T>;
  [Events.Change]: T[];
  [Events.Focus]: void;
  [Events.Blur]: void;
};

type TagSelectOption<T> = {
  value: T;
  label: string;
};

type TagSelectProps<T> = {
  id?: string;
  defaultValue?: T[];
  placeholder?: string;
  options?: TagSelectOption<T>[];
  onChange?: (v: T[]) => void;
  max?: number;
  search?: (keyword: string, option: TagSelectOption<T>) => boolean;
};

type TagSelectState<T> = {
  options: (TagSelectOption<T> & { selected: boolean; focused: boolean })[];
  filteredOptions: (TagSelectOption<T> & {
    selected: boolean;
    focused: boolean;
  })[];
  values: T[];
  selectedOptions: TagSelectOption<T>[];
  open: boolean;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  dir: Direction;
  styles: Partial<CSSStyleDeclaration>;
  enter: boolean;
  visible: boolean;
  exit: boolean;
  keyword: string;
};

export class TagSelectCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  shape = "tag-select" as const;
  name = "TagSelectCore";
  debug = true;

  id: string | null = null;
  placeholder: string;
  options: (TagSelectOption<T> & { selected: boolean; focused: boolean })[] =
    [];
  defaultValue: T[] = [];
  values: T[] = [];
  disabled: boolean = false;
  open: boolean = false;
  max: number = Infinity;
  keyword: string = "";
  searchFn: ((keyword: string, option: TagSelectOption<T>) => boolean) | null =
    null;

  popper: PopperCore;
  presence = new PresenceCore();
  layer: DismissableLayerCore;

  reference: Rect | null = null;

  get filteredOptions() {
    if (!this.keyword) {
      return this.options;
    }
    if (this.searchFn) {
      return this.options.filter((opt) => this.searchFn!(this.keyword, opt));
    }
    const lowerKeyword = this.keyword.toLowerCase();
    return this.options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerKeyword),
    );
  }

  get state(): TagSelectState<T> {
    return {
      options: this.options,
      filteredOptions: this.filteredOptions,
      values: this.values,
      selectedOptions: this.options.filter((opt) => opt.selected),
      open: this.open,
      disabled: this.disabled,
      placeholder: this.placeholder,
      required: false,
      dir: "ltr",
      styles: {},
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
      keyword: this.keyword,
    };
  }

  constructor(props: Partial<{ _name: string }> & TagSelectProps<T>) {
    super(props);

    const {
      id,
      defaultValue = [],
      placeholder = "Select tags...",
      options = [],
      onChange,
      max,
      search,
    } = props;

    this.options = options.map((opt, i) => {
      return {
        label: opt.label,
        value: opt.value,
        selected: defaultValue.includes(opt.value),
        focused: i === 0,
      };
    });

    if (id !== undefined) {
      this.id = id;
    }
    this.values = [...defaultValue];
    this.defaultValue = [...defaultValue];
    this.placeholder = placeholder;
    if (max !== undefined) {
      this.max = max;
    }
    if (search) {
      this.searchFn = search;
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

  show() {
    if (this.disabled) {
      return;
    }
    this.popper.place();
    this.open = true;
    this.emit(Events.StateChange, { ...this.state });
  }

  hide() {
    this.presence.hide();
    if (this.open === false) {
      return;
    }
    this.open = false;
    this.keyword = "";
    this.emit(Events.StateChange, { ...this.state });
  }

  toggle(value: T) {
    const isSelected = this.values.includes(value);

    if (isSelected) {
      this.deselect(value);
    } else {
      this.select(value);
    }
  }

  select(value: T) {
    if (this.values.includes(value)) {
      return;
    }
    if (this.values.length >= this.max) {
      return;
    }

    this.values = [...this.values, value];
    this.options = this.options.map((opt) => ({
      ...opt,
      selected: this.values.includes(opt.value),
    }));

    this.emit(Events.Change, this.values);
    this.emit(Events.StateChange, { ...this.state });
  }

  deselect(value: T) {
    if (!this.values.includes(value)) {
      return;
    }

    this.values = this.values.filter((v) => v !== value);
    this.options = this.options.map((opt) => ({
      ...opt,
      selected: this.values.includes(opt.value),
    }));

    this.emit(Events.Change, this.values);
    this.emit(Events.StateChange, { ...this.state });
  }

  removeTag(value: T) {
    this.deselect(value);
  }

  clear() {
    this.values = [];
    this.options = this.options.map((opt) => ({
      ...opt,
      selected: false,
    }));
    this.emit(Events.Change, this.values);
    this.emit(Events.StateChange, { ...this.state });
  }

  setOptions(options: TagSelectOption<T>[]) {
    this.options = options.map((opt) => ({
      label: opt.label,
      value: opt.value,
      selected: this.values.includes(opt.value),
      focused: false,
    }));

    // Remove values that are no longer in options
    const validValues = this.values.filter((v) =>
      options.some((opt) => opt.value === v),
    );
    if (validValues.length !== this.values.length) {
      this.values = validValues;
      this.emit(Events.Change, this.values);
    }

    this.emit(Events.StateChange, { ...this.state });
  }

  setValue(values: T[]) {
    this.values = [...values];
    this.options = this.options.map((opt) => ({
      ...opt,
      selected: this.values.includes(opt.value),
    }));
    this.emit(Events.Change, this.values);
    this.emit(Events.StateChange, { ...this.state });
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
    this.emit(Events.StateChange, { ...this.state });
  }

  setKeyword(keyword: string) {
    this.keyword = keyword;
    this.emit(Events.StateChange, { ...this.state });
  }

  clearKeyword() {
    this.keyword = "";
    this.emit(Events.StateChange, { ...this.state });
  }

  focusOption(value: T) {
    const needsUpdate = this.options.some(
      (opt) =>
        (opt.value === value && !opt.focused) ||
        (opt.value !== value && opt.focused),
    );
    if (!needsUpdate) {
      return;
    }
    this.options = this.options.map((opt) => ({
      ...opt,
      focused: opt.value === value,
    }));
    this.emit(Events.StateChange, { ...this.state });
  }

  blurOption(value: T) {
    const needsUpdate = this.options.some(
      (opt) => opt.value === value && opt.focused,
    );
    if (!needsUpdate) {
      return;
    }
    this.options = this.options.map((opt) => ({
      ...opt,
      focused: opt.value === value ? false : opt.focused,
    }));
    this.emit(Events.StateChange, { ...this.state });
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
