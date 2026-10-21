/**
 * RichText - Portable HTML and Markdown reading content.
 *
 * Parses content in the shared model; hosts render UTF-16 style spans.
 * HTML is restricted to reading elements, safe URLs and text styles.
 *
 * Use case: When you need to render HTML from a CMS or user input.
 *
 * @example
 * ```tsx
 * RichText({ content: markdownRef, format: "markdown" })
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps } from "./box";
import {
  parseRichText,
  type RichTextDocument,
  type RichTextFormat,
} from "./rich-text-document";
export { parseRichText } from "./rich-text-document";
export type {
  RichTextDocument,
  RichTextSpan,
  RichTextFormat,
} from "./rich-text-document";

/** Props for RichText component */
export type RichTextProps = BoxProps & {
  /** HTML by default, or Markdown when format is "markdown". */
  content: string | DerivedRef<string> | Ref<string>;
  format?: RichTextFormat;
  onLinkPress?: (url: string) => void;
};

/** Internal state for RichText */
type RichTextState = {
  content: string;
  format: RichTextFormat;
  document: RichTextDocument;
};

/**
 * Creates a RichText component.
 *
 * @param props - Props including content
 * @returns A TimelessElement representing rich text content
 */
export function RichText(props: RichTextProps) {
  const { content, format = "html", onLinkPress, ...rest } = props;

  let $elm: any = null;

  const box$ = Box<RichTextState>(
    { ...rest, attributes: { n: "rich-text", ...rest.attributes } },
    {
      content: "",
      format,
      document: { text: "", spans: [], html: "" },
    },
  );
  const state = box$.state;
  const events = box$.events;

  const methods = {
    set_content(value: string) {
      state.content = value;
      state.document = parseRichText(value, format);
      if ($elm && typeof $elm.setDocument === "function") {
        $elm.setDocument(state.document);
      } else if ($elm && typeof $elm.setContent === "function") {
        $elm.setContent(value);
      }
    },
    subscribe_props() {
      box$.methods.subscribe_props();
      if (isRef(content)) {
        methods.set_content(content.value);
        box$.methods.unsubscribe(
          content.subscribe({
            onChange(value) {
              methods.set_content(value);
            },
          }),
        );
        return;
      }
      methods.set_content(content);
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();

  return {
    t: "rich-text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    events: { ...events, onLinkPress },
    _hmr_dispose: box$.methods.destroy,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      box$.methods.destroy();
      state.rendered = false;
      $elm = null;
    },
  };
}
