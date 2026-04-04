import { isRef, Ref } from "@timeless/reactive";

// import { getHost } from "@/host";
import { safeCreateTextNode } from "@/util/env";

export function Txt(value: Ref<string> | string) {
  // const host = getHost();
  let $elm: any = null;

  const state = {
    rendered: false,
    value: isRef(value) ? value.value : value,
  };

  function setupSubscription() {
    if (isRef(value)) {
      value._subscribe({
        onPatch(action) {},
        onChange(v: any) {
          if (v === state.value) {
            return;
          }
          // Always update local value to stay in sync with ref
          state.value = v;
          // Only update DOM if element exists (component is mounted)
          if ($elm) {
            // host.setTextContent($elm, _local_value);
            $elm.setTextContent(state.value);
          }
        },
      });
    }
  }

  return {
    t: "text",
    get $elm() {
      return $elm;
    },
    render() {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;
      $elm = safeCreateTextNode(state.value);
      setupSubscription();
      return $elm;
    },
    hydrate(existingDom: any) {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;
      $elm = existingDom;
      setupSubscription();
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
