import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "@/content/type";
import { Txt } from "./text";
import { MountedEvent } from "@/event";

export interface LabelProps {
  for?: string | DerivedRef<string> | Ref<string>;
  htmlFor?: string | Ref<string>;
  class?: ViewProps["class"];
  style?: ViewProps["style"];
  attributes?: ViewProps["attributes"];
  onMounted?: ViewProps["onMounted"];
}

export interface LabelState {
  children: TimelessElement[];
}

export function Label(props: LabelProps = {}, children?: ViewChildren) {
  const { for: forProp, htmlFor, attributes, onMounted, ...rest } = props;
  let $elm: any = null;

  const attrFor = htmlFor ?? forProp;

  let mergedAttributes: ViewAttributes | undefined = attributes;
  if (attrFor !== undefined) {
    mergedAttributes = { ...(attributes || {}), for: attrFor };
  }

  const state: LabelState = {
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
  };

  methods.setup_children(children);

  return {
    t: "label",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
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
