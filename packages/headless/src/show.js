import { View } from "./view.js";
import { ref, computed, isRef, classnames, isComponent } from "./core.js";

export function Show(props, children) {
  const { when, fallback, ...rest } = props;

  let _children = children;
  let _fallback = fallback;
  let _when_ref = when;
  let _prev_condition = null;
  let $parent = null;

  const view$ = View({ dataset: { show: 1 }, ...rest }, []);
  const cache = {};

  _when_ref._subscribe({
    onPatch() {
      render();
    },
  });
  let _nodes = [];
  function render() {
    const condition = isRef(when) ? when.value : when();
    // console.log("[baseui]Show - refresh", condition, _prev_condition);
    if (condition === _prev_condition) {
      // 就是没有变化
      return;
    }
    if (condition === false && _prev_condition === true) {
      _prev_condition = condition;
      for (let i = 0; i < _nodes.length; i += 1) {
        const node = _nodes[i];
        if (isComponent(node) && typeof node.onUnmounted === "function") {
          node.onUnmounted();
        }
      }
      _nodes = [];
      view$.$elm.innerHTML = "";
      return;
    }
    // if (condition === false) {
    // 如果 false 表示要渲染 condition
    //   return;
    // }
    _prev_condition = condition;
    const nodes = condition ? _children : _fallback;
    if (!nodes || nodes.length === 0) {
      return;
    }
    for (let i = 0; i < _nodes.length; i += 1) {
      const node = _nodes[i];
      if (isComponent(node) && typeof node.onUnmounted === "function") {
        node.onUnmounted();
      }
    }
    _nodes = nodes;
    // console.log("[baseui]Show - insert content");
    const $fragment = document.createDocumentFragment();
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const $el = (() => {
        if (isComponent(node)) {
          const result = node.render();
          if (result) {
            return result;
          }
        } else if (typeof node === "string" || typeof node === "number") {
          // $fragment.appendChild(document.createTextNode(String(node)));
          return document.createTextNode(String(node));
        } else if (node) {
          // $fragment.appendChild(node);
          return node;
        }
        return null;
      })();
      if ($el) {
        $fragment.appendChild($el);
      }
    }
    // cache[condition] = $fragment;
    view$.$elm.innerHTML = "";
    view$.$elm.appendChild($fragment);

    // console.log("[baseui]Show - before insert to $parent", $parent);
    // if ($parent) {
    //   // 本来是 hidden，可见后，$parent 有了值。再 hide、open，就到这个分支
    //   console.log("[baseui]Show - insert to $parent");
    //   $parent.appendChild(view$.$elm);
    // } else {
    //   console.log("[baseui]Show - no $parent", view$.$elm.parentNode);
    //   console.log(view$.$elm.parentNode);
    //   $parent = view$.$elm.parentNode;
    // }
    // console.log("[baseui]Show - before invoke view$.onMounted");

    // view$.onMounted();
    for (let i = 0; i < _nodes.length; i += 1) {
      const node = _nodes[i];
      if (isComponent(node) && typeof node.onMounted === "function") {
        node.onMounted();
      }
    }
  }

  return {
    t: "show",
    $elm: view$.$elm,
    onMounted() {
      if (view$.$elm.parentNode) {
        $parent = view$.$elm.parentNode;
      }
      if (props.onMounted) {
        props.onMounted();
      }
      // console.log("[baseui]Show - onMounted", _nodes);
      // view$.onMounted();
      // for (let i = 0; i < _nodes.length; i += 1) {
      //   const node = _nodes[i];
      //   if (isComponent(node) && typeof node.onMounted === "function") {
      //     node.onMounted();
      //   }
      // }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < _nodes.length; i += 1) {
        const node = _nodes[i];
        if (isComponent(node) && typeof node.beforeUnmounted === "function") {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < _nodes.length; i += 1) {
        const node = _nodes[i];
        if (isComponent(node) && typeof node.onUnmounted === "function") {
          node.onUnmounted();
        }
      }
      view$.$elm.innerHTML = "";
    },
    append(node) {
      _children.push(node);
    },
    setContent(v) {},
    render() {
      render();
      // view$.append();
      // return ;
      return view$.$elm;
    },
  };
}
