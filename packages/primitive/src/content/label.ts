import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "@/content/type";
import { MountedEvent } from "@/event";

import { Text } from "./text";
import { Box, BoxProps } from "./box";

export type LabelProps = BoxProps & {
  for?: string | DerivedRef<string> | Ref<string>;
};

export interface LabelState {
  for?: string;
  children: TimelessElement[];
}

export function Label(props: LabelProps = {}, children?: ViewChildren) {
  const { for: htmlFor, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<LabelState>(rest, {} as LabelState);

  const state = box$.state;

  const methods = {
    subsctibe_props() {
      box$.methods.subscribe_props();
      if (htmlFor !== undefined) {
        if (isRef(htmlFor)) {
          htmlFor.subscribe({
            onChange(v) {
              state.for = v as string;
              if ($elm) {
                $elm.setAttribute("for", v as string);
              }
            },
          });
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
  };
}
