import {
  getIconRegistry,
  type ASNNode,
  type IconState,
  type TimelessElement,
  type VNodeView,
} from "@timeless/timeless";
import { requestNativeLayout } from "../stylesheet";

import { HostElement, BoxMethods } from "./box";

export type NativeIcon = VNodeView<any> & {
  t: "icon";
  render(): any;
  setIcon(value: IconState): void;
};

export function NativeIcon(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeIcon {
  const t = "icon";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "icon",
    name: "" as string,
    color: "" as string,
    size: 24,
    svg: null as string | null,
    _onIconChange: undefined as undefined | (() => void),
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };

  const methods: BoxMethods = box$.methods;

  return {
    ...methods,
    t,
    get $elm() {
      return $elm;
    },
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setIcon(value) {
      const registry = getIconRegistry();
      const icon = Object.prototype.hasOwnProperty.call(registry, value.name)
        ? registry[value.name]
        : undefined;
      const svg = icon ? serialize_icon(icon) : null;
      const size =
        Number.isFinite(value.size) && value.size > 0 ? value.size : 24;
      if (
        $elm.name === value.name &&
        $elm.color === value.color &&
        $elm.size === size &&
        $elm.svg === svg
      )
        return;
      const resized = $elm.size !== size;
      $elm.name = value.name;
      $elm.color = value.color;
      $elm.size = size;
      $elm.svg = svg;
      $elm._onIconChange?.();
      if (resized) requestNativeLayout();
    },
    setStyle(style: any) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      methods.setStyleValue(key, value);
    },
    setStyleSet(names: string[]) {
      methods.setStyleSet(names);
    },
    setAttribute(key: string, value: string) {
      methods.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      methods.removeAttribute(key);
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $elm.listeners[type] = handler;
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      delete $elm.listeners[type];
    },
    getBoundingClientRect() {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
    },
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });
      methods.setupEventListener(props.elm.events);

      this.setIcon(props.elm.state);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      methods.set$elm($dom);
      methods.setupEventListener(elm.events);
    },
    buildChildren(children: (TimelessElement | null)[]) {
      return methods.buildChildren(children);
    },
    insertChildren(children: (TimelessElement | null)[]) {
      methods.insertChildren(children);
    },
    removeChildren() {
      methods.removeChildren();
    },
    getParent() {
      return null;
    },
    get$elm() {
      return $elm;
    },
    getChildren() {
      return methods.getChildren();
    },
  };
}

export function isNativeIcon(value: any): value is NativeIcon {
  return value.t === "icon";
}

function serialize_icon(node: ASNNode): string {
  const xml_name = /^[A-Za-z_][\w:.-]*$/;
  if (!xml_name.test(node.tag))
    throw new Error(`Invalid icon tag: ${node.tag}`);
  const attrs =
    node.tag === "svg"
      ? { xmlns: "http://www.w3.org/2000/svg", ...node.attrs }
      : (node.attrs ?? {});
  const attributes = Object.entries(attrs)
    .map(([key, value]) => {
      if (!xml_name.test(key))
        throw new Error(`Invalid icon attribute: ${key}`);
      const escaped = value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return ` ${key}="${escaped}"`;
    })
    .join("");
  return `<${node.tag}${attributes}>${(node.children ?? []).map(serialize_icon).join("")}</${node.tag}>`;
}
