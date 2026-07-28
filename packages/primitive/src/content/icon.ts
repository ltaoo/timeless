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
import { isRef } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

import { Box, BoxProps, BoxState } from "./box";
import { Logger } from "@/util/logger";

const logger = Logger({ prefix: "primitive", scope: "icon" });

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

export type ASNNode = {
  tag: string;
  attrs?: Record<string, string>;
  children?: readonly ASNNode[];
};

export type IconRegistry = Record<string, ASNNode>;

const iconRegistry: IconRegistry = {};

export function registerIcons(icons: IconRegistry): void {
  logger.log("registerIcons", icons);
  Object.assign(iconRegistry, icons);
}

export function clearIcons(): void {
  Object.keys(iconRegistry).forEach((key) => delete iconRegistry[key]);
}

export function getIconRegistry(): IconRegistry {
  // logger.log("getIconRegistry", iconRegistry);
  return iconRegistry;
}

/**
 * Creates an Icon component.
 *
 * @param props - Icon props (name, color, size)
 * @returns A TimelessElement representing an icon
 */
export function Icon(props: IconProps) {
  let $elm: any = null;
  const listener$ = ListenerManager();
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
          const unsub_name = props.name.subscribe({
            onChange(v) {},
          });
          listener$.push(unsub_name);
          state.name = props.name.value;
        } else {
          state.name = props.name;
        }
      }
      if (props.size !== undefined) {
        if (isRef(props.size)) {
          const unsub_size = props.size.subscribe({
            onChange(v) {},
          });
          listener$.push(unsub_size);
          state.size = props.size.value;
        } else {
          state.size = props.size;
        }
      }
      if (props.color !== undefined) {
        if (isRef(props.color)) {
          const unsub_color = props.color.subscribe({
            onChange(v) {},
          });
          listener$.push(unsub_color);
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
      // listener$.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}

export function isIcon(v: any) {
  return v.t === "icon";
}

(Icon as any).register = registerIcons;
