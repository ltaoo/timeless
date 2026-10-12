import type {
  Children,
  Cleanup,
  ComponentProps,
  Observable,
  OwnerProps,
  RegistrationOptions,
  SlotComponent,
  SlotKind,
  SlotName,
  KindOf,
} from "./types";
import type { ViewChildren } from "@timeless/timeless";

export interface Entry {
  readonly sequence: number;
  readonly name: string;
  readonly id?: string;
  readonly key?: string;
  readonly priority: number;
  readonly order: number;
  readonly children: Children;
  readonly select?: (owner: unknown) => unknown;
  readonly component: (props: ComponentProps<SlotName>) => ViewChildren;
}
export interface Selection {
  entry: Entry;
  matched: unknown;
}
interface SlotState {
  kind: SlotKind;
  entries: Entry[];
  snapshot: readonly Entry[];
}
const empty_entries: readonly Entry[] = Object.freeze([]);
interface Injection {
  name: string;
  setup: () => void | Cleanup;
  cleanup?: Cleanup;
  active: boolean;
}

/** Owns declarations and registrations; it has no dependency on a host renderer. */
export class SlotRegistry {
  private slots = new Map<string, SlotState>([
    ["root", { kind: "single", entries: [], snapshot: empty_entries }],
  ]);
  private listeners = new Map<string, Set<() => void>>();
  private injections = new Set<Injection>();
  private sequence = 0;
  private disposed = false;

  declare<K extends SlotName>(name: K, kind: KindOf<K>): Cleanup {
    this.assert_open();
    if (!name || !["single", "list", "keyed", "chain"].includes(kind))
      throw new Error("Invalid slot declaration");
    if (this.slots.has(name))
      throw new Error(`Slot "${name}" is already declared`);
    const state: SlotState = { kind, entries: [], snapshot: empty_entries };
    this.slots.set(name, state);
    try {
      this.activate_injections(name);
      this.publish(name);
    } catch (error) {
      this.collapse(name, state);
      throw error;
    }
    return () => this.collapse(name, state);
  }

  register<K extends SlotName>(
    options: RegistrationOptions<K>,
    component: SlotComponent<K>,
  ): Cleanup {
    this.assert_open();
    const state = this.require_slot(options.name);
    const fields = options as RegistrationOptions<K> & {
      id?: string;
      key?: string;
      select?: (owner: OwnerProps<K>) => unknown;
    };
    if (typeof component !== "function")
      throw new Error("Slot component must be a function");
    if (state.kind === "list" && !fields.id)
      throw new Error("List entries require an id");
    if (state.kind === "keyed" && !fields.key)
      throw new Error("Keyed entries require a key");
    if (state.kind === "chain" && typeof fields.select !== "function")
      throw new Error("Chain entries require a selector");
    if (![options.priority ?? 0, options.order ?? 0].every(Number.isFinite))
      throw new Error("Slot ranks must be finite");
    const children = Object.freeze({ ...options.children });
    for (const name of Object.keys(children)) {
      if (this.slots.has(name))
        throw new Error(`Slot "${name}" is already declared`);
    }
    const entry: Entry = {
      sequence: this.sequence++,
      name: options.name,
      id: fields.id,
      key: fields.key,
      priority: options.priority ?? 0,
      order: options.order ?? 0,
      children,
      select: fields.select as Entry["select"],
      component: component as unknown as Entry["component"],
    };
    const declarations: Cleanup[] = [];
    let active = true;
    const remove = () => {
      if (!active) return;
      active = false;
      const index = state.entries.indexOf(entry);
      if (index !== -1) state.entries.splice(index, 1);
      const errors: unknown[] = [];
      for (const cleanup of declarations.reverse()) {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      this.publish(options.name);
      if (errors.length)
        throw new AggregateError(errors, "Slot registration cleanup failed");
    };
    state.entries.push(entry);
    try {
      for (const [name, kind] of Object.entries(children)) {
        declarations.push(this.declare(name as SlotName, kind));
      }
      this.publish(options.name);
    } catch (error) {
      remove();
      throw error;
    }
    return remove;
  }

  inject<K extends SlotName>(name: K, setup: () => void | Cleanup): Cleanup {
    this.assert_open();
    const injection: Injection = { name, setup, active: false };
    this.injections.add(injection);
    try {
      this.activate_injections(name);
    } catch (error) {
      this.injections.delete(injection);
      throw error;
    }
    return () => {
      if (!this.injections.delete(injection)) return;
      const cleanup = injection.cleanup;
      injection.active = false;
      injection.cleanup = undefined;
      cleanup?.();
    };
  }

  source<K extends SlotName>(name: K): Observable<readonly Entry[]> {
    return {
      getSnapshot: () => this.slots.get(name)?.snapshot ?? empty_entries,
      subscribe: (listener) => {
        this.assert_open();
        let listeners = this.listeners.get(name);
        if (!listeners) this.listeners.set(name, (listeners = new Set()));
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
          if (listeners.size === 0 && this.listeners.get(name) === listeners)
            this.listeners.delete(name);
        };
      },
    };
  }

