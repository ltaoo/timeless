import {
  ref,
  isRef,
  Ref,
  Subscriber,
  Signal,
  DerivedRef,
} from "@timeless/reactive";

type ViewStylePropValue =
  | DerivedRef<string | number | boolean | null | undefined>
  | Ref<string | number | boolean | null | undefined>
  | string
  | number
  | boolean
  | undefined
  | null;

export type ViewStyleProperties = {
  [k: string]: ViewStylePropValue;
};

export type ViewStyle =
  | ViewStyleProperties
  | DerivedRef<ViewStyleProperties>
  | Ref<ViewStyleProperties>;

// export type RawViewStyleProperties = {
// [k: string]: string | number | boolean | null | undefined;
// };

export interface RawViewStyleProperties {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;

  color?: string;
  backgroundColor?: string;
  opacity?: number;

  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  fontSize?: number;
  fontWeight?: number | "bold" | "normal";
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "line-through";
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  maxLines?: number;
  overflow?: "visible" | "hidden";

  pointerEvents?: "auto" | "none";

  transforms?: VNodeTransform[];
  shadows?: VNodeShadow[];

  [key: string]: any;
}

export interface VNodeTransform {
  translate?: { x?: number; y?: number; z?: number };
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number | { x?: number; y?: number };
  skew?: { x?: number; y?: number };
}

export interface VNodeShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;
}

export type ViewStyleInput = ViewStyle;

export function viewStyleToCssText(style: ViewStyleInput) {
  if (typeof style === "string") {
    return style;
  }
  const parts: string[] = [];
  const keys = Object.keys(style);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const vv = (style as any)[k] as any;
    const v = isRef(vv) ? vv.value : vv;
    if (v === undefined || v === null || v === false) {
      continue;
    }
    parts.push(`${k}: ${String(v)}`);
  }
  return parts.join("; ");
}

export type ClassNameRef = {
  __cn_ref: true;
  value: string[];
  subscribe(ctx: Subscriber<string[]>): () => void;
  destroy(): void;
  as(v: string): void;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
};

export function isClassNameRef(v: any): v is ClassNameRef {
  return v.__cn_ref;
}

export function classNames(
  items: (
    | string
    | DerivedRef<string>
    | Ref<string>
    | ClassNameRef
    | undefined
  )[],
): ClassNameRef {
  const sources: (
    | string
    | DerivedRef<string>
    | Ref<string>
    | ClassNameRef
    | undefined
  )[] = [];
  const _deps: Subscriber<string[]>[] = [];
  const unsubscribe_fns: (() => void)[] = [];

  function notify(action: { type: string }) {
    console.log(
      "[primitive]style/index - classNames notify",
      action,
      _names,
      _deps,
    );
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(_names);
      }
    }
  }
  let _names: string[] = [];
  function recompute() {
    const next: string[] = [];
    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      (() => {
        if (!source) {
          return;
        }
        if (typeof source === "string") {
          const segments = source.split(" ");
          for (let j = 0; j < segments.length; j += 1) {
            const v = segments[j];
            if (v && !next.includes(v)) {
              next.push(v);
            }
          }
          return;
        }
        if (isRef(source)) {
          const v = source.value;
          if (typeof v === "string") {
            const segments = v.split(" ");
            for (let j = 0; j < segments.length; j += 1) {
              const vv = segments[j];
              if (vv && !next.includes(vv)) {
                next.push(vv);
              }
            }
          }
          return;
        }
        if (isClassNameRef(source)) {
          const v = source.toString();
          if (typeof v === "string") {
            const segments = v.split(" ");
            for (let j = 0; j < segments.length; j += 1) {
              const vv = segments[j];
              if (vv && !next.includes(vv)) {
                next.push(vv);
              }
            }
          }
        }
      })();
    }
    // manualAdds.forEach((v) => {
    //   if (!next.includes(v)) {
    //     next.push(v);
    //   }
    // });
    _names = next;
    notify({ type: "refresh" });
    // ctx.onChange(_names);
  }
  function addSourceFromItem(
    item: string | DerivedRef<string> | Ref<string> | ClassNameRef | undefined,
  ) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push(item);
      return;
    }
    if (isClassNameRef(item)) {
      sources.push(item);
      const unsubscribe = item.subscribe({
        onChange() {
          recompute();
        },
      });
      unsubscribe_fns.push(unsubscribe);
      return;
    }
    if (isRef(item)) {
      sources.push(item as Ref<string>);
      const unsubscribe = item.subscribe({
        onChange() {
          recompute();
        },
      });
      unsubscribe_fns.push(unsubscribe);
    }
  }
  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      addSourceFromItem(items[i]);
    }
  }
  recompute();
  return {
    __cn_ref: true as const,
    subscribe(ctx: Subscriber<string[]>) {
      _deps.push(ctx);
      return function () {
        _deps.splice(_deps.indexOf(ctx), 1);
      };
    },
    destroy() {
      unsubscribe_fns.forEach((v) => v());
    },
    as(v: string) {
      return;
    },
    del(v: string) {
      // manualAdds.delete(v);
      _names = _names.filter((vv) => vv !== v);
      notify({ type: "del" });
      // ctx.onChange(_names);
    },
    add(v: string) {
      if (!_names.includes(v)) {
        // manualAdds.add(v);
        _names.push(v);
        notify({ type: "del" });
      }
    },
    append(c: string) {
      const segments = c.split(" ");
      for (let i = 0; i < segments.length; i += 1) {
        const v = segments[i];
        this.add(v);
      }
    },
    get value() {
      return _names;
    },
    toString() {
      return _names.filter(Boolean).join(" ");
    },
  };
}

