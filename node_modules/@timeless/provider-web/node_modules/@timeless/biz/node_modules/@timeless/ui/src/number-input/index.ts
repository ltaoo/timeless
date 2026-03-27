import { BaseDomain, Handler } from "@timeless/base";
import { ValueInputInterface } from "@/form/types";

enum Events {
  Change = 10,
  StateChange,
  Mounted,
  Focus,
  Blur,
  Enter,
  KeyDown,
  Step,
}

type TheTypesOfEvents = {
  [Events.Mounted]: void;
  [Events.Change]: number | null;
  [Events.Blur]: number | null;
  [Events.Enter]: number | null;
  [Events.KeyDown]: { key: string; preventDefault: () => void };
  [Events.Focus]: void;
  [Events.Step]: { direction: "up" | "down"; value: number | null };
  [Events.StateChange]: NumberInputState;
};

export type NumberInputProps = {
  /** 字段键 */
  name?: string;
  disabled?: boolean;
  defaultValue?: number | null;
  placeholder?: string;
  autoFocus?: boolean;
  /** 步长，默认为 1 */
  step?: number;
  /** 精度（小数位数） */
  precision?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 是否只能通过控制按钮改变值 */
  controls?: boolean;
  /** 是否禁用键盘上下键 */
  keyboard?: boolean;
  /** 格式化显示 */
  formatter?: (value: number | null) => string;
  /** 解析输入 */
  parser?: (value: string) => number | null;
  onChange?: (v: number | null) => void;
  onKeyDown?: (v: { key: string; preventDefault: () => void }) => void;
  onEnter?: (v: number | null) => void;
  onBlur?: (v: number | null) => void;
  onStep?: (v: { direction: "up" | "down"; value: number | null }) => void;
  onMounted?: () => void;
};

type NumberInputState = {
  value: number | null;
  displayValue: string;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  focus: boolean;
  step: number;
  precision: number | undefined;
  min: number | undefined;
  max: number | undefined;
  canIncrease: boolean;
  canDecrease: boolean;
};

