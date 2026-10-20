import { TimelessElement, VNodeView } from "@timeless/timeless";
import { HostElement } from "./box";
import { requestNativeLayout } from "../stylesheet";

export function NativeSelect(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}) {
  const node = {
    type: "select",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    value: "",
    placeholder: "",
  };
  const { methods } = HostElement({
    t: "select",
    $elm: node,
    build: props.build,
  });
  function setValue(value: any) {
    node.value = String((Array.isArray(value) ? value[0] : value) ?? "");
    requestNativeLayout();
  }
  function setPlaceholder(value: string) {
    node.placeholder = value;
    requestNativeLayout();
  }
  return {
    ...methods,
    t: "select",
    get $elm() {
      return node;
    },
    getType() {
      return "input" as const;
    },
    isDocumentFragment() {
      return false;
    },
    setValue,
    setPlaceholder,
    hydrate(element: TimelessElement, dom: any) {
      methods.set$elm(dom);
      methods.applyState(element.state, { initial: true });
      methods.setupEventListener(element.events);
    },
    render() {
      methods.applyState(props.elm.state, { initial: true });
      methods.setDefaultStyle({ height: "32px" });
      setValue(props.elm.state.value);
      setPlaceholder(props.elm.state.placeholder);
      methods.render(props.elm.children);
      methods.setupEventListener(props.elm.events);
      return node;
    },
  };
}

export function NativeSelectOption(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}) {
  const group = props.elm.t === "select-option-group";
  const node = {
    type: props.elm.t,
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    get value() {
      return String(props.elm.state.value ?? "");
    },
    get label() {
      return String(props.elm.state.label ?? "");
    },
    selected: !!props.elm.state.selected,
  };
  Object.defineProperty(node.attrs, "disabled", {
    enumerable: true,
    configurable: true,
    get: () => (props.elm.state.disabled ? "" : undefined),
  });
  const { methods } = HostElement({
    t: node.type,
    $elm: node,
    build: props.build,
  });
  return {
    ...methods,
    t: node.type,
    get $elm() {
      return node;
    },
    getType() {
      return "view" as const;
    },
    isDocumentFragment() {
      return false;
    },
    select() {
      node.selected = true;
      requestNativeLayout();
    },
    unselect() {
      node.selected = false;
      requestNativeLayout();
    },
    hydrate(element: TimelessElement, dom: any) {
      methods.set$elm(dom);
      methods.applyState(element.state, { initial: true });
      methods.setupEventListener(element.events);
    },
    render() {
      methods.applyState(props.elm.state, { initial: true });
      if (group) methods.render(props.elm.children);
      return node;
    },
  };
}

export function isNativeSelect(value: any) {
  return value?.t === "select";
}

export type NativeSelect = ReturnType<typeof NativeSelect>;
