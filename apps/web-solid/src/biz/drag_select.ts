import { BaseDomain } from "@/domains/base";

export interface DragSelectOpt {
  label: string;
  value: any;
}

export class DragSelectViewModel<T extends DragSelectOpt> extends BaseDomain<any> {
  cell_height = 40;
  state = {
    selected: [] as T[],
    visible_count: 5,
    top_padding_count: 0,
    bottom_padding_count: 0,
    options: [] as T[],
  };
  methods = {
    bindNode: (el: HTMLElement) => {},
    handleMounted: () => {},
    handleScroll: (pos: { left: number; top: number }) => {},
  };
  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
