/**
 * Label - A component for rendering HTML label elements.
 *
 * Label associates itself with a form input via the "for" attribute.
 * Supports reactive htmlFor for dynamic input associations.
 *
 * @example
 * ```tsx
 * <Label for="username">Username</Label>
 * <Input id="username" />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

import { Text } from "./text";
import { Box, BoxProps } from "./box";

/** Props for Label component */
export type LabelProps = BoxProps & {
  /** ID of the associated input element */
  for?: string | DerivedRef<string> | Ref<string>;
};

/** Internal state for Label */
export interface LabelState {
  for?: string;
  children: TimelessElement[];
}

/**
 * Creates a Label component.
 *
 * @param props - Label props including optional htmlFor
 * @param children - Label text/content
 * @returns A TimelessElement representing a label
 */
export function Label(props: LabelProps = {}, children?: ViewChildren) {
  const { for: htmlFor, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<LabelState>(rest, {} as LabelState);
  const listener$ = ListenerManager();

  const state = box$.state;

  const methods = {
    subsctibe_props() {
      box$.methods.subscribe_props();
      if (htmlFor !== undefined) {
        if (isRef(htmlFor)) {
          const unsub = htmlFor.subscribe({
            onChange(v) {
              state.for = v as string;
              if ($elm) {
                $elm.setAttribute("for", v as string);
              }
            },
          });
          listener$.push(unsub);
          state.for = htmlFor.value;
        } else {
          state.for = htmlFor;
        }
      }
    },
  };

  methods.subsctibe_props();
  box$.methods.build_children(children);

  return {
    t: "label",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    get children() {
      return state.children;
    },
    render() {
      return $elm;
    },
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
