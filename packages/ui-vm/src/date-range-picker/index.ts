import { dayjs } from "@timeless/utils";
import { base, Handler } from "@timeless/base";

import { RangeCalendarCore } from "@/range-calendar/index";
import { PopperCore } from "@/popper/index";
import { PresenceCore } from "@/presence/index";

export function DateRangePickerCore(props: { today: Date }) {
  const { today } = props;

  const presence$ = new PresenceCore({});
  const popper$ = new PopperCore({
    strategy: "fixed",
    side: "bottom",
    align: "start",
  });
  const calendar$ = RangeCalendarCore({
    today,
  });

  calendar$.onChange(() => {
    bus.emit(Events.StateChange, { ..._state });
    // 当日历内容变化时（月份切换），重新计算 popper 位置
    if (popper$.state.isPlaced) {
      popper$.place();
    }
  });

  calendar$.onRangeComplete(() => {
    bus.emit(Events.Change, _state.value);
  });

  const _state = {
    get dateText() {
      const { start, end } = calendar$.value || {};
      if (start && end) {
        return `${dayjs(start).format("YYYY/MM/DD")} - ${dayjs(end).format("YYYY/MM/DD")}`;
      }
      if (start) {
        return dayjs(start).format("YYYY/MM/DD");
      }
      return "";
    },
    get value() {
      return calendar$.value;
    },
    get startDate() {
      return calendar$.state.startDate;
    },
    get endDate() {
      return calendar$.state.endDate;
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
    shape: "date-range-picker" as const,
    state: _state,
    get value() {
      return calendar$.value;
    },
    $presence: presence$,
    $popper: popper$,
    $calendar: calendar$,
    setValue(start: Date | null, end: Date | null) {
      calendar$.setRange(start, end);
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

export type DateRangePickerCore = ReturnType<typeof DateRangePickerCore>;
