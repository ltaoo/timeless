import { Ref, Subscriber, isRef } from "@timeless/reactive";

export type StyleObject = Record<string, any>;

export interface StyleRef {
  __style_ref: true;
  value: StyleObject;
  _subscribe(ctx: Subscriber): void;
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

function parseCssDeclarations(cssText: string, target: StyleObject) {
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
    | StyleObject
    | Ref<StyleRef | StyleObject | undefined>
    | StyleRef
    | undefined
  )[],
): Ref<StyleObject> {
  const sources: (
    | StyleObject
    | Ref<StyleRef | StyleObject | undefined>
    | StyleRef
    | undefined
  )[] = [];
  const _deps: Subscriber[] = [];

  function notify() {
    const styleObj = compute_style();
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(styleObj);
      }
    }
  }

  function compute_style(): StyleObject {
    const result: StyleObject = {};

    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      if (!source) {
        continue;
      }

      if (typeof source === "string") {
        parseCssDeclarations(source, result);
      } else if (isRef(source)) {
        const val = source.value;
        if (typeof val === "string") {
          parseCssDeclarations(val, result);
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

  function addSourceFromItem(
    item:
      | StyleObject
      | Ref<StyleRef | StyleObject | undefined>
      | StyleRef
      | undefined,
  ) {
    if (!item) {
      return;
    }
    if (item && typeof item === "object" && !isRef(item) && !isStyleRef(item)) {
      const obj = item as StyleObject;
      // subscribe to nested refs within object
      Object.keys(obj).forEach((k) => {
        const vv = (obj as any)[k];
        if (isRef(vv)) {
          (vv as any)._subscribe({
            onChange() {
              notify();
            },
          });
        }
      });
      sources.push(obj);
      return;
    }
    if (isStyleRef(item)) {
      sources.push(item);
      item._subscribe({
        onChange() {
          notify();
        },
      });
      return;
    }
    if (isRef(item)) {
      sources.push(item as Ref<string | StyleRef | StyleObject | undefined>);
      item._subscribe({
        onChange() {
          notify();
        },
      });
    }
  }

  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      addSourceFromItem(items[i]);
    }
  }

  return {
    // __style_ref: true as const,
    __is_ref: true as const,
    get value() {
      return compute_style();
    },
    isSame(v: any) {
      // return v === this.value;
      return false;
    },
    isStrictEqual(v: any) {
      // return v === this.value;
      return false;
    },
    _destroy() {
      notify();
    },
    _subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    // toString() {
    //   return styleObjectToCssText(computeStyle());
    // },
  };
}
