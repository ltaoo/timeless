export function DangerouslyInnerHTML(html) {
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
  };
}
