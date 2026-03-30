import dayjs from "dayjs";
import { base, Handler } from "@timeless/base";

import { CalendarCore } from "@/calendar";
import { ButtonCore } from "@/button";
import { PopperCore } from "@/popper";
import { PresenceCore } from "@/presence";

export function DatePickerCore(props: { today: Date; allowClear?: boolean }) {
  const { today, allowClear = false } = props;

  const presence$ = new PresenceCore({});
  const popper$ = new PopperCore({
    strategy: "fixed",
    side: "bottom",
    align: "start",
  });
  const calendar$ = CalendarCore({
    today,
  });
  const btn$ = new ButtonCore({});
  calendar$.onChange(() => {
    bus.emit(Events.Change, _state.value);
    bus.emit(Events.StateChange, { ..._state });
    // 当日历内容变化时（月份切换），重新计算 popper 位置
    if (popper$.state.isPlaced) {
      popper$.place();
    }
  });

  const _state = {
    get date() {
      if (calendar$.value) {
        return dayjs(calendar$.value).format("YYYY/MM/DD");
      }
      return "请选择";
    },
    get value() {
      return calendar$.value;
    },
    get allowClear() {
      return allowClear;
    },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _state.value;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "date-picker" as const,
    state: _state,
    get value() {
      return calendar$.value;
    },
    $presence: presence$,
    $popper: popper$,
    $calendar: calendar$,
    $btn: btn$,
    setValue(v: Date) {
      // console.log("[DOMAIN]ui/date-picker - setValue");
      calendar$.selectDay(v);
    },
    clear() {
      calendar$.clear();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type DatePickerCore = ReturnType<typeof DatePickerCore>;
