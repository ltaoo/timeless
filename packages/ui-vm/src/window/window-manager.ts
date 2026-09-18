/**
 * WindowManager - 平台无关的多窗口层级 + 位置管理器
 *
 * 与 LayerManager（点击外部即 dismiss 的浮层）语义不同：这里管理的窗口常驻，
 * 只负责「谁在最上面」与「每个窗口落在哪」，窗口自身的拖拽数学仍在视图层。
 *
 * 层级用列表顺序隐式表达：`windows` 末尾即栈顶，每次结构变化后统一按
 * `z = baseZ + i * stepZ` 重算，因此不会出现索引与 z 不一致。
 *
 * 使用方式：
 * 1. 打开窗口调用 open(id, position)
 * 2. 点击窗口置顶调用 focus(id)
 * 3. 拖拽结束调用 moveTo(id, position)
 * 4. 关闭窗口调用 close(id) / closeAll()
 */

import { BaseDomain, Handler } from "@timeless/inner-base";

import { WindowPoint } from "./section";

export type ManagedWindowState = {
  id: string;
  position: WindowPoint;
  z: number;
};

export type WindowManagerState = {
  windows: ManagedWindowState[];
  activeId: string;
};

export type WindowManagerProps = {
  /** 最底层窗口的 z-index，默认 240 */
  baseZ?: number;
  /** 每高一层递增的 z-index，默认 1 */
  stepZ?: number;
};

export const DEFAULT_WINDOW_BASE_Z = 240;
export const DEFAULT_WINDOW_STEP_Z = 1;

enum Events {
  StateChange,
  WindowsChange,
  ActiveChange,
}

type TheTypesOfEvents = {
  [Events.StateChange]: WindowManagerState;
  [Events.WindowsChange]: { opened: string[]; closed: string[] };
  [Events.ActiveChange]: string;
};

type ManagedWindow = {
  id: string;
  position: WindowPoint;
  z: number;
};

function normalize_point(position?: Partial<WindowPoint> | null): WindowPoint {
  const x = Number(position && position.x);
  const y = Number(position && position.y);
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  };
}

export class WindowManager extends BaseDomain<TheTypesOfEvents> {
  private baseZ: number;
  private stepZ: number;
  /** 顺序即层级，末尾最上 */
  private _windows: ManagedWindow[] = [];
  private _activeId = "";

  constructor(props: WindowManagerProps = {}) {
    super({});
    this.unique_id = "WindowManager";
    const baseZ = Number(props.baseZ);
    const stepZ = Number(props.stepZ);
    this.baseZ = Number.isFinite(baseZ) ? baseZ : DEFAULT_WINDOW_BASE_Z;
    this.stepZ = Number.isFinite(stepZ) ? stepZ : DEFAULT_WINDOW_STEP_Z;
  }

  /** 全量快照（每次读取返回新对象，调用方可安全持有） */
  get state(): WindowManagerState {
    return {
      windows: this._windows.map((item) => ({
        id: item.id,
        position: { ...item.position },
        z: item.z,
      })),
      activeId: this._activeId,
    };
  }

  get size(): number {
    return this._windows.length;
  }

  get activeId(): string {
    return this._activeId;
  }

  has(id: string): boolean {
    const key = String(id);
    return this._windows.some((item) => item.id === key);
  }

  /** 未找到返回 -1 */
  zIndexOf(id: string): number {
    const key = String(id);
    const item = this._windows.find((entry) => entry.id === key);
    return item ? item.z : -1;
  }

  /** 未找到返回 { x: 0, y: 0 } */
  positionOf(id: string): WindowPoint {
    const key = String(id);
    const item = this._windows.find((entry) => entry.id === key);
    return item ? { ...item.position } : { x: 0, y: 0 };
  }

  /** 不存在则追加并聚焦；已存在则仅聚焦（位置不动） */
  open(id: string, position?: Partial<WindowPoint> | null): ManagedWindowState {
    const key = String(id);
    const existing = this._windows.find((item) => item.id === key);
    if (existing) {
      this.focus(key);
      return { id: existing.id, position: { ...existing.position }, z: existing.z };
    }
    this._windows.push({
      id: key,
      position: normalize_point(position),
      z: this.baseZ,
    });
    this.reassign();
    this._activeId = key;
    this.emit(Events.WindowsChange, { opened: [key], closed: [] });
    this.emit(Events.ActiveChange, key);
    this.emit(Events.StateChange, this.state);
    return this.snapshot_of(key);
  }

  close(id: string): boolean {
    const key = String(id);
    const index = this._windows.findIndex((item) => item.id === key);
    if (index === -1) {
      return false;
    }
    this._windows.splice(index, 1);
    this.reassign();
    const next_active =
      this._windows.length > 0
        ? this._windows[this._windows.length - 1].id
        : "";
    const active_changed = this._activeId !== next_active;
    this._activeId = next_active;
    this.emit(Events.WindowsChange, { opened: [], closed: [key] });
    if (active_changed) {
      this.emit(Events.ActiveChange, next_active);
    }
    this.emit(Events.StateChange, this.state);
    return true;
  }

  closeAll(): void {
    if (this._windows.length === 0) {
      return;
    }
    const closed = this._windows.map((item) => item.id);
    this._windows = [];
    const active_changed = this._activeId !== "";
    this._activeId = "";
    this.emit(Events.WindowsChange, { opened: [], closed });
    if (active_changed) {
      this.emit(Events.ActiveChange, "");
    }
    this.emit(Events.StateChange, this.state);
  }

  /** 移到末尾、重算 z、activeId = id；不存在返回 false */
  focus(id: string): boolean {
    const key = String(id);
    const index = this._windows.findIndex((item) => item.id === key);
    if (index === -1) {
      return false;
    }
    if (index === this._windows.length - 1 && this._activeId === key) {
      return true;
    }
    const [item] = this._windows.splice(index, 1);
    this._windows.push(item);
    this.reassign();
    const active_changed = this._activeId !== key;
    this._activeId = key;
    if (active_changed) {
      this.emit(Events.ActiveChange, key);
    }
    this.emit(Events.StateChange, this.state);
    return true;
  }

  /** 只改位置，不动层级；不存在或位置未变返回 false */
  moveTo(id: string, position?: Partial<WindowPoint> | null): boolean {
    const key = String(id);
    const item = this._windows.find((entry) => entry.id === key);
    if (!item) {
      return false;
    }
    const next = normalize_point(position);
    if (item.position.x === next.x && item.position.y === next.y) {
      return false;
    }
    item.position = next;
    this.emit(Events.StateChange, this.state);
    return true;
  }

  /** 主动广播一次全量快照 */
  refresh(): void {
    this.emit(Events.StateChange, this.state);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  onWindowsChange(handler: Handler<TheTypesOfEvents[Events.WindowsChange]>) {
    return this.on(Events.WindowsChange, handler);
  }

  onActiveChange(handler: Handler<TheTypesOfEvents[Events.ActiveChange]>) {
    return this.on(Events.ActiveChange, handler);
  }

  private snapshot_of(id: string): ManagedWindowState {
    const item = this._windows.find((entry) => entry.id === id);
    if (!item) {
      return { id, position: { x: 0, y: 0 }, z: this.baseZ };
    }
    return { id: item.id, position: { ...item.position }, z: item.z };
  }

  /** 按列表顺序重算 z */
  private reassign() {
    for (let i = 0; i < this._windows.length; i += 1) {
      this._windows[i].z = this.baseZ + i * this.stepZ;
    }
  }
}
