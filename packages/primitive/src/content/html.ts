import { isRef, Ref } from "@timeless/reactive";

export function DangerouslyInnerHTML(html: string | Ref<string>) {
  // const host = getHost();
  let $elm: any = null;

  return {
    t: "html",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {},
    render() {
      let raw_value = (() => {
        if (isRef(html)) {
          return html.value;
        }
        return html;
      })();
      if (isRef(html)) {
        html.subscribe({
          onChange(v: any) {
            // host.setInnerHTML?.($elm, v);
          },
        });
        raw_value = html.value;
      }
      // host.setInnerHTML?.($elm, _local_value);
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      // host.setInnerHTML?.($elm, "");
    },
    append(node: any) {
      // host.appendChild($elm, node);
    },
    setContent(html: string) {
      // host.setInnerHTML?.($elm, html);
    },
    class$: null,
  };
}
