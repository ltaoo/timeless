import { View } from "./view.js";

export function Match(props, renders) {
  const { when } = props;

  let _when_ref = when;
  let _prev_condition = null;

  const view$ = View({}, []);
  const cache = {};

  _when_ref._subscribe({
    onPatch() {
      render();
    },
  });

  function render() {
    const condition = when.value;
    console.log("rerender switch", condition);
    if (condition === _prev_condition) {
      // 就是没有变化
      return;
    }
    _prev_condition = condition;
    const r = renders[condition];
    if (!r) {
      return;
    }
    view$.$elm.appendChild(r.render());
  }

  return {
    t: "show",
    $elm: view$.$elm,
    onMounted() {
      view$.onMounted();
      if (props.onMounted) {
        props.onMounted();
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      view$.$elm.innerHTML = "";
    },
    append(node) {},
    setContent(v) {},
    render() {
      render();
      return view$.$elm;
    },
  };
}
