import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps } from "./box";

export type RichTextProps = BoxProps & {
  content: string | DerivedRef<string> | Ref<string>;
};
type RichTextState = {
  content: string;
};

export function RichText(props: RichTextProps) {
  const { content, ...rest } = props;

  let $elm: any = null;

  const box$ = Box<RichTextState>(rest, {} as RichTextState);

  return {
    t: "rich-text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: box$.state,
    onMounted(event: MountedEvent) {
      if (rest.onMounted) {
        box$.methods.add_listen(rest.onMounted(event));
      }
    },
    beforeUnmounted() {},
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      box$.methods.destroy();
    },
  };
}
