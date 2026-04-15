/**
 * @file 应用，包含一些全局相关的事件、状态
 */

import { BaseDomain, Handler, Result } from "@timeless/base";
import { JSONObject } from "@timeless/types";

import { StorageCore } from "@/storage";
import { ClipboardModel } from "@/clipboard";

import { ThemeTypes, OrientationTypes } from "./types";
import { getCurrentDeviceSize, DeviceSizeTypes } from "./utils";

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
  Keyup,
  OrientationChange,
  EscapeKeyDown,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Ready]: void;
  [Events.Error]: Error;
  [Events.Tip]: {
    icon?: unknown;
    text: string[];
    type?: "success" | "error" | "info" | "warning" | "loading";
  };
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
  [Events.Keydown]: KeyboardEvent;
  [Events.Keyup]: KeyboardEvent;
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
type ApplicationProps<T extends { storage: StorageCore<any> }> = {
  storage: T["storage"];
  clipboard: ClipboardModel;
  // history: HistoryCore;
  /**
   * 应用加载前的声明周期，只有返回 Result.Ok() 页面才会展示内容
   */
  beforeReady?: () => Promise<Result<null>>;
  onReady?: () => void;
};

export class ApplicationModel<
  T extends { storage: StorageCore<any> },
> extends BaseDomain<TheTypesOfEvents> {
  $storage: T["storage"];
  $clipboard: ClipboardModel;

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

    const { storage, clipboard, beforeReady, onReady } = props;

    this.$storage = storage;
    this.$clipboard = clipboard;

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
  /** 应用指定主题 */
  setTheme(theme: ThemeTypes) {
    const tip = "请在 connect.web 中实现 setTheme 方法";
    console.warn(tip);
    return Result.Err(tip);
  }
  getTheme(): ThemeTypes {
    return this.theme;
  }
  // getSystemTheme(e?: any): Result<string> {
  //   const tip = "请在 connect.web 中实现 getSystemTheme 方法";
  //   console.warn(tip);
  //   return Result.Err(tip);
  // }
  // push(...args: Parameters<HistoryCore["push"]>) {
  //   return this.$history.push(...args);
  // }
  // replace(...args: Parameters<HistoryCore["replace"]>) {
  //   return this.$history.replace(...args);
  // }
  // back(...args: Parameters<HistoryCore["back"]>) {
  //   return this.$history.back(...args);
  // }

  tipUpdate() {
    this.emit(Events.ForceUpdate);
  }
  tip(arg: {
    icon?: unknown;
    text: string[];
    type?: "success" | "error" | "info" | "warning" | "loading";
  }) {
    this.emit(Events.Tip, arg);
    return arg.text.join("\n");
  }
  loading(arg: { text: string[] }) {
    this.emit(Events.Loading, arg);
    return {
      hideLoading: () => {
        this.emit(Events.HideLoading);
      },
    };
  }
  hideLoading() {
    this.emit(Events.HideLoading);
  }
  /** 手机震动 */
  vibrate() {}
  setSize(size: { width: number; height: number }) {
    this.screen = size;
  }
  /** 设置页面 title */
  setTitle(title: string): void {
    console.warn("请在 connect.web 中实现 setTitle 方法");
  }
  openWindow(url: string) {
    console.warn("请在 connect.web 中实现 openWindow 方法");
  }
  setEnv(env: JSONObject) {
    this.env = {
      ...this.env,
      ...env,
    };
  }
  setHeight(v: number) {
    this.height = v;
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 复制文本到粘贴板 */
  copy(text: string) {
    // throw new Error("请实现 copy 方法");
    this.$clipboard.methods.writeText(text);
  }
  getComputedStyle(el: unknown): {} {
    console.warn("请在 connect.web 中实现 getComputedStyle 方法");
    return {};
  }
  /** 发送推送 */
  notify(msg: { title: string; body: string }) {
    console.warn("请在 connect.web 中实现 notify 方法");
  }
  disablePointer() {
    console.warn("请在 connect.web 中实现 disablePointer 方法");
  }
  enablePointer() {
    console.warn("请在 connect.web 中实现 enablePointer 方法");
  }
  /** 平台相关的全局事件 */
  keydown(event: KeyboardEvent) {
    if (event.code === "Escape") {
      this.escape();
    }
    this.emit(Events.Keydown, event);
  }
  keyup(event: KeyboardEvent) {
    this.emit(Events.Keyup, event);
  }
  escape() {
    this.emit(Events.EscapeKeyDown);
  }
  resize(size: { width: number; height: number }) {
    this.screen = size;
    this.emit(Events.Resize, size);
  }
  blur() {
    this.emit(Events.Blur);
  }

  handleScreenOrientationChange(orientation: number) {
    if (orientation === 0) {
      this.orientation = OrientationTypes.Vertical;
      this.emit(Events.OrientationChange, this.orientation);
      return;
    }
    this.orientation = OrientationTypes.Horizontal;
    this.emit(Events.OrientationChange, this.orientation);
  }
  handleResize(size: { width: number; height: number }) {
    this.screen = size;
    const mediaStr = getCurrentDeviceSize(size.width);
    if (mediaStr !== this.curDeviceSize) {
      this.curDeviceSize = mediaStr;
      this.emit(Events.DeviceSizeChange, this.curDeviceSize);
    }
    this.emit(Events.Resize, size);
  }

  /* ----------------
   * Lifetime
   * ----------------
   */
  onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>) {
    return this.on(Events.Ready, handler);
  }
  onDeviceSizeChange(
    handler: Handler<TheTypesOfEvents[Events.DeviceSizeChange]>,
  ) {
    return this.on(Events.DeviceSizeChange, handler);
  }
  onUpdate(handler: Handler<TheTypesOfEvents[Events.ForceUpdate]>) {
    return this.on(Events.ForceUpdate, handler);
  }
  /** 平台相关全局事件 */
  onOrientationChange(
    handler: Handler<TheTypesOfEvents[Events.OrientationChange]>,
  ) {
    return this.on(Events.OrientationChange, handler);
  }
  onResize(handler: Handler<TheTypesOfEvents[Events.Resize]>) {
    return this.on(Events.Resize, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onKeydown(handler: Handler<TheTypesOfEvents[Events.Keydown]>) {
    return this.on(Events.Keydown, handler);
  }
  onKeyup(handler: Handler<TheTypesOfEvents[Events.Keyup]>) {
    return this.on(Events.Keyup, handler);
  }
  onEscapeKeyDown(handler: Handler<TheTypesOfEvents[Events.EscapeKeyDown]>) {
    return this.on(Events.EscapeKeyDown, handler);
  }
  onTip(handler: Handler<TheTypesOfEvents[Events.Tip]>) {
    return this.on(Events.Tip, handler);
  }
  onLoading(handler: Handler<TheTypesOfEvents[Events.Loading]>) {
    return this.on(Events.Loading, handler);
  }
  onHideLoading(handler: Handler<TheTypesOfEvents[Events.HideLoading]>) {
    return this.on(Events.HideLoading, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  /**
   * ----------------
   * Event
   * ----------------
   */
  onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
    return this.on(Events.Error, handler);
  }
}
