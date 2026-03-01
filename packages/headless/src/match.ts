import { Ref } from "@timeless/reactive";

import { View, ViewChildren, ViewProps } from "./view";

export function Match(
  props: ViewProps & { when: Ref<any> },
  renders: ViewChildren,
) {
  const { when } = props;

  let _when_ref = when;
  let _prev_condition: any = null;

  const view$ = View({}, []);
  // const cache = {};

  _when_ref._subscribe({
    onPatch() {
      render();
    },
    onChange() {
      render();
    },
  });

  function render() {
    const condition = when.value;
    // console.log("rerender switch", condition);
    if (condition === _prev_condition) {
      // 就是没有变化
      return;
    }
    _prev_condition = condition;
    const r = renders[condition];
    if (!r) {
      return;
    }
    const res = r.render();
    if (!res) {
      return;
    }
    view$.$elm.appendChild(res);
  }

  return {
    t: "show",
    $elm: view$.$elm,
    append(node: any) {},
    setContent(v: any) {},
    render() {
      render();
      if (props.onMounted) {
        props.onMounted(view$.$elm);
      }
      return view$.$elm;
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
  };
}