export class NumberInputCore
  extends BaseDomain<TheTypesOfEvents>
  implements ValueInputInterface<number | null>
{
  shape = "number-input" as const;
  defaultValue: number | null;
  value: number | null;
  displayValue: string = "";
  placeholder: string;
  disabled: boolean;
  autoFocus: boolean = false;
  isFocus = false;
  loading = false;

  step: number;
  precision: number | undefined;
  min: number | undefined;
  max: number | undefined;
  controls: boolean;
  keyboard: boolean;
  formatter?: (value: number | null) => string;
  parser?: (value: string) => number | null;

  /** 被消费过的值，用于做比较判断值是否发生改变 */
  valueUsed: unknown;

  get state(): NumberInputState {
    return {
      value: this.value,
      displayValue: this.displayValue,
      placeholder: this.placeholder,
      disabled: this.disabled,
      focus: this.isFocus,
      loading: this.loading,
      step: this.step,
      precision: this.precision,
      min: this.min,
      max: this.max,
      canIncrease: this.canIncrease(),
      canDecrease: this.canDecrease(),
    };
  }

  constructor(props: { unique_id?: string } & NumberInputProps) {
    super(props);

    const {
      unique_id,
      defaultValue = null,
      placeholder = "请输入",
      disabled = false,
      autoFocus = false,
      step = 1,
      precision,
      min,
      max,
      controls = true,
      keyboard = true,
      formatter,
      parser,
      onChange,
      onBlur,
      onEnter,
      onStep,
      onMounted,
    } = props;

    if (unique_id) {
      this.unique_id = unique_id;
    }

    this.placeholder = placeholder;
    this.disabled = disabled;
    this.autoFocus = autoFocus;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
    this.step = step;
    this.precision = precision;
    this.min = min;
    this.max = max;
    this.controls = controls;
    this.keyboard = keyboard;
    this.formatter = formatter;
    this.parser = parser;

    this.displayValue = this.formatValue(defaultValue);

    if (onChange) {
      this.onChange(onChange);
    }
    if (onEnter) {
      this.onEnter(() => {
        onEnter(this.value);
      });
    }
    if (props.onKeyDown) {
      this.onKeyDown(props.onKeyDown);
    }
    if (onBlur) {
      this.onBlur(onBlur);
    }
    if (onStep) {
      this.onStep(onStep);
    }
    if (onMounted) {
      this.onMounted(onMounted);
    }
  }

  setMounted() {
    this.emit(Events.Mounted);
  }

  /** 格式化显示值 */
  formatValue(value: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "";
    }
    if (this.formatter) {
      return this.formatter(value);
    }
    if (this.precision !== undefined) {
      return value.toFixed(this.precision);
    }
    return String(value);
  }

  /** 解析输入值 */
  parseValue(value: string): number | null {
    if (value === "" || value === "-" || value === ".") {
      return null;
    }
    if (this.parser) {
      return this.parser(value);
    }
    const num = parseFloat(value);
    if (Number.isNaN(num)) {
      return null;
    }
    return num;
  }

  /** 校正值到有效范围和精度 */
  correctValue(value: number | null): number | null {
    if (value === null) {
      return null;
    }

    let corrected = value;

    // 应用精度
    if (this.precision !== undefined) {
      const factor = Math.pow(10, this.precision);
      corrected = Math.round(corrected * factor) / factor;
    }

    // 应用范围限制
    if (this.min !== undefined && corrected < this.min) {
      corrected = this.min;
    }
    if (this.max !== undefined && corrected > this.max) {
      corrected = this.max;
    }

    return corrected;
  }

  /** 是否可以增加 */
  canIncrease(): boolean {
    if (this.disabled) return false;
    if (this.max === undefined) return true;
    if (this.value === null) return true;
    return this.value < this.max;
  }

  /** 是否可以减少 */
  canDecrease(): boolean {
    if (this.disabled) return false;
    if (this.min === undefined) return true;
    if (this.value === null) return true;
    return this.value > this.min;
  }

  /** 增加值 */
  increase() {
    if (!this.canIncrease()) return;

    const currentValue = this.value ?? this.min ?? 0;
    const newValue = this.correctValue(currentValue + this.step);
    this.setValue(newValue);
    this.emit(Events.Step, { direction: "up", value: newValue });
  }

  /** 减少值 */
  decrease() {
    if (!this.canDecrease()) return;

    const currentValue = this.value ?? this.max ?? 0;
    const newValue = this.correctValue(currentValue - this.step);
    this.setValue(newValue);
    this.emit(Events.Step, { direction: "down", value: newValue });
  }

  handleKeyDown(event: { key: string; preventDefault: () => void }) {
    if (event.key === "Enter") {
      this.handleEnter();
      return;
    }
    if (this.keyboard) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.increase();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.decrease();
        return;
      }
    }
    this.emit(Events.KeyDown, event);
  }

  handleEnter() {
    this.valueUsed = this.value;
    this.emit(Events.Enter, this.value);
  }

  handleFocus() {
    this.isFocus = true;
    this.emit(Events.Focus);
    this.emit(Events.StateChange, { ...this.state });
  }

  handleBlur() {
    this.isFocus = false;
    // 在 blur 时校正值
    const correctedValue = this.correctValue(this.value);
    if (correctedValue !== this.value) {
      this.setValue(correctedValue);
    }
    this.displayValue = this.formatValue(this.value);
    if (this.value !== this.valueUsed) {
      this.valueUsed = this.value;
      this.emit(Events.Blur, this.value);
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  handleChange(event: unknown) {
    const { target } = event as { target: { value: string } };
    const { value: inputValue } = target;

    // 允许输入负号、小数点等中间状态
    if (
      inputValue === "" ||
      inputValue === "-" ||
      inputValue === "." ||
      inputValue === "-."
    ) {
      this.displayValue = inputValue;
      this.value = null;
      this.emit(Events.Change, null);
      this.emit(Events.StateChange, { ...this.state });
      return;
    }

    // 验证输入是否为有效数字格式
    const numRegex = /^-?\d*\.?\d*$/;
    if (!numRegex.test(inputValue)) {
      return;
    }

    this.displayValue = inputValue;
    const parsedValue = this.parseValue(inputValue);
    this.value = parsedValue;
    this.emit(Events.Change, parsedValue);
    this.emit(Events.StateChange, { ...this.state });
  }

  setValue(value: number | null, extra: Partial<{ silence: boolean }> = {}) {
    this.value = this.correctValue(value);
    this.displayValue = this.formatValue(this.value);

    if (!extra.silence) {
      this.emit(Events.Change, this.value);
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  setPlaceholder(v: string) {
    this.placeholder = v;
    this.emit(Events.StateChange, { ...this.state });
  }

  setLoading(loading: boolean) {
    if (this.state.loading === loading) {
      return;
    }
    this.loading = loading;
    this.emit(Events.StateChange, { ...this.state });
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
    this.emit(Events.StateChange, { ...this.state });
  }

  setMin(min: number | undefined) {
    this.min = min;
    // 如果当前值小于新的最小值，则校正
    if (this.value !== null && min !== undefined && this.value < min) {
      this.setValue(min);
    } else {
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  setMax(max: number | undefined) {
    this.max = max;
    // 如果当前值大于新的最大值，则校正
    if (this.value !== null && max !== undefined && this.value > max) {
      this.setValue(max);
    } else {
      this.emit(Events.StateChange, { ...this.state });
    }
  }

  setStep(step: number) {
    this.step = step;
    this.emit(Events.StateChange, { ...this.state });
  }

  setPrecision(precision: number | undefined) {
    this.precision = precision;
    if (this.value !== null) {
      this.setValue(this.value);
    }
  }

  clear() {
    this.value = null;
    this.displayValue = "";
    this.emit(Events.Change, null);
    this.emit(Events.StateChange, { ...this.state });
  }

  reset() {
    this.setValue(this.defaultValue);
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
  onKeyDown(handler: Handler<TheTypesOfEvents[Events.KeyDown]>) {
    return this.on(Events.KeyDown, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onStep(handler: Handler<TheTypesOfEvents[Events.Step]>) {
    return this.on(Events.Step, handler);
  }
}
