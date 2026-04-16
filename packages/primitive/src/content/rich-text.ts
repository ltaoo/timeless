/**
 * RichText - A component for rendering HTML content.
 *
 * RichText displays HTML/Rich text content inside a component.
 * Supports reactive content for dynamic HTML updates.
 *
 * Use case: When you need to render HTML from a CMS or user input.
 *
 * @example
 * ```tsx
 * <RichText content={htmlString} />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps } from "./box";

/** Props for RichText component */
export type RichTextProps = BoxProps & {
  /** HTML content string */
  content: string | DerivedRef<string> | Ref<string>;
};

/** Internal state for RichText */
type RichTextState = {
  content: string;
};

/**
 * Creates a RichText component.
 *
 * @param props - Props including content
 * @returns A TimelessElement representing rich text content
 */
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
      box$.methods.set$elm(v);
      $elm = v;
    },
    state: box$.state,
    onMounted(event: MountedEvent) {
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
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
