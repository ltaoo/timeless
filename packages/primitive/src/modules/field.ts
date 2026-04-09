import { computed, refobj } from "@timeless/reactive";
import { SingleFieldCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Show } from "@/reactive/show";

// export function Field(
//   props: ViewProps & { store: SingleFieldCore<any> },
//   children?: ViewChildren,
// ) {
//   return View(props, children);
// }

// export namespace Field {

// }
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
  props: ViewProps & { store: SingleFieldCore<any>; fallback?: ViewChildren },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  props.store.onStateChange((v) => state_.as(v));

  return Show({
    when: computed(state_, (t) => {
      return !!t.error;
    }),
    ok() {
      return children || [];
    },
    else() {
      return props.fallback || [];
    },
  });
}

export function Help(
  props: ViewProps & { store: SingleFieldCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

// export function ObjectField(
//   props: ViewProps & { store: ObjectFieldCore<any> },
//   children?: ViewChildren,
// ) {
//   return View(props, children);
// }

// export namespace ObjectField {
//   export function Fields(
//     props: ViewProps & {
//       store: ObjectFieldCore<any>;
//       render: (fieldName: string, field: SingleFieldCore<any>) => ViewChildren;
//     },
//   ) {
//     const { store, render: renderChildren, key, ...rest } = props;
//     const state_ = refobj(store.state);
//     store.onStateChange((v) => state_.as(v));

//     return For({
//       ...rest,
//       each: computed(state_, (s) => Object.keys(s.fields)),
//       key: typeof key === "string" ? key : undefined,
//       render(fieldName: string) {
//         const field = store.fields[fieldName];
//         const children = renderChildren(fieldName, field);
//         if (!children) return null;
//         return View({}, children);
//       },
//     });
//   }
// }

// export function ArrayField(
//   props: ViewProps & { store: ArrayFieldCore<any> },
//   children?: ViewChildren,
// ) {
//   return View(props, children);
// }

// export namespace ArrayField {
//   export function Items(
//     props: ViewProps & {
//       store: ArrayFieldCore<any>;
//       render: (item: any, index: number) => ViewChildren;
//     },
//   ) {
//     const { store, render: renderChildren, key, ...rest } = props;
//     const state_ = refobj(store.state);
//     store.onStateChange((v) => state_.as(v));

//     return For({
//       ...rest,
//       each: computed(state_, (s) => s.fields),
//       key: typeof key === "string" ? key : undefined,
//       render(item: any, index: any) {
//         const idx = typeof index === "number" ? index : (index?.value ?? 0);
//         const children = renderChildren(item, idx);
//         if (!children) return null;
//         return View({}, children);
//       },
//     });
//   }

//   export function Item(
//     props: ViewProps & { store: ArrayFieldCore<any>; id: number },
//     children?: ViewChildren,
//   ) {
//     return View(props, children);
//   }

//   export function Append(
//     props: ViewProps & { store: ArrayFieldCore<any> },
//     children?: ViewChildren,
//   ) {
//     const { store, onClick, ...rest } = props;
//     return View(
//       {
//         ...rest,
//         onClick(e: any) {
//           store.append();
//           if (onClick) onClick(e);
//         },
//       },
//       children,
//     );
//   }

//   export function Remove(
//     props: ViewProps & { store: ArrayFieldCore<any>; id: number },
//     children?: ViewChildren,
//   ) {
//     const { store, id, onClick, ...rest } = props;
//     return View(
//       {
//         ...rest,
//         onClick(e: any) {
//           store.remove(id);
//           if (onClick) onClick(e);
//         },
//       },
//       children,
//     );
//   }

//   export function Unshift(
//     props: ViewProps & { store: ArrayFieldCore<any> },
//     children?: ViewChildren,
//   ) {
//     const { store, onClick, ...rest } = props;
//     return View(
//       {
//         ...rest,
//         onClick(e: any) {
//           store.insertBefore(store.fields[0]?.id ?? 0);
//           if (onClick) onClick(e);
//         },
//       },
//       children,
//     );
//   }
// }
