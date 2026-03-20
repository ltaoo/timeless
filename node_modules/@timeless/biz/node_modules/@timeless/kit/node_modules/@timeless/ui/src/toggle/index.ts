import { BaseDomain } from "@timeless/base";

export class ToggleCore extends BaseDomain<any> {
  state = {
    checked: false,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      checked: props.defaultValue || false,
    };
  }

  onStateChange(handler: (state: any) => void) {
    return this.on("stateChange" as any, handler);
  }

  toggle() {
    this.state.checked = !this.state.checked;
    this.emit("stateChange" as any, this.state);
  }
}
