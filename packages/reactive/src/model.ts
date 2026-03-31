import { Ref, isRef } from "./types";

type UnwrapState<S> = {
  [K in keyof S]: S[K] extends Ref<infer V> ? V : S[K];
};

type Unlisten = () => void;

type OnMethodHandlers<M> = {
  [K in keyof M as `on${Capitalize<string & K>}`]: (
    handler: (
      ...args: M[K] extends (...args: infer A) => any ? A : never
    ) => void,
  ) => Unlisten;
};

type TimelessViewModel<
  S extends Record<string, any>,
  M extends Record<string, (...args: any[]) => any>,
  H extends Record<string, any> = {},
  U extends Record<string, any> = {},
  Sr extends Record<string, any> = {},
> = {
  state: S;
  methods: M;
  handlers: H;
  ui: U;
  services: Sr;
  onStateChange: (listener: (state: UnwrapState<S>) => void) => Unlisten;
  onError: (handler: (error: Error) => void) => Unlisten;
  ready: (handler: () => void) => Unlisten;
  onDestroy: (handler: () => void) => Unlisten;
  destroy: () => void;
} & OnMethodHandlers<M>;

export function defineModel<
  S extends Record<string, any>,
  M extends Record<string, (...args: any[]) => any>,
  H extends Record<string, any> = {},
  U extends Record<string, any> = {},
  Sr extends Record<string, any> = {},
>(model: {
  state: S;
  methods: M;
  handlers?: H;
  ui?: U;
  services?: Sr;
  listeners?: Array<Unlisten | undefined | null>;
}): TimelessViewModel<S, M, H, U, Sr> {
  const {
    state,
    methods,
    handlers = {},
    ui = {},
    services = {},
    listeners = [],
  } = model;

  const emitter: Record<string, Array<(...args: any[]) => void>> = {};

  function emit(event: string, ...args: any[]) {
    const list = emitter[event];
    if (list) {
      for (let i = 0; i < list.length; i += 1) {
        list[i](...args);
      }
    }
  }

  function on(event: string, handler: (...args: any[]) => void): Unlisten {
    if (!emitter[event]) {
      emitter[event] = [];
    }
    emitter[event].push(handler);
    return () => {
      const list = emitter[event];
      if (list) {
        emitter[event] = list.filter((l) => l !== handler);
      }
    };
  }

  const state_listeners: Array<(state: UnwrapState<S>) => void> = [];

  let pending = false;
  function notify_state_listeners() {
    if (pending) {
      return;
    }
    pending = true;
    queueMicrotask(() => {
      pending = false;
      const snapshot = {} as UnwrapState<S>;
      for (const key of Object.keys(state)) {
        const v = state[key];
        snapshot[key as keyof UnwrapState<S>] = isRef(v) ? v.value : v;
      }
      for (const listener of state_listeners) {
        listener(snapshot);
      }
    });
  }

  for (const key of Object.keys(state)) {
    const v = state[key];
    if (isRef(v)) {
      v._subscribe({ onChange: notify_state_listeners });
    }
  }

  const error_listeners: Array<(error: Error) => void> = [];
  function notify_error(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    for (const handler of error_listeners) {
      handler(err);
    }
  }

  const wrapped_methods = {} as M;
  for (const key of Object.keys(methods)) {
    const original = methods[key];
    (wrapped_methods as any)[key] = function (...args: any[]) {
      try {
        const res = original(...args);
        emit(key, ...args);
        if (res && typeof (res as any).then === "function") {
          (res as Promise<any>).catch((e) => {
            notify_error(e);
            throw e;
          });
        }
        return res;
      } catch (e) {
        notify_error(e);
        throw e;
      }
    };
  }

  const ready_listeners: Array<() => void> = [];

  const result: any = {
    state,
    methods: wrapped_methods,
    handlers,
    ui,
    services,
    onStateChange(listener: (state: UnwrapState<S>) => void) {
      state_listeners.push(listener);
      return () => {
        const idx = state_listeners.indexOf(listener);
        if (idx !== -1) {
          state_listeners.splice(idx, 1);
        }
      };
    },
    onError(handler: (error: Error) => void) {
      error_listeners.push(handler);
      return () => {
        const idx = error_listeners.indexOf(handler);
        if (idx !== -1) {
          error_listeners.splice(idx, 1);
        }
      };
    },
    ready(handler: () => void) {
      ready_listeners.push(handler);
      return () => {
        const idx = ready_listeners.indexOf(handler);
        if (idx !== -1) {
          ready_listeners.splice(idx, 1);
        }
      };
    },
    onDestroy(handler: () => void) {
      return on("__destroy", handler);
    },
    destroy() {
      for (const unlisten of listeners) {
        if (typeof unlisten === "function") {
          unlisten();
        }
      }
      emit("__destroy");
      for (const key of Object.keys(emitter)) {
        delete emitter[key];
      }
      state_listeners.length = 0;
      ready_listeners.length = 0;
      error_listeners.length = 0;
    },
  };

  queueMicrotask(() => {
    for (const handler of ready_listeners) {
      handler();
    }
  });

  for (const key of Object.keys(methods)) {
    const cap = key.charAt(0).toUpperCase() + key.slice(1);
    result[`on${cap}`] = function (handler: (...args: any[]) => void) {
      return on(key, handler);
    };
  }

  return result as TimelessViewModel<S, M, H, U, Sr>;
}
