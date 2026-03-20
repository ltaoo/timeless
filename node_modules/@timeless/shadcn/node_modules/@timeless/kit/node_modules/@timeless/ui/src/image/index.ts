import { Handler } from "mitt";

import { BaseDomain } from "@timeless/base";

enum Events {
  StateChange,
  StartLoad,
  Loaded,
  Error,
}
type TheTypesOfEvents = {
  [Events.StateChange]: ImageState;
  [Events.StartLoad]: void;
  [Events.Loaded]: void;
  [Events.Error]: void;
};
export enum ImageStep {
  Pending,
  Loading,
  Loaded,
  Failed,
}

type ImageProps = {
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 图片地址 */
  src?: string;
  /** 说明 */
  alt?: string;
  scale?: number;
  /** 模式 */
  fit?: "cover" | "contain";
  unique_id?: unknown;
};
type ImageState = Omit<ImageProps, "scale"> & {
  step: ImageStep;
  scale: number | null;
};

export class ImageCore extends BaseDomain<TheTypesOfEvents> {
  static prefix = "";
  static url(url?: string | null) {
    if (!url) {
      return "";
    }
    if (url.includes("http")) {
      return url;
    }
    if (url.startsWith("data:image")) {
      return url;
    }
    return ImageCore.prefix + url;
  }

  unique_uid: unknown;
  src: string;
  width: number;
  height: number;
  scale: null | number = null;
  fit: "cover" | "contain";

  step: ImageStep = ImageStep.Pending;
  realSrc?: string;

  get state(): ImageState {
    return {
      src: this.src,
      step: this.step,
      width: this.width,
      height: this.height,
      scale: this.scale,
    };
  }

  constructor(props: Partial<{}> & ImageProps) {
    super();

    const {
      unique_id,
      width = 200,
      height = 200,
      src,
      scale,
      fit = "cover",
    } = props;
    this.width = width;
    this.height = height;
    this.src = "";
    this.fit = fit;
    this.realSrc = src;
    if (scale) {
      this.scale = scale;
    }
    if (unique_id) {
      this.unique_uid = unique_id;
    }
  }

  setSrc(src: string) {
    this.src = src;
    this.emit(Events.StateChange, { ...this.state });
  }

  handleShow() {
    // console.log("[DOMAIN]ui/image - show", this.src);
    if (this.step === ImageStep.Loaded) {
      return;
    }
    if (this.step === ImageStep.Loading) {
      return;
    }
    this.step = ImageStep.Loading;
    this.emit(Events.StartLoad);
    this.emit(Events.StateChange, { ...this.state });
  }

  handleLoaded() {
    this.step = ImageStep.Loaded;
    this.emit(Events.Loaded);
    this.emit(Events.StateChange, { ...this.state });
  }

  setLoaded() {
    this.step = ImageStep.Loaded;
    this.emit(Events.Loaded);
    this.emit(Events.StateChange, { ...this.state });
  }

  setURL(url: string) {
    this.src = ImageCore.url(url);
    this.emit(Events.StateChange, { ...this.state });
  }

  handleError() {
    this.step = ImageStep.Failed;
    this.emit(Events.Error);
    this.emit(Events.StateChange, { ...this.state });
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}

export class ImageInListCore extends ImageCore {
  constructor(props: Partial<ImageProps> = {}) {
    super(props);
  }
  bind(src: string) {
    return new ImageCore({ ...this, src });
  }
}
