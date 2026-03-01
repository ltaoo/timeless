import { isRef, Ref } from "@timeless/reactive";

export function DangerouslyInnerHTML(html: string | Ref<string>) {
  const $elm = document.createElement("div");

  let _local_value = (() => {
    if (isRef(html)) {
      return html.value;
    }
    return html;
  })();
  if (isRef(html)) {
    html._subscribe({
      onChange: (v) => {
        $elm.innerHTML = v;
      },
    });
    _local_value = html.value;
  }

  return {
    t: "html",
    $elm: $elm,
    render() {
      $elm.innerHTML = _local_value;
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      $elm.innerHTML = "";
    },
    append(node: any) {
      $elm.appendChild(node);
    },
    setContent(html: string) {
      $elm.innerHTML = html;
    },
    class$: null,
  };
}
