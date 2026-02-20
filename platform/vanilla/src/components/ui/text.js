/**
 * @param {import("./core.js").Ref<any> | string} state
 */
export function Txt(state) {
  let _text = (() => {
    if (state && typeof state === "object" && state.__isRef) {
      state._subscribe({
        onChange(v) {
          $elm.textContent = v;
        },
      });
      return state.value;
    }
    return state;
  })();
  const $elm = document.createTextNode(_text);
  return {
    t: "text",
    $elm,
    render() {
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {},
  };
}
