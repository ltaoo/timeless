/**
 * @file 单选框
 */
import { BaseDomain, Handler } from "@timeless/base";
import { PresenceCore } from "@/presence";

// RadioCore Events
enum RadioEvents {
  StateChange,
  Change,
}
type RadioTypesOfEvents = {
  [RadioEvents.StateChange]: RadioState;
  [RadioEvents.Change]: boolean;
};
type RadioProps = {
  label?: string;
  checked?: boolean;
  value?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};
type RadioState = {
  label?: string;
  checked: boolean;
  value?: string;
  disabled?: boolean;
};

export class RadioCore extends BaseDomain<RadioTypesOfEvents> {
  shape = "radio" as const;

  label: string;
  disabled: boolean;
  checked: boolean;
  value: string;
  defaultChecked: boolean;

  presence: PresenceCore;

  get state(): RadioState {
    return {
      label: this.label,
      checked: this.checked,
      value: this.value,
      disabled: this.disabled,
    };
  }

  constructor(props: { _name?: string } & RadioProps = {}) {
    super(props);

    const { label = "", disabled = false, checked = false, value = "", onChange } = props;
    this.label = label;
    this.disabled = disabled;
    this.checked = checked;
    this.value = value;
    this.defaultChecked = checked;

    this.presence = new PresenceCore();
    if (checked) {
      this.presence.show();
    }
    if (onChange) {
      this.onChange(onChange);
    }
  }

  check() {
    if (this.checked === true || this.disabled) {
      return;
    }
    this.presence.show();
    this.checked = true;
    this.emit(RadioEvents.Change, this.checked);
    this.emit(RadioEvents.StateChange, { ...this.state });
  }

  uncheck() {
    if (this.checked === false) {
      return;
    }
    this.presence.hide();
    this.checked = false;
    this.emit(RadioEvents.StateChange, { ...this.state });
  }

  reset() {
    this.checked = this.defaultChecked;
    if (this.checked) {
      this.presence.show();
    } else {
      this.presence.hide();
    }
    this.emit(RadioEvents.StateChange, { ...this.state });
  }

  onChange(handler: Handler<RadioTypesOfEvents[RadioEvents.Change]>) {
    return this.on(RadioEvents.Change, handler);
  }

  onStateChange(handler: Handler<RadioTypesOfEvents[RadioEvents.StateChange]>) {
    return this.on(RadioEvents.StateChange, handler);
  }
}

// RadioGroupCore Events
enum RadioGroupEvents {
  StateChange,
  Change,
}
type RadioGroupTypesOfEvents<T> = {
  [RadioGroupEvents.StateChange]: RadioGroupState<T>;
  [RadioGroupEvents.Change]: T | null;
};
type RadioGroupOption<T> = {
  value: T;
  label: string;
  checked?: boolean;
  disabled?: boolean;
};
type RadioGroupProps<T> = {
  options?: RadioGroupOption<T>[];
  value?: T;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: T | null) => void;
};
type RadioGroupState<T> = {
  options: {
    label: string;
    value: T;
    core: RadioCore;
  }[];
  value: T | null;
  disabled?: boolean;
};

export class RadioGroupCore<T extends any> extends BaseDomain<RadioGroupTypesOfEvents<T>> {
  shape = "radio-group" as const;

  options: {
    label: string;
    value: T;
    core: RadioCore;
  }[] = [];
  disabled: boolean;
  value: T | null = null;

  get state(): RadioGroupState<T> {
    return {
      value: this.value,
      options: this.options,
      disabled: this.disabled,
    };
  }

  constructor(props: { _name?: string } & RadioGroupProps<T> = {}) {
    super(props);

    const { options = [], value, disabled = false, onChange } = props;
    this.disabled = disabled;
    this.value = value ?? null;

    this.options = options.map((opt) => {
      const { label, value: optValue, checked, disabled: optDisabled } = opt;
      const isChecked = checked || (value !== undefined && value === optValue);
      const store = new RadioCore({
        label,
        value: String(optValue),
        checked: isChecked,
        disabled: optDisabled || disabled,
        onChange: (checked) => {
          if (checked) {
            this.select(optValue);
          }
        },
      });
      return {
        label,
        value: optValue,
        core: store,
      };
    });

    if (onChange) {
      this.onChange(onChange);
    }
  }

  select(value: T) {
    if (this.value === value) {
      return;
    }
    // Uncheck all other options
    for (const opt of this.options) {
      if (opt.value === value) {
        opt.core.check();
      } else {
        opt.core.uncheck();
      }
    }
    this.value = value;
    this.emit(RadioGroupEvents.Change, value);
    this.emit(RadioGroupEvents.StateChange, { ...this.state });
  }

  reset() {
    this.value = null;
    for (const opt of this.options) {
      opt.core.reset();
    }
    this.emit(RadioGroupEvents.Change, null);
    this.emit(RadioGroupEvents.StateChange, { ...this.state });
  }

  setValue(value: T | null) {
    if (value === null) {
      this.reset();
      return;
    }
    this.select(value);
  }

  setOptions(options: RadioGroupOption<T>[]) {
    // Destroy existing cores
    for (const opt of this.options) {
      opt.core.destroy();
    }

    this.options = options.map((opt) => {
      const { label, value: optValue, checked, disabled: optDisabled } = opt;
      const isChecked = checked || (this.value !== null && this.value === optValue);
      const store = new RadioCore({
        label,
        value: String(optValue),
        checked: isChecked,
        disabled: optDisabled || this.disabled,
        onChange: (checked) => {
          if (checked) {
            this.select(optValue);
          }
        },
      });
      return {
        label,
        value: optValue,
        core: store,
      };
    });

    this.emit(RadioGroupEvents.StateChange, { ...this.state });
  }

  onChange(handler: Handler<RadioGroupTypesOfEvents<T>[RadioGroupEvents.Change]>) {
    return this.on(RadioGroupEvents.Change, handler);
  }

  onStateChange(handler: Handler<RadioGroupTypesOfEvents<T>[RadioGroupEvents.StateChange]>) {
    return this.on(RadioGroupEvents.StateChange, handler);
  }
}
