/**
 * NativeStyle - A wrapper for rendering native HTML style elements.
 *
 * NativeStyle renders a <style> element with CSS content.
 * It wraps the View component with "style" as the element type.
 *
 * @example
 * ```tsx
 * <Style>
 *   {`body { margin: 0 }`}
 * </Style>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";

/** Props for NativeStyle - same as ViewProps but without 'as' */
export type StyleProps = {
  onMounted?: (event: MountedEvent) => void;
  onUnmounted?: () => void;
};

/**
 * Creates a native HTML style element.
 *
 * @param props - Style element props
 * @param children - CSS content (string or CSS text elements)
 * @returns A TimelessElement representing a style element
 */
export function Style(
  props: StyleProps,
  children: string | Ref<string> | DerivedRef<string>,
) {
  let $elm: any = null;
  const state = {
    rendered: false,
    content: "",
  };

  const methods = {
    subscribe_props() {
      if (isRef(children)) {
        state.content = children.value;
        children.subscribe({
          onChange(v) {
            state.content = v;
          },
        });
      } else {
        state.content = children;
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "style",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      state.rendered = false;
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}
