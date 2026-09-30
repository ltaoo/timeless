import { BaseDomain, Handler } from "@timeless/inner-base";

export type GalleryItem = { src: string; thumbnail?: string; alt?: string; caption?: string };
export type GalleryState = {
  items: GalleryItem[];
  index: number;
  open: boolean;
  current: GalleryItem | null;
  status: "loading" | "loaded" | "error";
  can_previous: boolean;
  can_next: boolean;
};
enum Events { StateChange }
type GalleryEvents = { [Events.StateChange]: GalleryState };

/** Platform-neutral image selection and preview state. */
export class GalleryCore extends BaseDomain<GalleryEvents> {
  private items: GalleryItem[];
  private index = -1;
  private visible = false;
  private statuses = new Map<string, GalleryState["status"]>();
  readonly loop: boolean;

  constructor(props: { items?: GalleryItem[]; index?: number; loop?: boolean } = {}) {
    super();
    this.items = (props.items || []).map(item => ({ ...item }));
    this.loop = props.loop ?? true;
    this.index = this.clamp_index(props.index ?? 0);
  }
  get state(): GalleryState {
    const current = this.items[this.index] || null;
    return {
      items: this.items,
      index: this.index,
      open: this.visible,
      current,
      status: current ? this.statuses.get(current.src) || "loading" : "loading",
      can_previous: this.items.length > 1 && (this.loop || this.index > 0),
      can_next: this.items.length > 1 && (this.loop || this.index < this.items.length - 1),
    };
  }
  private clamp_index(index: number) {
    if (!this.items.length) return -1;
    return Math.max(0, Math.min(this.items.length - 1, Number.isFinite(index) ? Math.floor(index) : 0));
  }
  private notify() { this.emit(Events.StateChange, this.state); }
  open(index = this.index) {
    if (!this.items.length) return;
    this.index = this.clamp_index(index);
    this.visible = true;
    this.notify();
  }
  close() {
    if (!this.visible) return;
    this.visible = false;
    this.notify();
  }
  select(index: number) {
    const next = this.clamp_index(index);
    if (next === this.index) return;
    this.index = next;
    this.notify();
  }
  previous() { this.move(-1); }
  next() { this.move(1); }
  private move(direction: number) {
    if (this.items.length < 2) return;
    this.select(this.loop ? (this.index + direction + this.items.length) % this.items.length : this.index + direction);
  }
  setItems(items: GalleryItem[]) {
    const src = this.state.current?.src;
    this.items = items.map(item => ({ ...item }));
    const index = src ? this.items.findIndex(item => item.src === src) : -1;
    this.index = this.clamp_index(index >= 0 ? index : this.index);
    if (!this.items.length) this.visible = false;
    const retained = new Set(this.items.map(item => item.src));
    for (const src of this.statuses.keys()) {
      if (!retained.has(src)) this.statuses.delete(src);
    }
    this.notify();
  }
  setStatus(src: string, status: GalleryState["status"]) {
    if (!this.items.some(item => item.src === src)) return;
    if (this.statuses.get(src) === status) return;
    this.statuses.set(src, status);
    this.notify();
  }
  onStateChange(handler: Handler<GalleryState>) { return this.on(Events.StateChange, handler); }
}
