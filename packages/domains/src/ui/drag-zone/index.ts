import { BaseDomain, Handler } from "@/base";

enum Events {
  StateChange,
  Change,
}
type TheTypesOfEvents = {
  [Events.Change]: (File | string)[];
  [Events.StateChange]: DragZoneState;
};

type DragZoneProps = {
  tip?: string;
  fill?: boolean;
  onChange?: (files: (File | string)[]) => void;
};
type DragZoneState = {
  hovering: boolean;
  selected: boolean;
  files: (File | string)[];
  value: (File | string)[];
  tip: string;
};

export class DragZoneCore extends BaseDomain<TheTypesOfEvents> {
  shape = "drag-upload" as const;
  _tip = "拖动文件到此处";
  _fill = true;
  _hovering: boolean = false;
  _selected: boolean = false;
  _files: (File | string)[] = [];

  get state(): DragZoneState {
    return {
      hovering: this._hovering,
      selected: this._selected,
      files: this._files,
      value: this._files,
      tip: this._tip,
    };
  }
  get value() {
    return this._files;
  }
  get files() {
    return this._files;
  }
  get hovering() {
    return this._hovering;
  }

  constructor(props: Partial<{ _name: string }> & DragZoneProps = {}) {
    super(props);

    const { tip, fill, onChange } = props;
    if (tip) {
      this._tip = tip;
    }
    if (fill !== undefined) {
      this._fill = fill;
    }
    if (onChange) {
      this.onChange(onChange);
    }
  }

  handleDragover() {
    this._hovering = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  handleDragleave() {
    this._hovering = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  handleDrop(files: (File | string)[]) {
    this._hovering = false;
    if (!files || files.length === 0) {
      this._selected = false;
      this._files = [];
      return;
    }
    if (this._fill) {
      this._files = files;
      this._selected = true;
    }
    this.emit(Events.Change, [...files]);
    this.emit(Events.StateChange, { ...this.state });
  }
  getFileByName(name: string) {
    return this._files.find((f) => (typeof f === "string" ? f === name : f.name === name));
  }

  clear() {
    this._files = [];
    this._selected = false;
    this.emit(Events.Change, []);
    this.emit(Events.StateChange, { ...this.state });
  }

  watchFolder(path: string) {
    // Stub
  }
  stopWatchFolder() {
    // Stub
  }
  setValue() {}

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
