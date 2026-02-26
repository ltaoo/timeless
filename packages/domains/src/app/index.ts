/**
 * @file 应用，包含一些全局相关的事件、状态
 */

import { BaseDomain, Handler } from "@/base";
import { StorageCore } from "@/storage/index";
import { Result } from "@timeless/utils";
import { JSONObject } from "@timeless/utils";

import { ThemeTypes } from "./types";

export * from "./types";

export enum OrientationTypes {
  Horizontal = "horizontal",
  Vertical = "vertical",
}
const mediaSizes = {
  sm: 0,
  /** 中等设备宽度阈值 */
  md: 768,
  /** 大设备宽度阈值 */
  lg: 992,
  /** 特大设备宽度阈值 */
  xl: 1200,
  /** 特大设备宽度阈值 */
  "2xl": 1536,
};
function getCurrentDeviceSize(width: number) {
  if (width >= mediaSizes["2xl"]) {
    return "2xl";
  }
  if (width >= mediaSizes.xl) {
    return "xl";
  }
  if (width >= mediaSizes.lg) {
    return "lg";
  }
  if (width >= mediaSizes.md) {
    return "md";
  }
  return "sm";
}
export type DeviceSizeTypes = keyof typeof mediaSizes;

enum Events {
  Tip,
  Loading,
  HideLoading,
  Error,
  Login,
  Logout,
  ForceUpdate,
  DeviceSizeChange,
  /** 生命周期 */
  Ready,
  Show,
  Hidden,
  /** 平台相关 */
  Resize,
  Blur,
  Keydown,
  OrientationChange,
  EscapeKeyDown,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Ready]: void;
  [Events.Error]: Error;
  [Events.Tip]: { icon?: unknown; text: string[] };
  [Events.Loading]: { text: string[] };
  [Events.HideLoading]: void;
  [Events.Login]: {};
  [Events.Logout]: void;
  [Events.ForceUpdate]: void;
  [Events.Resize]: {
    width: number;
    height: number;
  };
  [Events.DeviceSizeChange]: DeviceSizeTypes;
  [Events.Keydown]: {
    code: string;
    preventDefault: () => void;
  };
  [Events.EscapeKeyDown]: void;
  [Events.Blur]: void;
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.OrientationChange]: "vertical" | "horizontal";
  [Events.StateChange]: ApplicationState;
};
type ApplicationState = {
  ready: boolean;
  env: JSONObject;
  theme: ThemeTypes;
  deviceSize: DeviceSizeTypes;
  height: number;
};
type ApplicationProps<T extends { storage: StorageCore<any>; user: any }> = {
  user: T["user"];
  storage: T["storage"];
  // history: HistoryCore;
  /**
   * 应用加载前的声明周期，只有返回 Result.Ok() 页面才会展示内容
   */
  beforeReady?: () => Promise<Result<null>>;
  onReady?: () => void;
};

export class Application<
  T extends { storage: StorageCore<any>; user: any },
> extends BaseDomain<TheTypesOfEvents> {
  /** 用户 */
  $user: T["user"];
  $storage: T["storage"];

  lifetimes: Pick<ApplicationProps<T>, "beforeReady" | "onReady">;

  ready = false;
  screen: {
    statusBarHeight?: number;
    menuButton?: {
      width: number;
      left: number;
      right: number;
    };
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };
  env: {
    wechat: boolean;
    ios: boolean;
    android: boolean;
    pc: boolean;
    weapp: boolean;
    prod: "develop" | "trial" | "release";
  } = {
    wechat: false,
    ios: false,
    android: false,
    pc: false,
    weapp: false,
    prod: "develop",
  };
  orientation = OrientationTypes.Vertical;
  curDeviceSize: DeviceSizeTypes = "md";
  height = 0;
  theme: ThemeTypes = "system";

  safeArea = false;
  Events = Events;

  // @todo 怎么才能更方便地拓展 Application 类，给其添加许多的额外属性还能有类型提示呢？

  get state(): ApplicationState {
    return {
      ready: this.ready,
      theme: this.theme,
      env: this.env,
      deviceSize: this.curDeviceSize,
      height: this.height,
    };
  }

  constructor(props: ApplicationProps<T>) {
    super();

    const { user, storage, beforeReady, onReady } = props;

    this.$user = user;
    this.$storage = storage;

    this.lifetimes = {
      beforeReady,
      onReady,
    };
  }
  /** 启动应用 */
  async start(size: { width: number; height: number }) {
    const { width, height } = size;
    this.screen = { ...this.screen, width, height };
    this.curDeviceSize = getCurrentDeviceSize(width);
    // console.log('[Application]start');
    const { beforeReady } = this.lifetimes;
    if (beforeReady) {
      const r = await beforeReady();
      // console.log("[]Application - ready result", r);
      if (r.error) {
        return Result.Err(r.error);
      }
    }
    this.ready = true;
    this.emit(Events.Ready);
    this.emit(Events.StateChange, { ...this.state });
    // console.log("[]Application - before start");
    return Result.Ok(null);
  }

  getComputedStyle(el: unknown) {
    return {} as CSSStyleDeclaration;
  }
  setTitle(title: string) {}
  setSize(size: { width: number; height: number }) {
    const { width, height } = size;
    this.screen = { ...this.screen, width, height };
    this.curDeviceSize = getCurrentDeviceSize(width);
    this.emit(Events.Resize, { width, height });
    this.emit(Events.DeviceSizeChange, this.curDeviceSize);
  }
  setEnv(env: Partial<Application<T>["env"]>) {
    this.env = {
      ...this.env,
      ...env,
    };
  }
  handleResize(size: { width: number; height: number }) {
    this.setSize(size);
  }
  /** 处理屏幕方向变化 */
  handleScreenOrientationChange(
    orientation: number | "vertical" | "horizontal",
  ) {
    if (typeof orientation === "number") {
      this.orientation =
        orientation === 0
          ? OrientationTypes.Vertical
          : OrientationTypes.Horizontal;
    }
    if (typeof orientation === "string") {
      this.orientation =
        orientation === "vertical"
          ? OrientationTypes.Vertical
          : OrientationTypes.Horizontal;
    }
    this.emit(Events.OrientationChange, this.orientation);
  }
  keydown(event: { key: string }) {
    if (event.key === "Escape") {
      this.emit(Events.EscapeKeyDown);
    }
    this.emit(Events.Keydown, {
      code: event.key,
      preventDefault: () => {},
    });
  }
  copy(text: string) {}
  disablePointer() {}
  enablePointer() {}
  login() {
    this.emit(Events.Login, {});
  }
  logout() {
    this.emit(Events.Logout);
  }
}

export type ApplicationModel<T extends { storage: StorageCore<any>; user: any }> =
  Application<T>;
