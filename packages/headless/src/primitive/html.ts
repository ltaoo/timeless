import { isRef, Ref } from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";

export function DangerouslyInnerHTML(html: string | Ref<string>) {
  const host = getHost();
  const $elm = safeCreateElement("div");

  return {
    t: "html",
    $elm: $elm,
    render() {
      let _local_value = (() => {
        if (isRef(html)) {
          return html.value;
        }
        return html;
      })();
      if (isRef(html)) {
        html._subscribe({
          onChange: (v) => {
            host.setInnerHTML?.($elm, v);
          },
        });
        _local_value = html.value;
      }
      host.setInnerHTML?.($elm, _local_value);
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      host.setInnerHTML?.($elm, "");
    },
    append(node: any) {
      host.appendChild($elm, node);
    },
    setContent(html: string) {
      host.setInnerHTML?.($elm, html);
    },
    class$: null,
  };
}
