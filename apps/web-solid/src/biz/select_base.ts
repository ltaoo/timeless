import { BaseDomain } from "@/domains/base";

export class SelectViewModel extends BaseDomain<any> {
  state = {
    list: [] as any[],
  };
  constructor(props?: any) {
    super();
    if (props?.list) {
      this.state.list = props.list;
    }
  }
  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
