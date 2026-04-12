/**
 * 注册的监听器
 */
import mitt, { EventType, Handler } from "mitt";
export type { Handler, EventType };

function uid_factory() {
  let _uid = 0;
  return function uid() {
    _uid += 1;
    return _uid;
  };
}

const uid = uid_factory();

// 这里必须给 Tip 显示声明值，否则默认为 0，会和其他地方声明的 Events 第一个 Key 冲突
export enum BaseEvents {
  Loading = "__loading",
  Destroy = "__destroy",
}
type TheTypesOfBaseEvents = {
  [BaseEvents.Destroy]: void;
};
type BaseDomainEvents<E> = TheTypesOfBaseEvents & E;

// const uid = uid_factory();
export function base<Events extends Record<EventType, unknown>>() {
  const emitter = mitt<BaseDomainEvents<Events>>();
  let listeners: (() => void)[] = [];

  return {
    off<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      handler: Handler<BaseDomainEvents<Events>[Key]>,
    ) {
      emitter.off(event, handler);
    },
    on<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      handler: Handler<BaseDomainEvents<Events>[Key]>,
    ) {
      const unlisten = () => {
        listeners = listeners.filter((l) => l !== unlisten);
        this.off(event, handler);
      };
      listeners.push(unlisten);
      emitter.on(event, handler);
      return unlisten;
    },
    uid,
    emit<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      value?: BaseDomainEvents<Events>[Key],
    ) {
      emitter.emit(event, value as any);
    },
    destroy() {
      for (let i = 0; i < listeners.length; i += 1) {
        const off = listeners[i];
        off();
      }
      this.emit(BaseEvents.Destroy, null as any);
    },
  };
}

export class BaseDomain<Events extends Record<EventType, unknown>> {
  /** 用于自己区别同名 Domain 不同实例的标志 */
  unique_id = "BaseDomain";
  debug = false;

  _emitter = mitt<BaseDomainEvents<Events>>();
  // event 为键，callback 列表为值的对象
  // @ts-ignore
  listeners: Record<keyof BaseDomainEvents<Events>, (() => void)[]> = {};

  constructor(props: {} = {}) {
    // @ts-ignore
    const { unique_id, debug } = props;
    if (unique_id) {
      this.unique_id = unique_id;
    }
  }
  uid() {
    return uid();
  }
  log(...args: unknown[]) {
    if (!this.debug) {
      return [];
    }
    // const error = new Error();
    // const lineNumber = error.stack.split("\n")[2].trim().split(" ")[1];
    // console.log(error.stack.split("\n"));
    return [
      `%c CORE %c ${this.unique_id} %c`,
      "color:white;background:#dfa639;border-top-left-radius:2px;border-bottom-left-radius:2px;",
      "color:white;background:#19be6b;border-top-right-radius:2px;border-bottom-right-radius:2px;",
      "color:#19be6b;",
      ...args,
    ];
  }
  errorTip(...args: unknown[]) {
    if (!this.debug) {
      return;
    }
    console.log(
      `%c CORE %c ${this.unique_id} %c`,
      "color:white;background:red;border-top-left-radius:2px;border-bottom-left-radius:2px;",
      "color:white;background:#19be6b;border-top-right-radius:2px;border-bottom-right-radius:2px;",
      "color:#19be6b;",
      ...args,
    );
  }
  off<Key extends keyof BaseDomainEvents<Events>>(
    event: Key,
    handler: Handler<BaseDomainEvents<Events>[Key]>,
  ) {
    this._emitter.off(event, handler);
  }
  offEvent<Key extends keyof BaseDomainEvents<Events>>(k: Key) {
    const listeners = this.listeners[k] || [];
    // console.log("[BASE]offEvent - ", this.unique_id, k, this.listeners[k], listeners);
    for (let i = 0; i < listeners.length; i += 1) {
      const off = listeners[i];
      off();
    }
  }
  on<Key extends keyof BaseDomainEvents<Events>>(
    event: Key,
    handler: Handler<BaseDomainEvents<Events>[Key]>,
  ) {
    const unlisten = () => {
      const listeners = this.listeners[event] || [];
      this.listeners[event] = listeners.filter((l) => l !== unlisten);
      this.off(event, handler);
    };
    const listeners = this.listeners[event] || [];
    listeners.push(unlisten);
    this.listeners[event] = listeners;
    // console.log("[BASE]on - ", this.unique_id, event, this.listeners[event], listeners);
    this._emitter.on(event, handler);
    return unlisten;
  }
  emit<Key extends keyof BaseDomainEvents<Events>>(
    event: Key,
    value?: BaseDomainEvents<Events>[Key],
  ) {
    // @ts-ignore
    this._emitter.emit(event, value);
  }
  /** 主动销毁所有的监听事件 */
  destroy() {
    // this.log(this.name, "destroy");
    Object.keys(this.listeners).map((k) => {
      const listeners = this.listeners[k as string] || [];
      for (let i = 0; i < listeners.length; i += 1) {
        const off = listeners[i];
        off();
      }
    });
    this.emit(BaseEvents.Destroy);
  }
  onDestroy(handler: Handler<TheTypesOfBaseEvents[BaseEvents.Destroy]>) {
    return this.on(BaseEvents.Destroy, handler);
  }

