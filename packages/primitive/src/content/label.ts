import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "@/content/type";
import { MountedEvent } from "@/event";

import { Txt } from "./text";

export interface LabelProps {
  for?: string | DerivedRef<string> | Ref<string>;
  class?: ViewProps["class"];
  style?: ViewProps["style"];
  attributes?: ViewProps["attributes"];
  onMounted?: ViewProps["onMounted"];
}

export interface LabelState {
  for?: string;
  children: TimelessElement[];
}

export function Label(props: LabelProps = {}, children?: ViewChildren) {
  const { for: htmlFor, attributes, onMounted, ...rest } = props;

  let $elm: any = null;

  const state: LabelState = {
    for: "",
    children: [],
  };

  const methods = {
    setup_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (const child of children) {
        if (isElement(child)) {
          state.children.push(child);
        }
        if (isRef(child)) {
          state.children.push(Txt(child));
        }
        if (typeof child === "string" || typeof child === "number") {
          state.children.push(Txt(child));
        }
      }
    },
    setup_value_subscribe() {
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

  methods.setup_children(children);
  methods.setup_value_subscribe();

  return {
    t: "label",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: state.children,
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
