import { BaseDomain } from "@/domains/base";

export class BottomMenuCore extends BaseDomain<any> {
  state: {
    icon: any;
    text: any;
    active: boolean;
    badge: boolean;
  };
  pathname: string = "";

  constructor(props: any) {
    super();
    this.state = {
      icon: props.icon,
      text: props.text,
      active: false,
      badge: false,
    };
  }

  onStateChange(handler: (state: any) => void) {
    return this.on("stateChange" as any, handler);
  }

  setState(partialState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...partialState };
    this.emit("stateChange" as any, this.state);
  }

  handleClick() {}

  hide() {
    this.setState({ active: false });
  }

  select() {
    this.setState({ active: true });
  }

  setCanTop(canTop: boolean | any) {}
  setCanRefresh(canRefresh?: boolean) {}
  disable() {}
  onScrollToTop(handler: () => void) {}
  onRefresh(handler: () => void) {}
}
