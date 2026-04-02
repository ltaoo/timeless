import { isRef, Ref } from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateTextNode } from "@/util/env";

export function Txt(value: Ref<string> | string) {
  const host = getHost();
  let _local_value = isRef(value) ? value.value : value;
  let $elm: any = null;
  let rendered = false;

  const setupSubscription = () => {
    if (isRef(value)) {
      value._subscribe({
        onPatch(action) {},
        onChange(v: any) {
          if (v === _local_value) {
            return;
          }
          _local_value = v;
          host.setTextContent($elm, _local_value);
        },
      });
    }
  };

  return {
    t: "text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    _value: value,
    render() {
      if (rendered) return $elm;
      rendered = true;
      $elm = safeCreateTextNode(_local_value);
      setupSubscription();
      return $elm;
    },
    hydrate(existingDom: any) {
      if (rendered) return $elm;
      rendered = true;
      $elm = existingDom;
      setupSubscription();
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      // Reset state for potential re-render
      rendered = false;
      $elm = null;
    },
  };
}
