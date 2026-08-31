import { BaseDomain, Handler } from "@timeless/inner-base";

export type HLSPlayerStatus =
  | "idle"
  | "waiting"
  | "loading"
  | "ready"
  | "playing"
  | "error";

export type HLSPlayerReason =
  | "idle"
  | "waiting-source"
  | "source-missing"
  | "source-loading"
  | "source-ready"
  | "playing"
  | "buffering"
  | "network-retry"
  | "media-recovery"
  | "unsupported"
  | "invalid-target"
  | "invalid-source"
  | "playback-error";

export type HLSPlayerState = {
  status: HLSPlayerStatus;
  reason: HLSPlayerReason;
};

export type HLSPlayerMountOptions = {
  url: string;
  autoplay?: boolean;
  terminal?: boolean;
  pollInterval?: number;
};

export type HLSPlayerSession = number;

enum Events {
  StateChange,
}

type TheTypesOfEvents = {
  [Events.StateChange]: HLSPlayerState;
};

export class HLSPlayerCore extends BaseDomain<TheTypesOfEvents> {
  status: HLSPlayerStatus = "idle";
  reason: HLSPlayerReason = "idle";

  get state(): HLSPlayerState {
    return {
      status: this.status,
      reason: this.reason,
    };
  }

  mount(
    target: unknown,
    options: HLSPlayerMountOptions,
  ): HLSPlayerSession | null {
    console.warn("请在 provider 中实现 HLSPlayerCore.mount 方法");
    return null;
  }

  unmount(session?: HLSPlayerSession | null): boolean {
    console.warn("请在 provider 中实现 HLSPlayerCore.unmount 方法");
    return false;
  }

  handleStateChange(state: HLSPlayerState) {
    if (state.status === this.status && state.reason === this.reason) {
      return;
    }
    this.status = state.status;
    this.reason = state.reason;
    this.emit(Events.StateChange, { ...this.state });
  }

  onStateChange(handler: Handler<HLSPlayerState>) {
    return this.on(Events.StateChange, handler);
  }

  destroy() {
    this.unmount();
    super.destroy();
  }
}
