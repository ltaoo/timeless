/** Fixed semantic elements. View remains a pure visual container.
 * Native form submission uses Form; raw controls use attributes and native events.
 * The DOM host owns element creation; primitive never touches the DOM.
 */
import { Box, BoxProps } from "./box";
import { ViewChildren, isElement, destroyElement } from "./type";
import { MountedEvent } from "@/event";
import { Form } from "@/input/form";
export type HtmlProps = Omit<BoxProps, "as">;
function fixed(tag: string) {
  return function(props: HtmlProps = {}, children?: ViewChildren) {
    let host: any = null;
    let cleanup: void | (() => void);
    const box = Box(props, { tag });
    box.methods.subscribe_props(); box.methods.add_event(); box.methods.build_children(children);
    function unmount() {
      cleanup?.(); cleanup = undefined;
      box.methods.set$elm(null); host = null; box.state.rendered = false;
      props.onUnmounted?.();
    }
    return {
      t: "html:" + tag, state: box.state, children: box.state.children, events: box.events,
      get $elm() { return host; },
      set $elm(value: any) { host = value; box.methods.set$elm(value); },
      onMounted(event: MountedEvent) {
        box.state.rendered = true; cleanup = props.onMounted?.(event);
        for (const child of box.state.children) if (isElement(child)) child.onMounted?.({ target: child.$elm });
      },
      beforeUnmounted() {
        props.beforeUnmounted?.();
        for (const child of box.state.children) if (isElement(child)) child.beforeUnmounted?.();
      },
      onUnmounted: unmount,
      destroy() {
        unmount(); box.methods.destroy();
        for (const child of box.state.children) destroyElement(child);
      },
    };
  };
}
export const Html = Object.freeze({
  Span: fixed("span"),
  H1: fixed("h1"),
  H2: fixed("h2"),
  H3: fixed("h3"),
  H4: fixed("h4"),
  H5: fixed("h5"),
  H6: fixed("h6"),
  P: fixed("p"),
  Section: fixed("section"),
  Article: fixed("article"),
  Pre: fixed("pre"),
  Code: fixed("code"),
  Strong: fixed("strong"),
  Em: fixed("em"),
  Small: fixed("small"),
  Label: fixed("label"),
  A: fixed("a"),
  Input: fixed("input"),
  Button: fixed("button"),
  Img: fixed("img"),
  Ul: fixed("ul"),
  Ol: fixed("ol"),
  Li: fixed("li"),
  Nav: fixed("nav"),
  Aside: fixed("aside"),
  Main: fixed("main"),
  Header: fixed("header"),
  Footer: fixed("footer"),
  Details: fixed("details"),
  Summary: fixed("summary"),
  Blockquote: fixed("blockquote"),
  Time: fixed("time"),
  Canvas: fixed("canvas"),
  Video: fixed("video"),
  Iframe: fixed("iframe"),
  Table: fixed("table"),
  Thead: fixed("thead"),
  Tbody: fixed("tbody"),
  Tfoot: fixed("tfoot"),
  Tr: fixed("tr"),
  Th: fixed("th"),
  Td: fixed("td"),
  Kbd: fixed("kbd"),
  Dl: fixed("dl"),
  Dt: fixed("dt"),
  Dd: fixed("dd"),
  Select: fixed("select"),
  Option: fixed("option"),
  Figure: fixed("figure"),
  Figcaption: fixed("figcaption"),
  Fieldset: fixed("fieldset"),
  Legend: fixed("legend"),
  Dialog: fixed("dialog"),
  Div: fixed("div"),
  Form,
});
