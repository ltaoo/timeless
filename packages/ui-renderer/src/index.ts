export * from "./types";
export { SlotRegistry } from "./registry";
export { UiRenderer, createUiRenderer } from "./renderer";
import type { SlotDefinition } from "./types";

/** Extend this interface with your application's slot contracts. */
export interface SlotMap {
  root: SlotDefinition<"single", Record<string, never>>;
}
