import { View, ViewProps, ViewChildren } from "./view";
import { computed, refobj } from "@timeless/reactive";
import { SingleFieldCore, ObjectFieldCore, ArrayFieldCore } from "@timeless/ui";
import { For } from "./for";

export function Field(
  props: ViewProps & { store: SingleFieldCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export namespace Field {
  export function Label(
    props: ViewProps & { store: SingleFieldCore<any> },
    children?: ViewChildren,
  ) {
    const state_ = refobj(props.store.state);
    props.store.onStateChange((v) => state_.as(v));

    return View(props, children || [computed(state_, (s) => s.label)]);
  }

  export function Control(
    props: ViewProps & { store: SingleFieldCore<any> },
    children?: ViewChildren,
  ) {
    return View(props, children);
  }

  export function Error(
    props: ViewProps & { store: SingleFieldCore<any> },
    children?: ViewChildren,
  ) {
    const state_ = refobj(props.store.state);
    props.store.onStateChange((v) => state_.as(v));

    return View(props, children || [computed(state_, (s) => s.error?.message || "")]);
  }

  export function Help(
    props: ViewProps & { store: SingleFieldCore<any> },
    children?: ViewChildren,
  ) {
    return View(props, children);
  }
}

export function ObjectField(
  props: ViewProps & { store: ObjectFieldCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export namespace ObjectField {
  export function Fields(
    props: ViewProps & { store: ObjectFieldCore<any>; render: (fieldName: string, field: SingleFieldCore<any>) => ViewChildren },
  ) {
    const state_ = refobj(props.store.state);
    props.store.onStateChange((v) => state_.as(v));

    return For({
      ...props,
      each: computed(state_, (s) => Object.keys(s.fields)),
      render(fieldName: string) {
        const field = props.store.fields[fieldName];
        return props.render(fieldName, field);
      },
    });
  }
}

export function ArrayField(
  props: ViewProps & { store: ArrayFieldCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export namespace ArrayField {
  export function Items(
    props: ViewProps & { store: ArrayFieldCore<any>; render: (item: any, index: number) => ViewChildren },
  ) {
    const state_ = refobj(props.store.state);
    props.store.onStateChange((v) => state_.as(v));

    return For({
      ...props,
      each: computed(state_, (s) => s.fields),
      render(item: any, index: number) {
        return props.render(item, index);
      },
    });
  }

  export function Item(
    props: ViewProps & { store: ArrayFieldCore<any>; id: number },
    children?: ViewChildren,
  ) {
    return View(props, children);
  }

  export function Append(
    props: ViewProps & { store: ArrayFieldCore<any> },
    children?: ViewChildren,
  ) {
    const { store, onClick, ...rest } = props;
    return View({
      ...rest,
      onClick(e: any) {
        store.append();
        if (onClick) onClick(e);
      },
    }, children);
  }

  export function Remove(
    props: ViewProps & { store: ArrayFieldCore<any>; id: number },
    children?: ViewChildren,
  ) {
    const { store, id, onClick, ...rest } = props;
    return View({
      ...rest,
      onClick(e: any) {
        store.remove(id);
        if (onClick) onClick(e);
      },
    }, children);
  }

  export function Unshift(
    props: ViewProps & { store: ArrayFieldCore<any> },
    children?: ViewChildren,
  ) {
    const { store, onClick, ...rest } = props;
    return View({
      ...rest,
      onClick(e: any) {
        store.insertBefore(store.fields[0]?.id ?? 0);
        if (onClick) onClick(e);
      },
    }, children);
  }
}