  select<K extends SlotName>(
    name: K,
    owner: OwnerProps<K>,
    key?: string,
  ): Selection[] {
    const state = this.slots.get(name);
    if (!state) return [];
    const ranked = [...state.entries].sort(
      (a, b) => a.priority - b.priority || a.sequence - b.sequence,
    );
    if (state.kind === "chain") {
      for (const entry of ranked) {
        const matched = entry.select!(owner);
        if (matched !== null && matched !== undefined)
          return [{ entry, matched }];
      }
      return [];
    }
    if (state.kind === "single")
      return ranked.slice(0, 1).map((entry) => ({ entry, matched: undefined }));
    if (state.kind === "keyed")
      return ranked
        .filter((entry) => entry.key === key)
        .slice(0, 1)
        .map((entry) => ({ entry, matched: undefined }));
    const winners = new Map<string, Entry>();
    for (const entry of ranked)
      if (!winners.has(entry.id!)) winners.set(entry.id!, entry);
    return [...winners.values()]
      .sort((a, b) => a.order - b.order || a.sequence - b.sequence)
      .map((entry) => ({ entry, matched: undefined }));
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const errors: unknown[] = [];
    for (const [name, state] of [...this.slots]) {
      try {
        this.collapse(name, state);
      } catch (error) {
        errors.push(error);
      }
    }
    this.injections.clear();
    this.listeners.clear();
    if (errors.length)
      throw new AggregateError(errors, "Slot registry cleanup failed");
  }

  private require_slot(name: string): SlotState {
    const state = this.slots.get(name);
    if (!state) throw new Error(`Slot "${name}" is not declared`);
    return state;
  }

  private assert_open(): void {
    if (this.disposed) throw new Error("Slot registry is disposed");
  }

  private activate_injections(name: string): void {
    if (!this.slots.has(name)) return;
    for (const injection of [...this.injections]) {
      if (injection.name !== name || injection.active) continue;
      injection.active = true;
      try {
        injection.cleanup = injection.setup() || undefined;
      } catch (error) {
        injection.active = false;
        throw error;
      }
    }
  }

  private collapse(name: string, state: SlotState): void {
    if (this.slots.get(name) !== state) return;
    this.slots.delete(name);
    const errors: unknown[] = [];
    for (const injection of [...this.injections]) {
      if (injection.name !== name || !injection.active) continue;
      const cleanup = injection.cleanup;
      injection.active = false;
      injection.cleanup = undefined;
      try {
        cleanup?.();
      } catch (error) {
        errors.push(error);
      }
    }
    for (const entry of state.entries) {
      for (const child of Object.keys(entry.children)) {
        const child_state = this.slots.get(child);
        if (child_state) {
          try {
            this.collapse(child, child_state);
          } catch (error) {
            errors.push(error);
          }
        }
      }
    }
    state.entries.length = 0;
    this.publish(name);
    if (errors.length)
      throw new AggregateError(errors, `Slot "${name}" cleanup failed`);
  }

  private publish(name: string): void {
    const state = this.slots.get(name);
    if (state) state.snapshot = Object.freeze([...state.entries]);
    const errors: unknown[] = [];
    for (const listener of [...(this.listeners.get(name) ?? [])]) {
      try {
        listener();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, `Slot "${name}" notification failed`);
  }
}
