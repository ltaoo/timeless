import { isRef, isComponent, classnames } from "./core.js";

/**
 * @param {import("./core.js").ViewProps} [props]
 * @param {import("./core.js").ViewChildren} [children]
 */
export function View(props = {}, children) {
  const {
    type = "div",
    style,
    id: tmpid,
    class: tmpcn,
    dataset,
    onMounted,
    onUnmounted,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const $elm = document.createElement(type);

  Object.keys(restProps).forEach((k) => {
    $elm.setAttribute(k, props[k]);
  });
  Object.keys(dataset || {}).forEach((k) => {
    $elm.setAttribute(`data-${k}`, dataset[k]);
  });

  const class$ = (() => {
    if (!tmpcn) {
      return classnames([]);
    }
    if (tmpcn.__CN) {
      return tmpcn;
    }
    if (isRef(tmpcn)) {
      return classnames([tmpcn]);
    }
    return classnames([tmpcn]);
  })();
  // console.log("class$", class$);
  class$.listen({
    onChange(v) {
      $elm.className = v.join(" ");
    },
  });
  $elm.className = class$.toString();
  if (tmpid) {
    if (isRef(tmpid)) {
      $elm.id = tmpid.value;
    } else {
      $elm.id = tmpid;
    }
  }

  if (style) {
    if (typeof style === "string") {
      $elm.style = style;
    }
    if (style.value) {
      $elm.style = style.value;
      // console.log(style);
      style._subscribe({
        onChange(v) {
          $elm.style = v;
        },
      });
    }
  }
  if (onClick) {
    // console.log("[baseui]View - register click", props.class, props.dataset);
    $elm.addEventListener("click", function (event) {
      // console.log("[baseui]View - click", event.target, props.dataset);
      if (onClick) {
        onClick(event);
      }
    });
  }
  if (onFocus) {
    $elm.addEventListener("focus", function (event) {
      onFocus(event);
    });
  }
  if (onBlur) {
    $elm.addEventListener("blur", function (event) {
      onBlur(event);
    });
  }

  let _children = children ?? [];

  return {
    t: "view",
    $elm,
    class$,
    onMounted() {
      // console.log("[baseui]View - invoke onMounted", $elm);
      if (onMounted) {
        onMounted($elm);
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isComponent(node)) {
          // @ts-ignore
          if (node.onMounted) {
            // @ts-ignore
            node.onMounted();
          }
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isComponent(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isComponent(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
    },
    append(node) {
      _children.push(node);
    },
    setContent(html) {
      $elm.innerHTML = html;
    },
    render() {
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (!node) continue;
        if (typeof node === "string" || typeof node === "number") {
          $elm.appendChild(document.createTextNode(String(node)));
          continue;
        }
        if (isComponent(node)) {
          const result = node.render();
          if (result) {
            $elm.appendChild(result);
          }
        }
      }
      $elm.className = class$.toString();
      return $elm;
    },
  };
}
