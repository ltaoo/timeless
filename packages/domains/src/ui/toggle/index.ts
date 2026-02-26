import { BaseDomain } from "@/base";

export class ToggleCore extends BaseDomain<any> {
  state = {
    boolean: false,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      boolean: props.defaultValue || false,
    };
  }

  onStateChange(handler: (state: any) => void) {
    return this.on("stateChange" as any, handler);
  }

  toggle() {
    this.state.boolean = !this.state.boolean;
    this.emit("stateChange" as any, this.state);
  }
}
