import { base, Handler } from "@timeless/inner-base";
import { dayjs, padding_zero } from "@timeless/inner-utils";

type CalendarWeek = {
  id: number;
  dates: {
    id: number;
    text: string;
    yyyy: string;
    value: Date;
    time: number;
    is_prev_month: boolean;
    is_next_month: boolean;
    is_today: boolean;
  }[];
};

type CalendarPanel = {
  month: { text: string; value: Date };
  year: { text: number; value: Date };
  weeks: CalendarWeek[];
};

type RangeCalendarCoreProps = {
  today: Date;
};

function getMonthWeeks(date: Date) {
  const d = dayjs(date);
  const startOfMonth = d.startOf("month");
  const startDay = startOfMonth.day();
  const diffStart = (startDay + 6) % 7;
  const startDate = startOfMonth.subtract(diffStart, "day");

  // 固定 6 周
  const weeks = [];
  let current = startDate;
  for (let w = 0; w < 6; w++) {
    const dates = [];
    for (let i = 0; i < 7; i += 1) {
      dates.push(current.toDate());
      current = current.add(1, "day");
    }
    weeks.push({ dates });
  }
  return weeks;
}

function normalizeDate(date: Date) {
  const d = new Date(date);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function buildMonthText(d: Date) {
  const month = d.getMonth() + 1;
  return `${month}月`;
}

function buildWeeksOfMonth(baseDate: Date): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  const r = getMonthWeeks(baseDate);
  const baseMonth = baseDate.getMonth();

  for (let i = 0; i < r.length; i += 1) {
    const { dates } = r[i];
    const week = {
      id: i,
      dates: dates.map((date, idx) => {
        date = normalizeDate(date);
        return {
          id: idx,
          text: date.getDate().toString(),
          yyyy: (() => {
            const y = date.getFullYear();
            const m = padding_zero(date.getMonth() + 1);
            const dd = padding_zero(date.getDate());
            return `${y}-${m}-${dd}`;
          })(),
          is_prev_month: date.getMonth() < baseMonth,
          is_next_month: date.getMonth() > baseMonth,
          is_today: date.valueOf() === normalizeDate(new Date()).valueOf(),
          value: date,
          time: date.valueOf(),
        };
      }),
    };
    weeks.push(week);
  }
  return weeks;
}

