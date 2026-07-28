import { BaseDomain, Handler } from "@timeless/inner-base";

enum Events {
  Change = 10,
  StateChange,
  Mounted,
  Focus,
  Blur,
  Clear,
  Click,
  Reject,
}

type TFile = { name: string; kind: string; type: string };

type RejectInfo = {
  files: TFile[];
  accept: string;
};

type TheTypesOfEvents = {
  [Events.Mounted]: void;
  [Events.Change]: TFile[] | null;
  [Events.Blur]: TFile[] | null;
  [Events.Focus]: void;
  [Events.Clear]: void;
  [Events.Click]: { x: number; y: number };
  [Events.StateChange]: FilePickerState;
  [Events.Reject]: RejectInfo;
};

export type FilePickerCoreProps = {
  name?: string;
  disabled?: boolean;
  defaultValue?: TFile[] | null;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
  capture?: string;
  autoFocus?: boolean;
  onChange?: (v: TFile[] | null) => void;
  onBlur?: (v: TFile[] | null) => void;
  onClear?: () => void;
  onMounted?: () => void;
};

type FilePickerState = {
  value: TFile[] | null;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  focus: boolean;
  accept?: string;
  multiple: boolean;
  autoFocus: boolean;
  dragging: boolean;
  invalid: boolean;
  invalid_files: TFile[];
};

export class FilePickerCore extends BaseDomain<TheTypesOfEvents> {
  shape = "file-input" as const;
  defaultValue: TFile[] | null = null;
  value: TFile[] | null = null;
  placeholder = "";
  disabled = false;
  accept?: string;
  multiple = false;
  capture?: string;
  autoFocus = false;
  isFocus = false;
  loading = false;
  dragging = false;
  invalid = false;
  /** 被消费过的值，用于做比较判断值是否发生改变 */
  valueUsed: unknown;
  invalid_files: TFile[] = [];

  get state(): FilePickerState {
    return {
      value: this.value,
      placeholder: this.placeholder,
      disabled: this.disabled,
      focus: this.isFocus,
      loading: this.loading,
      accept: this.accept,
      multiple: this.multiple,
      autoFocus: this.autoFocus,
      dragging: this.dragging,
      invalid: this.invalid,
      invalid_files: this.invalid_files,
    };
  }

  constructor(props: { unique_id?: string } & FilePickerCoreProps) {
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
    const { target } = event as { target: { files: TFile[] | null } };
    const { files } = target;
    this.setValue(files);
  }

  handleDragOver(event: { files?: TFile[] }) {
    if (this.dragging) {
      return;
    }
    this.dragging = true;
    const files = event.files;
    console.log("[]handle drag over", files, files ? files[0] : null);
    const valid = files ? this.validateFiles(files) : true;
    if (!valid) {
      this.invalid = true;
      // $elm.setAttribute("data-drag-invalid", "true");
    } else {
      this.invalid = false;
      // $elm.removeAttribute("data-drag-invalid");
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  handleDragLeave() {
    console.log("[]handle drag leave");
    this.dragging = false;
    this.invalid = false;
    this.emit(Events.StateChange, { ...this.state });
  }

  handleDrop(event: { files?: TFile[] }) {
    console.log("[]handle drop");
    this.dragging = false;
    this.invalid = false;
    this.invalid_files = [];
    // this.value = [];
    this.emit(Events.StateChange, { ...this.state });
    const files = this.filter_valid_files(event);
    // const files = event.files;
    // console.log("after this.filterFiles", files, event.files);
    if (files.length === 0) {
      if (this.accept && event.files.length > 0) {
        const rejected: TFile[] = [];
        for (let i = 0; i < event.files.length; i++) {
          rejected.push(event.files[i]);
        }
        this.invalid_files = rejected;
        this.emit(Events.Reject, { files: rejected, accept: this.accept });
      }
      return;
    }
    this.setValue(files);
  }

  /**
   * 在 dragover 阶段检查 dataTransfer.items 的类型是否匹配 accept
   * 返回 true 表示有匹配项，false 表示全部不匹配
   */
  validateFiles(items: TFile[]): boolean {
    if (!this.accept) {
      return true;
    }
    const acceptTypes = this.accept
      .split(",")
      .map((t) => t.trim().toLowerCase());
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== "file") continue;
      const mimeType = item.type.toLowerCase();
      const matched = acceptTypes.some((type) => {
        if (type.startsWith(".")) {
          // 扩展名无法在 dragover 阶段判断，放行
          return true;
        }
        if (type.endsWith("/*")) {
          return mimeType.startsWith(type.slice(0, -1));
        }
        return mimeType === type;
      });
      if (matched) return true;
    }
    return false;
  }

  filter_valid_files(event: { files?: TFile[] }): TFile[] {
    const accept_value = this.accept;
    if (!accept_value) {
      return Array.from(event.files);
    }
    const accept_types = accept_value
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const files: TFile[] = [];
    for (let i = 0; i < event.files?.length; i++) {
      const file = event.files[i];
      const matched = accept_types.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type);
        }
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      if (matched) {
        // dt.items.add(file);
        files.push(file);
      }
    }
    return files;
  }

  setValue(value: TFile[] | null, extra: Partial<{ silence: boolean }> = {}) {
    console.log("[]FilePicker - setValue", value);
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

  onReject(handler: Handler<TheTypesOfEvents[Events.Reject]>) {
    return this.on(Events.Reject, handler);
  }
}
