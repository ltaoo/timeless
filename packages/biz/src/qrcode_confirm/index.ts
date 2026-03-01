import { BaseDomain, Handler, BizError, Result } from "@timeless/base";

export enum AuthCodeStep {
  Loading = "loading",
  Scanned = "scanned",
  Confirmed = "confirmed",
  Expired = "expired",
}

export class QRCodeWithStateCore extends BaseDomain<{
  StateChange: {
    unique_id: string;
    step: AuthCodeStep;
    error?: BizError | null;
  };
  Confirm: string;
}> {
  unique_id: string = "";
  step: AuthCodeStep = AuthCodeStep.Loading;
  client: any;
  error: BizError | null = null;

  constructor(props: { unique_id?: string; step?: AuthCodeStep; client: any }) {
    super();
    this.unique_id = props.unique_id || "";
    this.step = props.step || AuthCodeStep.Loading;
    this.client = props.client;
  }

  get state() {
    return {
      unique_id: this.unique_id,
      step: this.step,
      error: this.error,
    };
  }

  onConfirm(cb: (token: string) => void) {
    this.on("Confirm", cb);
  }

  onStateChange(cb: (state: any) => void) {
    this.on("StateChange", cb);
  }

  async refresh() {
    this.step = AuthCodeStep.Loading;
    this.error = null;
    this.unique_id = "mock-id";
    this.emit("StateChange", this.state);
    return Result.Ok({ id: this.unique_id });
  }

  startCheck() {
    // Start polling or socket
  }
}

export function QRCodeWithState(props: any) {
  return new QRCodeWithStateCore(props);
}
