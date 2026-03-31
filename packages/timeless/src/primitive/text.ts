import { isRef, Ref } from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateTextNode } from "@/util/env";

export function Txt(value: Ref<any> | string) {
  const host = getHost();
  let _local_value = isRef(value) ? value.value : value;
  const $elm = safeCreateTextNode(_local_value);

  return {
    t: "text",
    $elm,
    render() {
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
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {},
  };
}
