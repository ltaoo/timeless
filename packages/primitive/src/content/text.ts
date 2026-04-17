/**
 * Text - A component for rendering text content.
 *
 * Text wraps string/number values and provides:
 * - Reactive value support (auto-updates when value changes)
 * - DOM text node management
 * - Lifecycle cleanup
 *
 * This is the basic text node component used throughout Timeless.
 *
 * @example
 * ```tsx
 * <Text>Hello World</Text>
 * // or with reactive value
 * <Text>{messageRef}</Text>
 * ```
 */
import { DerivedRef, isRef, Ref, generateTrackId } from "@timeless/reactive";

import { ListenerManager } from "@/util/listener";

import { TimelessElement } from "./type";

/**
 * Creates a Text component.
 *
 * @param value - The text value (string, number, or reactive ref)
 * @returns A TimelessElement representing a text node
 */
export function Text(
  value: DerivedRef<string | number> | Ref<string | number> | string | number,
): TimelessElement {
  let $elm: any = null;
  const textTrackId = generateTrackId("text");
  const listener$ = ListenerManager();
  const state = {
    rendered: false,
    value: "",
  };

  const methods = {
    subscribe_props() {
      if (value !== undefined) {
        if (isRef(value)) {
          const unsubscribe = value.subscribe({
            __trackId: textTrackId,
            __trackInfo: { type: "text" },
            onChange(v) {
              if (v === state.value) {
                return;
              }
              state.value = String(v);
              if ($elm && typeof $elm.setText === "function") {
                $elm.setText(state.value);
              }
            },
          });
          listener$.add(unsubscribe);
          state.value = String(value.value);
        } else {
          state.value = String(value);
        }
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {
      value: state.value,
    },
    children: [],
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      listener$.destroy();
      state.rendered = false;
      $elm = null;
    },
  };
}