export function RangeCalendarCore(props: RangeCalendarCoreProps) {
  const { today } = props;

  const _today = normalizeDate(today);

  // 左右两个面板的当前月份
  let _leftMonth = new Date(_today);
  let _rightMonth = dayjs(_today).add(1, "month").toDate();

  let _startDate: Date | null = null;
  let _endDate: Date | null = null;
  let _hoverDate: Date | null = null;

  let _leftWeeks: CalendarWeek[] = buildWeeksOfMonth(_leftMonth);
  let _rightWeeks: CalendarWeek[] = buildWeeksOfMonth(_rightMonth);

  function refreshPanels() {
    _leftWeeks = buildWeeksOfMonth(_leftMonth);
    _rightWeeks = buildWeeksOfMonth(_rightMonth);
  }

  const _state = {
    get left(): CalendarPanel {
      return {
        month: { text: buildMonthText(_leftMonth), value: _leftMonth },
        year: { text: _leftMonth.getFullYear(), value: _leftMonth },
        weeks: _leftWeeks,
      };
    },
    get right(): CalendarPanel {
      return {
        month: { text: buildMonthText(_rightMonth), value: _rightMonth },
        year: { text: _rightMonth.getFullYear(), value: _rightMonth },
        weeks: _rightWeeks,
      };
    },
    get startDate() {
      return _startDate;
    },
    get endDate() {
      return _endDate;
    },
    get hoverDate() {
      return _hoverDate;
    },
    // 左面板是否可以前进到下一月
    get canLeftNext() {
      const next = dayjs(_leftMonth).add(1, "month");
      return next.isBefore(dayjs(_rightMonth), "month");
    },
    // 右面板是否可以后退到上一月
    get canRightPrev() {
      const prev = dayjs(_rightMonth).subtract(1, "month");
      return prev.isAfter(dayjs(_leftMonth), "month");
    },
  };

  enum Events {
    SelectDay,
    Change,
    RangeComplete,
  }
  type TheTypesOfEvents = {
    [Events.SelectDay]: Date;
    [Events.Change]: typeof _state;
    [Events.RangeComplete]: { start: Date; end: Date };
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get value() {
      if (_startDate && _endDate) {
        return { start: _startDate, end: _endDate };
      }
      return null;
    },
    selectDay(day: Date) {
      day = normalizeDate(day);

      if (!_startDate || (_startDate && _endDate)) {
        // 开始新的选择
        _startDate = day;
        _endDate = null;
        _hoverDate = null;
      } else {
        // 完成选择
        if (day.valueOf() < _startDate.valueOf()) {
          _endDate = _startDate;
          _startDate = day;
        } else {
          _endDate = day;
        }
        bus.emit(Events.RangeComplete, { start: _startDate, end: _endDate });
      }

      bus.emit(Events.SelectDay, day);
      bus.emit(Events.Change, { ..._state });
    },
    hoverDay(day: Date) {
      if (_startDate && !_endDate) {
        _hoverDate = normalizeDate(day);
        bus.emit(Events.Change, { ..._state });
      }
    },
    clearHover() {
      if (_hoverDate) {
        _hoverDate = null;
        bus.emit(Events.Change, { ..._state });
      }
    },
    // 左面板上一月
    leftPrevMonth() {
      _leftMonth = dayjs(_leftMonth).subtract(1, "month").toDate();
      refreshPanels();
      bus.emit(Events.Change, { ..._state });
    },
    // 左面板下一月
    leftNextMonth() {
      const next = dayjs(_leftMonth).add(1, "month");
      // 确保左面板不超过右面板
      if (next.isBefore(dayjs(_rightMonth), "month")) {
        _leftMonth = next.toDate();
        refreshPanels();
        bus.emit(Events.Change, { ..._state });
      }
    },
    // 右面板上一月
    rightPrevMonth() {
      const prev = dayjs(_rightMonth).subtract(1, "month");
      // 确保右面板不早于左面板
      if (prev.isAfter(dayjs(_leftMonth), "month")) {
        _rightMonth = prev.toDate();
        refreshPanels();
        bus.emit(Events.Change, { ..._state });
      }
    },
    // 右面板下一月
    rightNextMonth() {
      _rightMonth = dayjs(_rightMonth).add(1, "month").toDate();
      refreshPanels();
      bus.emit(Events.Change, { ..._state });
    },
    setRange(start: Date | null, end: Date | null) {
      _startDate = start ? normalizeDate(start) : null;
      _endDate = end ? normalizeDate(end) : null;
      if (_startDate) {
        _leftMonth = new Date(_startDate);
        _rightMonth = dayjs(_leftMonth).add(1, "month").toDate();
        refreshPanels();
      }
      bus.emit(Events.Change, { ..._state });
    },
    clear() {
      _startDate = null;
      _endDate = null;
      _hoverDate = null;
      bus.emit(Events.Change, { ..._state });
    },
    isInRange(day: Date) {
      const time = normalizeDate(day).valueOf();
      const start = _startDate?.valueOf();
      const end = _endDate?.valueOf() || _hoverDate?.valueOf();

      if (!start) return false;
      if (!end) return time === start;

      const minTime = Math.min(start, end);
      const maxTime = Math.max(start, end);
      return time >= minTime && time <= maxTime;
    },
    isRangeStart(day: Date) {
      if (!_startDate) return false;
      const time = normalizeDate(day).valueOf();
      const end = _endDate?.valueOf() || _hoverDate?.valueOf();
      if (end && end < _startDate.valueOf()) {
        return time === end;
      }
      return time === _startDate.valueOf();
    },
    isRangeEnd(day: Date) {
      const time = normalizeDate(day).valueOf();
      const end = _endDate?.valueOf() || _hoverDate?.valueOf();
      if (!end) return false;
      if (_startDate && end < _startDate.valueOf()) {
        return time === _startDate.valueOf();
      }
      return time === end;
    },
    onSelectDay(handler: Handler<TheTypesOfEvents[Events.SelectDay]>) {
      return bus.on(Events.SelectDay, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onRangeComplete(handler: Handler<TheTypesOfEvents[Events.RangeComplete]>) {
      return bus.on(Events.RangeComplete, handler);
    },
  };
}

export type RangeCalendarCore = ReturnType<typeof RangeCalendarCore>;
