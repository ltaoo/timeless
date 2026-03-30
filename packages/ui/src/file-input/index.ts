import { BaseDomain, Handler } from "@timeless/base";

enum Events {
  Change = 10,
  StateChange,
  Mounted,
  Focus,
  Blur,
  Clear,
  Click,
}

type TheTypesOfEvents = {
  [Events.Mounted]: void;
  [Events.Change]: FileList | null;
  [Events.Blur]: FileList | null;
  [Events.Focus]: void;
  [Events.Clear]: void;
  [Events.Click]: { x: number; y: number };
  [Events.StateChange]: FileInputState;
};

export type FileInputProps = {
  name?: string;
  disabled?: boolean;
  defaultValue?: FileList | null;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
  capture?: string;
  autoFocus?: boolean;
  onChange?: (v: FileList | null) => void;
  onBlur?: (v: FileList | null) => void;
  onClear?: () => void;
  onMounted?: () => void;
};

type FileInputState = {
  value: FileList | null;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  focus: boolean;
  accept?: string;
  multiple: boolean;
  autoFocus: boolean;
};

export class FileInputCore extends BaseDomain<TheTypesOfEvents> {
  shape = "file-input" as const;
  defaultValue: FileList | null = null;
  value: FileList | null = null;
  placeholder = "";
  disabled = false;
  accept?: string;
  multiple = false;
  capture?: string;
  autoFocus = false;
  isFocus = false;
  loading = false;
  /** 被消费过的值，用于做比较判断值是否发生改变 */
  valueUsed: unknown;

  get state(): FileInputState {
    return {
      value: this.value,
      placeholder: this.placeholder,
      disabled: this.disabled,
      focus: this.isFocus,
      loading: this.loading,
      accept: this.accept,
      multiple: this.multiple,
      autoFocus: this.autoFocus,
    };
  }

  constructor(props: { unique_id?: string } & FileInputProps) {
    super(props);

    const {
      unique_id,
      defaultValue = null,
      placeholder = "",
      accept,
      multiple = false,
      capture,
      disabled = false,
      autoFocus = false,
      onChange,
      onBlur,
      onClear,
      onMounted,
    } = props;

    if (unique_id) {
      this.unique_id = unique_id;
    }
    this.placeholder = placeholder;
    this.accept = accept;
    this.multiple = multiple;
    this.capture = capture;
    this.disabled = disabled;
    this.autoFocus = autoFocus;
    this.defaultValue = defaultValue;
    this.value = defaultValue;

    if (onChange) {
      this.onChange(onChange);
    }
    if (onBlur) {
      this.onBlur(onBlur);
    }
    if (onClear) {
      this.onClear(onClear);
    }
    if (onMounted) {
      this.onMounted(onMounted);
    }
  }

  setMounted() {
    this.emit(Events.Mounted);
  }

  handleFocus() {
    this.isFocus = true;
  }

  handleBlur() {
    if (this.value === this.valueUsed) {
      return;
    }
    this.valueUsed = this.value;
    this.emit(Events.Blur, this.value);
  }

  handleClick(event: { x: number; y: number }) {
    this.emit(Events.Click, event);
  }

  handleChange(event: unknown) {
    const { target } = event as { target: { files: FileList | null } };
    const { files } = target;
    this.setValue(files);
  }

  setValue(value: FileList | null, extra: Partial<{ silence: boolean }> = {}) {
    this.value = value;
    if (!extra.silence) {
      this.emit(Events.Change, value);
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  setAccept(accept: string) {
    this.accept = accept;
    this.emit(Events.StateChange, { ...this.state });
  }

  setMultiple(multiple: boolean) {
    this.multiple = multiple;
    this.emit(Events.StateChange, { ...this.state });
  }

  setLoading(loading: boolean) {
    if (this.state.loading === loading) {
      return;
    }
    this.loading = loading;
    this.emit(Events.StateChange, { ...this.state });
  }

  clear() {
    this.value = null;
    this.emit(Events.Change, null);
    this.emit(Events.Clear);
    this.emit(Events.StateChange, { ...this.state });
  }

  focus() {
    // Override by platform provider
  }

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }

  onFocus(handler: Handler<TheTypesOfEvents[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }

  onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }

  onClick(handler: Handler<TheTypesOfEvents[Events.Click]>) {
    return this.on(Events.Click, handler);
  }

  onClear(handler: Handler<TheTypesOfEvents[Events.Clear]>) {
    return this.on(Events.Clear, handler);
  }
}
