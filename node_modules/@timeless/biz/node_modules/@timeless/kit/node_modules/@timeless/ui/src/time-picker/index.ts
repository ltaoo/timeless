import { base, Handler } from "@timeless/base";

import { PopperCore } from "@/popper";
import { PresenceCore } from "@/presence";

export type TimeValue = {
  hour: number;
  minute: number;
  second?: number;
};

export function TimePickerCore(props: {
  defaultValue?: TimeValue;
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
}) {
  const {
    defaultValue,
    showSeconds = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    use12Hours = false,
  } = props;

  const presence$ = new PresenceCore({});
  const popper$ = new PopperCore({
    strategy: "fixed",
    side: "bottom",
    align: "start",
  });

  let _value: TimeValue | null = defaultValue || null;
  let _tempHour: number | null = _value?.hour ?? null;
  let _tempMinute: number | null = _value?.minute ?? null;
  let _tempSecond: number | null = _value?.second ?? null;

  const _state = {
    get time() {
      if (_value) {
        const h = String(_value.hour).padStart(2, "0");
        const m = String(_value.minute).padStart(2, "0");
        if (showSeconds && _value.second !== undefined) {
          const s = String(_value.second).padStart(2, "0");
          return `${h}:${m}:${s}`;
        }
        return `${h}:${m}`;
      }
      return null;
    },
    get value() {
      return _value;
    },
    get tempHour() {
      return _tempHour;
    },
    get tempMinute() {
      return _tempMinute;
    },
    get tempSecond() {
      return _tempSecond;
    },
    get showSeconds() {
      return showSeconds;
    },
    get use12Hours() {
      return use12Hours;
    },
  };

  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _value;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  function emitStateChange() {
    bus.emit(Events.StateChange, { ..._state });
  }

  function generateHours() {
    const hours: number[] = [];
    const max = use12Hours ? 12 : 24;
    for (let i = use12Hours ? 1 : 0; i < (use12Hours ? 13 : max); i += hourStep) {
      hours.push(i);
    }
    return hours;
  }

  function generateMinutes() {
    const minutes: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) {
      minutes.push(i);
    }
    return minutes;
  }

  function generateSeconds() {
    const seconds: number[] = [];
    for (let i = 0; i < 60; i += secondStep) {
      seconds.push(i);
    }
    return seconds;
  }

  return {
    shape: "time-picker" as const,
    state: _state,
    get value() {
      return _value;
    },
    $presence: presence$,
    $popper: popper$,
    showSeconds,
    use12Hours,
    hourStep,
    minuteStep,
    secondStep,

    generateHours,
    generateMinutes,
    generateSeconds,

    selectHour(hour: number) {
      _tempHour = hour;
      emitStateChange();
    },
    selectMinute(minute: number) {
      _tempMinute = minute;
      emitStateChange();
    },
    selectSecond(second: number) {
      _tempSecond = second;
      emitStateChange();
    },
    confirm() {
      if (_tempHour !== null && _tempMinute !== null) {
        _value = {
          hour: _tempHour,
          minute: _tempMinute,
          ...(showSeconds && _tempSecond !== null ? { second: _tempSecond } : {}),
        };
        bus.emit(Events.Change, _value);
        emitStateChange();
        presence$.hide();
      }
    },
    clear() {
      _value = null;
      _tempHour = null;
      _tempMinute = null;
      _tempSecond = null;
      bus.emit(Events.Change, null);
      emitStateChange();
    },
    setValue(v: TimeValue | null) {
      _value = v;
      _tempHour = v?.hour ?? null;
      _tempMinute = v?.minute ?? null;
      _tempSecond = v?.second ?? null;
      emitStateChange();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type TimePickerCore = ReturnType<typeof TimePickerCore>;
