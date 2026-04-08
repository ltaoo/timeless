import { MountedEvent } from "@/event";

type IconState = {
  name: string;
  size: number;
  color: string;
};
type IconProps = { name: string; color?: string; size?: number };

export function Icon(props: IconProps) {
  let $elm: any = null;
  const state: IconState = {
    name: props.name,
    size: props.size ?? 24,
    color: props.color ?? "currentColor",
    // props,
  };

  return {
    t: "icon",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    value: {
      name: state.name,
      color: state.color,
      size: state.size,
    },
    state: {},
    props: {
      styleSet: [],
      style: {},
    },
    render() {
      return $elm;
    },
    onMounted(event: MountedEvent) {
      // ...
    },
  };
}

export function isIcon(v: any) {
  return v.t === "icon";
}
