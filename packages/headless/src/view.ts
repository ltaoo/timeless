import {
  Ref,
  isRef,
  isComponent,
  isClassName,
  ClassNameRef,
} from "@timeless/reactive";

export interface ViewProps {
  type?: string;
  id?: string | Ref<string>;
  style?: string | Ref<string>;
  class?: string | Ref<string> | ClassNameRef;
  dataset?: Record<string, string>;
  onMounted?(el: any): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: any): void;
  onFocus?(e: any): void;
  onBlur?(e: any): void;
  key?: any;
}

// export interface ViewResult {
//   t: string;
//   $elm: HTMLElement;
//   class$: any;
//   onMounted: () => void;
//   beforeUnmounted: () => void;
//   onUnmounted: () => void;
//   append: (node: any) => void;
//   setContent: (html: string) => void;
//   render: () => HTMLElement;
// }

export function View(props: ViewProps = {}, children?: any) {
  const {
    type = "div",
    style,
    id: tmpid,
    class: cls,
    dataset,
    onMounted,
    onUnmounted,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const $elm = document.createElement(type);

  // Object.keys(restProps).forEach((k) => {
  //   $elm.setAttribute(k, props[k]);
  // });
  Object.keys(dataset || {}).forEach((k) => {
    if (dataset && dataset[k]) {
      $elm.setAttribute(`data-${k}`, dataset[k]);
    }
  });

  if (cls) {
    if (typeof cls === "string") {
      $elm.className = cls;
    } else if (isRef(cls)) {
      cls._subscribe({
        onChange(v) {
          $elm.className = v;
        },
      });
      $elm.className = cls.value;
    } else if (isClassName(cls)) {
      cls._subscribe({
        onChange(v: string[]) {
          console.log("[]view the className is changed", v);
          $elm.className = v.join(" ");
        },
      });
      $elm.className = cls.toString();
    }
  }
  // if (tmpid) {
  //   if (isRef(tmpid)) {
  //     $elm.id = tmpid.value;
  //   } else {
  //     $elm.id = tmpid;
  //   }
  // }

  if (style) {
    if (typeof style === "string") {
      $elm.style.cssText = style;
    }
    if (isRef(style)) {
      $elm.style.cssText = style.value;
      style._subscribe({
        onChange(v: any) {
          $elm.style.cssText = v;
        },
      });
    }
  }
  if (onClick) {
    // console.log("[baseui]View - register click", props.class, props.dataset);
    $elm.addEventListener("click", function (event: Event) {
      // console.log("[baseui]View - click", event.target, props.dataset);
      if (onClick) {
        onClick(event);
      }
    });
  }
  if (onFocus) {
    $elm.addEventListener("focus", function (event: Event) {
      if (onFocus) onFocus(event);
    });
  }
  if (onBlur) {
    $elm.addEventListener("blur", function (event: Event) {
      if (onBlur) onBlur(event);
    });
  }

  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  return {
    t: "view",
    $elm,
    // class$,
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
    append(node: any) {
      _children.push(node);
    },
    setContent(html: string) {
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
      // $elm.className = class$.toString();
      return $elm;
    },
  };
}
