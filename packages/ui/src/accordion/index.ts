import { base, Handler } from "@timeless/base";
import { refarr } from "@timeless/reactive";
import type { RefArray } from "@timeless/reactive";

type AccordionCoreProps = {
  type?: "single" | "multiple";
  defaultOpenItems?: number[];
};

export function AccordionCore(props: AccordionCoreProps = {}) {
  const { type = "single", defaultOpenItems = [] } = props;

  const openItems: RefArray<number> = refarr(defaultOpenItems);

  const _state = {
    get openItems() {
      return openItems.value;
    },
    get type() {
      return type;
    },
  };

  enum Events {
    StateChange,
    OpenItemsChange,
  }

  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.OpenItemsChange]: number[];
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

    onOpenItemsChange(handler: Handler<TheTypesOfEvents[Events.OpenItemsChange]>) {
      return bus.on(Events.OpenItemsChange, handler);
    },
  };
}

export type AccordionCore = ReturnType<typeof AccordionCore>;
