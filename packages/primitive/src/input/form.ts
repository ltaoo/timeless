import { Box, BoxProps } from "@/content/box";
import { ViewChildren, isElement, destroyElement } from "@/content/type";
import { MountedEvent } from "@/event";

/** Native form shape. View remains a visual container; hosts own form semantics.
 * onSubmit receives the native event. Call preventDefault for asynchronous APIs.
 * Native constraint validation and submission are retained by default.
 */
export type FormProps = Omit<BoxProps, "as"> & {
  onSubmit?: (event: SubmitEvent) => void;
  onReset?: (event: Event) => void;
};

export function Form(props: FormProps = {}, children?: ViewChildren) {
  const { onSubmit, onReset, ...rest } = props;
  const box = Box(rest, {});
  let host: any = null;
  let cleanup: void | (() => void);
  box.methods.subscribe_props();
  box.methods.add_event();
  box.methods.build_children(children);
  const events = { ...box.events, onSubmit, onReset };
  function unmount() {
    cleanup?.(); cleanup = undefined;
    box.methods.set$elm(null); host = null;
    box.state.rendered = false;
    props.onUnmounted?.();
  }
  return {
    t: "form",
    state: box.state,
    children: box.state.children,
    events,
    get $elm() { return host; },
    set $elm(value: any) { host = value; box.methods.set$elm(value); },
    onMounted(event: MountedEvent) {
      box.state.rendered = true;
      cleanup = props.onMounted?.(event);
      for (const child of box.state.children) {
        if (isElement(child)) child.onMounted?.({ target: child.$elm });
      }
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
}
export type Form = ReturnType<typeof Form>;
