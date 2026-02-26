import { BaseDomain } from "@/domains/base";

export class StopWatchViewModel extends BaseDomain<any> {
  state = {
    running: false,
    minutes1: "0",
    minutes2: "0",
    seconds1: "0",
    seconds2: "0",
    ms1: "0",
    ms2: "0",
  };

  reset() {}
  toggle() {}

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
