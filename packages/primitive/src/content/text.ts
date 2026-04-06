import { isRef, Ref } from "@timeless/reactive";

import { TimelessElement } from "./view";

export function Txt(
  value: Ref<string | number> | string | number,
): TimelessElement {
  let $elm: any = null;

  const state = {
    rendered: false,
    value: isRef(value) ? value.value : value,
  };

  function setup_value_subscription() {
    if (!isRef(value)) {
      return;
    }
    value.subscribe({
      onPatch(action) {},
      onChange(v: any) {
        if (v === state.value) {
          return;
        }
        // Always update local value to stay in sync with ref
        state.value = v;
        // Only update DOM if element exists (component is mounted)
        if ($elm && typeof $elm.setContent === "function") {
          // host.setTextContent($elm, _local_value);
          $elm.setContent(state.value);
        }
      },
    });
  }

  setup_value_subscription();

  return {
    t: "text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    value: state.value,
    props: {
      // styleSets: [],
      style: {},
    },
    children: [],
    render() {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;
      // $elm = safeCreateTextNode(state.value);
      setup_value_subscription();
      return $elm;
    },
    hydrate(existingDom: any) {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;
      $elm = existingDom;
      setup_value_subscription();
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      // Reset state for potential re-render
      state.rendered = false;
      $elm = null;
    },
  };
}
