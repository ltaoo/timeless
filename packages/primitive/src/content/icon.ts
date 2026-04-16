/**
 * Icon - A component for rendering icons.
 *
 * Icon renders a named icon from an icon library.
 * Supports reactive name, color, and size props for dynamic updates.
 *
 * @example
 * ```tsx
 * <Icon name="home" size={24} color="blue" />
 * ```
 */
import { isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps, BoxState } from "./box";

/** Props for Icon component */
type IconProps = BoxProps & {
  /** Icon name from the icon library */
  name: string;
  /** Icon color - defaults to "currentColor" */
  color?: string;
  /** Icon size in pixels - defaults to 24 */
  size?: number;
};

/** Internal state for Icon */
type IconState = {
  name: string;
  size: number;
  color: string;
};

/**
 * Creates an Icon component.
 *
 * @param props - Icon props (name, color, size)
 * @returns A TimelessElement representing an icon
 */
export function Icon(props: IconProps) {
  let $elm: any = null;
  const box$ = Box<IconState>(props, {
    name: "",
    size: 24,
    color: "currentColor",
  });
  const state = box$.state;

  const methods = {
    setup_value_subscribe() {
      box$.methods.subscribe_props();
      if (props.name !== undefined) {
        if (isRef(props.name)) {
          props.name.subscribe({
            onChange(v) {},
          });
          state.name = props.name.value;
        } else {
          state.name = props.name;
        }
      }
      if (props.size !== undefined) {
        if (isRef(props.size)) {
          props.size.subscribe({
            onChange(v) {},
          });
          state.size = props.size.value;
        } else {
          state.size = props.size;
        }
      }
      if (props.color !== undefined) {
        if (isRef(props.color)) {
          props.color.subscribe({
            onChange(v) {},
          });
          state.color = props.color.value;
        } else {
          state.color = props.color;
        }
      }
    },
  };

  methods.setup_value_subscribe();

  return {
    t: "icon",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}

export function isIcon(v: any) {
  return v.t === "icon";
}
