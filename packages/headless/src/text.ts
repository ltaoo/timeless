import { isRef } from '@timeless/reactive';

/**
 * @param {import("./core.js").Ref<any> | string} state
 */
export function Txt(state: any) {
  let _text = (() => {
    if (state && isRef(state)) {
      state._subscribe({
        onChange(v: any) {
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
    class$: null,
  };
}
