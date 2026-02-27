export function DangerouslyInnerHTML(html: string) {
  const $elm = document.createElement("div");
  return {
    t: "html",
    $elm: $elm,
    render() {
      $elm.innerHTML = html;
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      $elm.innerHTML = "";
    },
    append(node: Node) {
      $elm.appendChild(node);
    },
    setContent(html: string) {
      $elm.innerHTML = html;
    },
    class$: null as any,
  };
}
