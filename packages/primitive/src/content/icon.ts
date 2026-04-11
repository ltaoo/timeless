import { isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps, BoxState } from "./box";

type IconProps = BoxProps & {
  name: string;
  color?: string;
  size?: number;
};
type IconState = {
  name: string;
  size: number;
  color: string;
};

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
  };
}

export function isIcon(v: any) {
  return v.t === "icon";
}
