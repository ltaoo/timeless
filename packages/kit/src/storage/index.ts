import { BaseDomain, Handler } from "@timeless/inner-base";
import { debounce } from "@timeless/inner-utils";

enum Events {
  StateChange,
}
type TheTypesOfEvents<T> = {
  [Events.StateChange]: StorageCoreState<T>;
};

type StorageCoreProps<T> = {
  key: string;
  values: T;
  defaultValues: T;
  client: {
    setItem: (key: string, value: string) => void;
    getItem: (key: string) => void;
  };
};
type StorageCoreState<T> = {
  values: T;
};

export class StorageCore<T extends Record<string, unknown>> extends BaseDomain<
  TheTypesOfEvents<T>
> {
  key: string;
  values: T;
  defaultValues: T;
  client: StorageCoreProps<T>["client"];

  get state() {
    return {
      values: this.values,
    };
  }

  constructor(props: Partial<{ _name: string }> & StorageCoreProps<T>) {
    super(props);

    const { key, client, defaultValues, values } = props;
    this.key = key;
    this.values = values;
    this.values = {
      ...defaultValues,
      ...values,
    };
    this.defaultValues = defaultValues;
    this.client = client;
  }

  get<K extends keyof T>(key: K, defaultValue?: T[K]) {
    const v = this.values[key];
    // console.log("[DOMAIN]storage/index - get", key, v, this.values);
    if (v === undefined) {
      if (defaultValue) {
        // @ts-ignore
        return defaultValue[key] as T[K];
      }
      throw new Error("the default value no existing");
    }
    return v as T[K];
  }
  set = ((key: keyof T, value: unknown) => {
    // console.log("cache set", key, value);
    // 内存里的 values 立即生效（读后写一致）；只有落盘与事件通知防抖。
    this.values = {
      ...this.values,
      [key]: value,
    };
    this.persist();
  }) as (key: keyof T, value: unknown) => void;
  /**
   * 落盘 + 通知，防抖只为合并密集写入。落盘时读的是 `this.values` 的最新快照，
   * 所以同一个窗口内对不同 key 的多次 `set` 不会互相丢弃（旧实现把早先那次整个丢掉）。
   */
  private persist = debounce(100, () => {
    this.client.setItem(this.key, JSON.stringify(this.values));
    this.emit(Events.StateChange, { ...this.state });
  });
  merge = <K extends keyof T>(
    key: K,
    values: Partial<T[K]>,
    extra: Partial<{ reverse: boolean; limit: number }> = {},
  ) => {
    // console.log("[]merge", key, values);
    const prevValues = this.get(key) || {};
    if (Array.isArray(prevValues)) {
      let nextValues = extra.reverse
        ? [...(values as unknown as Array<unknown>), ...prevValues]
        : [...prevValues, ...(values as unknown as Array<unknown>)];
      if (extra.limit) {
        nextValues = nextValues.slice(0, extra.limit);
      }
      this.set(key, nextValues);
      return nextValues;
    }
    if (typeof prevValues === "object" && typeof values === "object") {
      const nextValues = {
        ...prevValues,
        ...values,
      };
      this.set(key, nextValues);
      return nextValues;
    }
    console.warn("the params of merge must be object");
    return prevValues;
  };
  clear<K extends keyof T>(key: K) {
    const v = this.values[key];
    if (v === undefined) {
      return null;
    }
    this.values = {
      ...this.values,
      [key]: this.defaultValues[key],
    };
    this.client.setItem(this.key, JSON.stringify(this.values));
    this.emit(Events.StateChange, { ...this.state });
  }
  remove<K extends keyof T>(key: K) {
    this.clear(key);
  }

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
