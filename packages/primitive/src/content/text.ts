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
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

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
  const state = {
    rendered: false,
    value: "",
  };

  const methods = {
    subscribe_props() {
      if (value !== undefined) {
        if (isRef(value)) {
          value.subscribe({
            onChange(v) {
              // console.log("[]Text handle value changed", v === state.value, typeof $elm.setText);
              if (v === state.value) {
                return;
              }
              // Always update local value to stay in sync with ref
              state.value = String(v);
              // Only update DOM if element exists (component is mounted)
              if ($elm && typeof $elm.setText === "function") {
                // host.setTextContent($elm, _local_value);
                $elm.setText(state.value);
              }
            },
          });
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
      // Reset state for potential re-render
      state.rendered = false;
      $elm = null;
    },
  };
}