export function join(v: (string | Signal<string>)[]): Signal<string> {
  const sources = Array.isArray(v) ? v : [];
  function recompute() {
    let next = "";
    for (let i = 0; i < sources.length; i += 1) {
      const item = sources[i];
      if (typeof item === "string") {
        next += item;
      } else if (isRef(item)) {
        next += item.value ?? "";
      }
    }
    return next;
  }

  const r = ref(recompute());
  let destroyed = false;

  for (let i = 0; i < sources.length; i += 1) {
    const item = sources[i];
    if (isRef(item)) {
      item.subscribe({
        onChange() {
          if (destroyed) return;
          const next = recompute();
          if (!r.isStrictEqual(next)) {
            r.set(next);
          }
        },
      });
    }
  }

  const origin_destroy = r.destroy;
  r.destroy = () => {
    destroyed = true;
    origin_destroy();
  };

  return r;
}

export type StyleObject = Record<string, any>;

export interface StyleRef {
  __style_ref: true;
  value: StyleObject;
  subscribe(ctx: Subscriber<StyleObject>): () => void;
  toString(): string;
}

export function isStyleRef(v: any): v is StyleRef {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.__style_ref) {
    return true;
  }
  return false;
}

function styleObjectToCssText(obj: StyleObject): string {
  const parts: string[] = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined || v === null || v === false) continue;
    parts.push(`${k}: ${String(v)}`);
  }
  return parts.join("; ");
}

function parse_css_declarations(cssText: string, target: StyleObject) {
  const declarations = cssText.split(";").filter(Boolean);
  for (const decl of declarations) {
    const colonIndex = decl.indexOf(":");
    if (colonIndex > 0) {
      const prop = decl.substring(0, colonIndex).trim();
      const value = decl.substring(colonIndex + 1).trim();
      if (prop && value) {
        target[prop] = value;
      }
    }
  }
}

export function styleNames(
  items: (
    | ViewStyleProperties
    | DerivedRef<StyleRef | ViewStyleProperties>
    | Ref<StyleRef | ViewStyleProperties>
    | StyleRef
    | undefined
  )[],
): DerivedRef<ViewStyleProperties> {
  const sources: (
    | ViewStyleProperties
    | DerivedRef<StyleRef | ViewStyleProperties>
    | Ref<StyleRef | ViewStyleProperties>
    | StyleRef
    | undefined
  )[] = [];
  const _deps: Subscriber<StyleObject>[] = [];
  const unsubscribe_fns: (() => void)[] = [];

  function notify() {
    const styleObj = compute_style();
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(styleObj);
      }
    }
  }

  function compute_style(): ViewStyleProperties {
    const result: ViewStyleProperties = {};

    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      if (!source) {
        continue;
      }

      if (typeof source === "string") {
        parse_css_declarations(source, result);
      } else if (isRef(source)) {
        const val = source.value;
        if (typeof val === "string") {
          parse_css_declarations(val, result);
        } else if (isStyleRef(val)) {
          Object.assign(result, val.value);
        } else if (val && typeof val === "object") {
          for (const k of Object.keys(val)) {
            const vv = (val as any)[k];
            const v = isRef(vv) ? (vv as any).value : vv;
            if (v !== undefined && v !== null && v !== false) {
              result[k] = v;
            }
          }
        }
      } else if (isStyleRef(source)) {
        Object.assign(result, source.value);
      } else if (typeof source === "object") {
        const obj = source as StyleObject;
        for (const k of Object.keys(obj)) {
          const vv = (obj as any)[k];
          const v = isRef(vv) ? (vv as any).value : vv;
          if (v !== undefined && v !== null && v !== false) {
            result[k] = v;
          }
        }
      }
    }

    return result;
  }

  function add_source_from_item(
    item:
      | ViewStyleProperties
      | Ref<StyleRef | ViewStyleProperties>
      | StyleRef
      | null,
  ) {
    if (!item) {
      return;
    }
    if (item && typeof item === "object" && !isRef(item) && !isStyleRef(item)) {
      const obj = item as ViewStyleProperties;
      // subscribe to nested refs within object
      Object.keys(obj).forEach((k) => {
        const vv = (obj as any)[k];
        if (isRef(vv)) {
          const unsubscribe = vv.subscribe({
            onChange() {
              notify();
            },
          });
          unsubscribe_fns.push(unsubscribe);
        }
      });
      sources.push(obj);
      return;
    }
    if (isStyleRef(item)) {
      sources.push(item);
      const unsubscribe = item.subscribe({
        onChange() {
          notify();
        },
      });
      unsubscribe_fns.push(unsubscribe);
      return;
    }
    if (isRef(item)) {
      sources.push(item);
      const unsubscribe = item.subscribe({
        onChange() {
          notify();
        },
      });
      unsubscribe_fns.push(unsubscribe);
    }
  }

  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item) {
        // @ts-ignore
        add_source_from_item(item);
      }
    }
  }

  return {
    __is_ref: true as const,
    get value() {
      return compute_style();
    },
    destroy() {
      for (const unsubscribe of unsubscribe_fns) {
        unsubscribe();
      }
      _deps.length = 0;
      unsubscribe_fns.length = 0;
    },
    subscribe(ctx: Subscriber<StyleObject>) {
      _deps.push(ctx);
      return function () {
        _deps.splice(_deps.indexOf(ctx), 1);
      };
    },
    isSame(v: any) {
      // return v === this.value;
      return false;
    },
    isStrictEqual(v: any) {
      // return v === this.value;
      return false;
    },
    // toString() {
    //   return styleObjectToCssText(computeStyle());
    // },
  };
}
