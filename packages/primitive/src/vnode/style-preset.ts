import type { VNodeStyle } from "./types";

export type StylePreset = VNodeStyle;

export interface StylePresetRegistry {
  define(name: string, style: StylePreset): void;
  defineMany(presets: Record<string, StylePreset>): void;
  get(name: string): StylePreset | undefined;
  has(name: string): boolean;
}

export function createStylePresetRegistry(): StylePresetRegistry {
  const map = new Map<string, StylePreset>();
  return {
    define(name, style) {
      map.set(name, style);
    },
    defineMany(presets) {
      for (const name of Object.keys(presets)) {
        map.set(name, presets[name]);
      }
    },
    get(name) {
      return map.get(name);
    },
    has(name) {
      return map.has(name);
    },
  };
}

const globalRegistry = createStylePresetRegistry();

export function getStylePresets() {
  return globalRegistry;
}

export function resolveComputedStyle(vnode: { style: VNodeStyle; stylePresets: string[] }) {
  let result: VNodeStyle = {};
  for (const name of vnode.stylePresets) {
    const preset = globalRegistry.get(name);
    if (preset) result = { ...result, ...preset };
  }
  result = { ...result, ...vnode.style };
  return result;
}
