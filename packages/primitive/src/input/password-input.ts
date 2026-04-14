import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";

export type PasswordInputProps = BoxProps & {
  onMounted: (event: MountedEvent) => void;
};
type PasswordInputState = {};

export function PasswordInput(props: PasswordInputProps) {
  const { ...rest } = props;
  let $elm: any = null;
  const box$ = Box<PasswordInputState>(rest, {} as PasswordInputState);

  const state = box$.state;
  const events = box$.events;

  return {
    t: "password-input",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      box$.methods.destroy();
    },
  };
}