  get [Symbol.toStringTag]() {
    return "Domain";
  }
}

export type LogLevel = "info" | "debug" | "warn" | "error";

export interface LoggerProps {
  prefix?: string;
  scope?: string;
  time?: boolean;
  level?: LogLevel;
  mode?: "minimal" | "classic" | "verbose";
  color?: string;
}

type LogStyle = {
  bg: string;
  color: string;
  borderRadius?: string;
};

const DEFAULT_STYLES: Record<LogLevel, LogStyle> = {
  info: { bg: "#5470c6", color: "white" },
  debug: { bg: "#dfa639", color: "white" },
  warn: { bg: "#e6a23c", color: "white" },
  error: { bg: "#f56c6c", color: "white" },
};

const SCOPE_STYLE: LogStyle = { bg: "#19be6b", color: "white" };

const LOG_COLORS = [
  "#5470c6",
  "#73d897",
  "#e6a23c",
  "#f56c6c",
  "#9c60e2",
  "#37a4c9",
  "#c45acb",
];

let _loggerColorIndex = 0;

function getNextLoggerColor(): string {
  const color = LOG_COLORS[_loggerColorIndex % LOG_COLORS.length];
  _loggerColorIndex += 1;
  return color;
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildLogParts(
  props: LoggerProps,
  level: LogLevel,
  loggerColor: string,
): string[] {
  const { prefix = "CORE", scope = "", time = false, mode = "classic" } = props;
  const levelStyle = DEFAULT_STYLES[level];
  const parts: string[] = [];
  const styles: string[] = [];

  if (mode === "verbose") {
    if (time) {
      parts.push(`%c[${formatTime()}]%c`);
      styles.push("color:#909399;", "font-weight:bold;");
    }
    parts.push(`%c${level.toUpperCase()}%c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-radius:2px;`,
      `color:${levelStyle.bg};`,
    );
  } else if (mode === "classic") {
    parts.push(`%c ${prefix} %c ${scope || level.toUpperCase()} %c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-top-left-radius:2px;border-bottom-left-radius:2px;`,
      `color:white;background:${loggerColor};border-top-right-radius:2px;border-bottom-right-radius:2px;`,
      `color:${loggerColor};`,
    );
  } else {
    parts.push(`%c${prefix}%c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-radius:2px;`,
      `color:${levelStyle.color};`,
    );
  }

  return [parts.join(" "), ...styles];
}

export function Logger(props: LoggerProps = {}) {
  const { scope = "" } = props;
  let loggerColor = props.color || getNextLoggerColor();
  const logMethods: Record<LogLevel, (...args: unknown[]) => void> = {
    info(...args: unknown[]) {
      console.log(...buildLogParts(props, "info", loggerColor), ...args);
    },
    debug(...args: unknown[]) {
      console.log(...buildLogParts(props, "debug", loggerColor), ...args);
    },
    warn(...args: unknown[]) {
      console.warn(...buildLogParts(props, "warn", loggerColor), ...args);
    },
    error(...args: unknown[]) {
      console.error(...buildLogParts(props, "error", loggerColor), ...args);
    },
  };

  const logger = {
    scope,
    get color() {
      return loggerColor;
    },
    set color(value: string) {
      loggerColor = value;
    },
    setColor(value: string) {
      loggerColor = value;
    },
    ...logMethods,
    log: logMethods.info,
  };

  return logger;
}

// This can live anywhere in your codebase:
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );
    });
  });
}

// function AAAView() {
//   const state = createState({
//     loading: true,
//   });
//   const request = createRequest({});
//   const ui = createUI({});
//   const methods = {};
//   const lifecycle = {
//     mounted() {
//       state.loading = false;
//     },
//   };
//   const vm = defineViewModel({
//     state,
//     methods,
//     lifecycle,
//   });
//   return vm;
// }

/**
 * 代码片段

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/base";

function HomeActionCreatePageViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {};
  let _state = {};
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export function HomeActionCreatePage(props: ViewComponentProps) {
  const vm = useViewModel(HomeActionCreatePageViewModel, [props]);

  return <div>Hello</div>;
}

 */
