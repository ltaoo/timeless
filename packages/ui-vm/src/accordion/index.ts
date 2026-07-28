import { base, Handler } from "@timeless/inner-base";
import { refarr, RefArray } from "@timeless/inner-reactive";

type AccordionCoreProps = {
  type?: "single" | "multiple";
  defaultOpenItems?: number[];
};

export type AccordionCoreState = {
  openItems: number[];
  type: "single" | "multiple";
};

export type AccordionCoreStore = {
  shape: "accordion";
  type: "single" | "multiple";
  openItems: RefArray<number>;
  state: AccordionCoreState;
  toggle(index: number): void;
  open(index: number): void;
  close(index: number): void;
  isOpen(index: number): boolean;
  onStateChange(handler: Handler<AccordionCoreState>): () => void;
  onOpenItemsChange(handler: Handler<number[]>): () => void;
};

export function AccordionCore(props: AccordionCoreProps = {}): AccordionCoreStore {
  const { type = "single" } = props;

  const openItems: RefArray<number> = refarr(props.defaultOpenItems || []);

  const _state: AccordionCoreState = {
    get openItems() {
      return openItems.value;
    },
    get type() {
      return type;
    },
  };

  enum Events {
    OpenItemsChange,
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.OpenItemsChange]: number[];
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    shape: "accordion" as const,
    type,
    openItems,
    state: _state,
    toggle(index: number) {
      if (type === "single") {
        openItems.as(openItems.value.includes(index) ? [] : [index]);
      } else {
        const nextOpenItems = openItems.value.includes(index)
          ? openItems.value.filter((i: number) => i !== index)
          : [...openItems.value, index];
        openItems.as(nextOpenItems);
      }
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    open(index: number) {
      if (type === "single") {
        openItems.as([index]);
      } else {
        if (!openItems.value.includes(index)) {
          openItems.as([...openItems.value, index]);
        }
      }
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    close(index: number) {
      openItems.as(openItems.value.filter((i: number) => i !== index));
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    isOpen(index: number) {
      return openItems.value.includes(index);
    },

    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },

    onOpenItemsChange(
      handler: Handler<TheTypesOfEvents[Events.OpenItemsChange]>,
    ) {
      return bus.on(Events.OpenItemsChange, handler);
    },
  };
}

export type AccordionCore = ReturnType<typeof AccordionCore>;
