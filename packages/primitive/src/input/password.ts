import { MountedEvent } from "@/event";

export interface PasswordInputProps {
  onMounted: (event: MountedEvent) => void;
}

export function PasswordInput(props: PasswordInputProps) {
  let $elm: any = null;
  const state = {};
  // return Input({
  //   ...(props as any),
  //   type: "password",
  // });
  return {
    t: "password",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: [],
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
