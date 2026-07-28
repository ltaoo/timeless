import { BaseDomain, Handler } from "@timeless/inner-base";

enum Events {
  StateChange,
  PanelResize,
}

type TheTypesOfEvents = {
  [Events.StateChange]: ResizablePanelsState;
  [Events.PanelResize]: { panels: ResizablePanelCore[] };
};

type ResizablePanelsProps = {
  direction?: "horizontal" | "vertical";
  onResize?: (sizes: number[]) => void;
};

type ResizablePanelsState = {
  direction: "horizontal" | "vertical";
  isResizing: boolean;
};

export class ResizablePanelsCore extends BaseDomain<TheTypesOfEvents> {
  direction: "horizontal" | "vertical" = "horizontal";
  panels: ResizablePanelCore[] = [];
  isResizing = false;

  private element: HTMLElement | null = null;
  private resizingPanels: {
    before: ResizablePanelCore;
    after: ResizablePanelCore;
  } | null = null;
  private startPosition = 0;
  private startSizes: { before: number; after: number } = {
    before: 0,
    after: 0,
  };

  get state(): ResizablePanelsState {
    return {
      direction: this.direction,
      isResizing: this.isResizing,
    };
  }

  constructor(props: { _name?: string } & ResizablePanelsProps = {}) {
    super(props);

    const { direction = "horizontal", onResize } = props;
    this.direction = direction;

    if (onResize) {
      this.onPanelResize(() => {
        const sizes = this.panels.map((p) => p.state.size);
        onResize(sizes);
      });
    }
  }

  mount(element: HTMLElement) {
    this.element = element;
  }

  unmount() {
    this.element = null;
  }

  registerPanel(panel: ResizablePanelCore) {
    if (!this.panels.includes(panel)) {
      this.panels.push(panel);
      panel.setGroup(this);
    }
  }

  unregisterPanel(panel: ResizablePanelCore) {
    const index = this.panels.indexOf(panel);
    if (index > -1) {
      this.panels.splice(index, 1);
    }
  }

  startResize(
    panelBefore: ResizablePanelCore,
    panelAfter: ResizablePanelCore,
    e: PointerEvent,
  ) {
    if (!this.element) return;

    this.isResizing = true;
    this.resizingPanels = { before: panelBefore, after: panelAfter };

    this.startPosition =
      this.direction === "horizontal" ? e.clientX : e.clientY;
    this.startSizes = {
      before: panelBefore.state.size,
      after: panelAfter.state.size,
    };

    this.emit(Events.StateChange, this.state);
  }

  resize(e: PointerEvent) {
    if (!this.element || !this.resizingPanels) return;

    const currentPosition =
      this.direction === "horizontal" ? e.clientX : e.clientY;
    const delta = currentPosition - this.startPosition;

    const rect = this.element.getBoundingClientRect();
    const totalSize =
      this.direction === "horizontal" ? rect.width : rect.height;

    console.log("[ResizablePanelsCore] resize", {
      currentPosition,
      startPosition: this.startPosition,
      delta,
      totalSize,
      direction: this.direction,
    });

    if (totalSize === 0) return;

    const deltaPercent = (delta / totalSize) * 100;

    const newBeforeSize = Math.max(
      0,
      Math.min(100, this.startSizes.before + deltaPercent),
    );
    const newAfterSize = Math.max(
      0,
      Math.min(100, this.startSizes.after - deltaPercent),
    );

    // 确保总和不超过原始总和
    const originalTotal = this.startSizes.before + this.startSizes.after;
    const newTotal = newBeforeSize + newAfterSize;

    console.log("[ResizablePanelsCore] calculated sizes", {
      deltaPercent,
      startSizes: this.startSizes,
      newBeforeSize,
      newAfterSize,
      originalTotal,
      newTotal,
      diff: Math.abs(newTotal - originalTotal),
    });

    console.log("[ResizablePanelsCore] checking condition", {
      condition: Math.abs(newTotal - originalTotal) < 0.1,
      willUpdate: Math.abs(newTotal - originalTotal) < 0.1,
    });

    if (Math.abs(newTotal - originalTotal) < 0.1) {
      console.log("[ResizablePanelsCore] updating panel sizes");
      this.resizingPanels.before.setSize(newBeforeSize);
      this.resizingPanels.after.setSize(newAfterSize);

      this.emit(Events.PanelResize, { panels: this.panels });
    } else {
      console.log("[ResizablePanelsCore] skipping update, total mismatch");
    }
  }

  endResize() {
    this.isResizing = false;
    this.resizingPanels = null;
    this.emit(Events.StateChange, this.state);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  onPanelResize(handler: Handler<TheTypesOfEvents[Events.PanelResize]>) {
    return this.on(Events.PanelResize, handler);
  }
}

// ResizablePanel Core
enum PanelEvents {
  StateChange,
}

type PanelTypesOfEvents = {
  [PanelEvents.StateChange]: ResizablePanelState;
};

type ResizablePanelProps = {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
};

type ResizablePanelState = {
  size: number;
  isCollapsed: boolean;
};

export class ResizablePanelCore extends BaseDomain<PanelTypesOfEvents> {
  size: number;
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
  isCollapsed = false;

  private element: HTMLElement | null = null;
  private group: ResizablePanelsCore | null = null;

  get state(): ResizablePanelState {
    return {
      size: this.size,
      isCollapsed: this.isCollapsed,
    };
  }

  constructor(props: { _name?: string } & ResizablePanelProps = {}) {
    super(props);

    const {
      defaultSize = 50,
      minSize = 10,
      maxSize = 90,
      collapsible = false,
      collapsedSize = 0,
    } = props;

    this.size = defaultSize;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.collapsible = collapsible;
    this.collapsedSize = collapsedSize;
  }

  mount(element: HTMLElement) {
    this.element = element;
  }

  unmount() {
    this.element = null;
    if (this.group) {
      this.group.unregisterPanel(this);
    }
  }

  setGroup(group: ResizablePanelsCore) {
    this.group = group;
  }

  setSize(size: number) {
    const clampedSize = Math.max(this.minSize, Math.min(this.maxSize, size));

    console.log("[ResizablePanelCore] setSize", {
      requestedSize: size,
      clampedSize,
      minSize: this.minSize,
      maxSize: this.maxSize,
    });

    if (this.collapsible && clampedSize <= this.minSize) {
      this.size = this.collapsedSize;
      this.isCollapsed = true;
    } else {
      this.size = clampedSize;
      this.isCollapsed = false;
    }

    console.log("[ResizablePanelCore] new size:", this.size);

    this.emit(PanelEvents.StateChange, this.state);
  }

  collapse() {
    if (this.collapsible) {
      this.size = this.collapsedSize;
      this.isCollapsed = true;
      this.emit(PanelEvents.StateChange, this.state);
    }
  }

  expand() {
    if (this.isCollapsed) {
      this.size = this.minSize;
      this.isCollapsed = false;
      this.emit(PanelEvents.StateChange, this.state);
    }
  }

  onStateChange(handler: Handler<PanelTypesOfEvents[PanelEvents.StateChange]>) {
    return this.on(PanelEvents.StateChange, handler);
  }
}
