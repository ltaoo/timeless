import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { Text } from "@/content/text";
import { isElement, ViewChildren, resolve_children } from "@/content/type";
import { MountedEvent } from "@/event/index";
import { Box, BoxProps } from "@/content/box";

export type ButtonProps = BoxProps & {
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
};
type ButtonState = {
  disabled: boolean;
};

export function Button(props: ButtonProps = {}, children?: ViewChildren) {
  const { disabled, attributes, ...rest } = props;
  let button_attributes = attributes;
  if (disabled !== undefined) {
    button_attributes = { ...attributes };
    delete button_attributes.disabled;
  }

  let $elm: any = null;
  const box$ = Box<ButtonState>(
    { ...rest, attributes: button_attributes },
    { disabled: false },
  );
  const state = box$.state;
  const events = box$.events;

  const methods = {
    apply_disabled(value: boolean) {
      state.disabled = value;
      state.attributes.disabled = value ? "" : undefined;
      methods.apply_attr("disabled", value);
    },

    subscribe_disabled() {
      if (disabled === undefined) {
        return;
      }
      if (isRef(disabled)) {
        methods.apply_disabled(disabled.value);
        const unsubscribe_disabled = disabled.subscribe({
          onChange(value) {
            methods.apply_disabled(value);
          },
        });
        box$.methods.unsubscribe(unsubscribe_disabled);
        return;
      }
      methods.apply_disabled(disabled);
    },

    // Helper: normalize children (convert functions, wrap refs)
    normalize_children(children?: ViewChildren) {
      const resolved = resolve_children(children);
      if (!resolved) {
        return;
      }
      for (let i = 0; i < resolved.length; i++) {
        const child = resolved[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Text(String(child));
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          // state.children[i] = null;
        })();
      }
    },

    // Helper: apply attribute
    apply_attr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm && typeof $elm.removeAttribute === "function") {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm && typeof $elm.setAttribute === "function") {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(k, String(v));
      }
    },
  };
  const lifecycle = {
    handleMounted() {},
    handleBeforeUnmount() {},
    handleUnmounted() {},
  };

  box$.methods.subscribe_props();
  methods.subscribe_disabled();
  box$.methods.add_event();
  methods.normalize_children(children);

  return {
    t: "button",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      // for (let i = 0; i < state.children.length; i += 1) {
      //   const node = state.children[i];
      //   if (isElement(node)) {
      //     // 如果是 Portal 组件，调用其 cleanup 方法
      //     if (node.t === "portal" && typeof node.cleanup === "function") {
      //       // console.log("[View] calling cleanup on Portal child");
      //       node.cleanup();
      //     } else if (node.onUnmounted) {
      //       // 否则调用标准的 onUnmounted
      //       // console.log("[View] calling onUnmounted on child:", node.t);
      //       node.onUnmounted();
      //     }
      //   }
      // }
      // console.log("[View] clearing DOM, firstChild:", !!$elm.firstChild);
      // host.clearChildren($elm);
      // $elm.removeChildren();
      // console.log("[View] onUnmounted completed");

      // Reset state for potential re-render (e.g., when Show toggles when back to true)
      state.rendered = false;
      $elm = null;
    },
  };
}
