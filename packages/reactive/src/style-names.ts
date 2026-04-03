import { Ref, Subscriber, isRef } from "./types";

export interface StyleRef {
  __style_ref: true;
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

type StyleObject = Record<string, any>;

export function styleNames(
  items: (
    | string
    | StyleObject
    | Ref<string | StyleRef | StyleObject | undefined>
    | StyleRef
    | undefined
  )[],
): StyleRef {
  const sources: (
    | string
    | StyleObject
    | Ref<string | StyleRef | StyleObject | undefined>
    | StyleRef
    | undefined
  )[] = [];
  const _deps: Subscriber[] = [];

  function notify() {
    const styleText = computeStyle();
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(styleText);
      }
    }
  }

  function computeStyle(): string {
    const styleMap = new Map<string, string>();

    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      if (!source) {
        continue;
      }

      let styleText = "";
      if (typeof source === "string") {
        styleText = source;
      } else if (isRef(source)) {
        const val = source.value;
        if (typeof val === "string") {
          styleText = val;
        } else if (isStyleRef(val)) {
          styleText = val.toString();
        } else if (val && typeof val === "object") {
          for (const k of Object.keys(val)) {
            const vv = (val as any)[k];
            const v = isRef(vv) ? (vv as any).value : vv;
            if (v !== undefined && v !== null && v !== false) {
              styleMap.set(k, String(v));
            }
          }
          continue;
        }
      } else if (isStyleRef(source)) {
        styleText = source.toString();
      } else if (typeof source === "object") {
        const obj = source as StyleObject;
        for (const k of Object.keys(obj)) {
          const vv = (obj as any)[k];
          const v = isRef(vv) ? (vv as any).value : vv;
          if (v !== undefined && v !== null && v !== false) {
            styleMap.set(k, String(v));
          }
        }
        continue;
      }

      // Parse CSS declarations
      if (styleText) {
        const declarations = styleText.split(";").filter(Boolean);
        for (const decl of declarations) {
          const colonIndex = decl.indexOf(":");
          if (colonIndex > 0) {
            const prop = decl.substring(0, colonIndex).trim();
            const value = decl.substring(colonIndex + 1).trim();
            if (prop && value) {
              styleMap.set(prop, value);
            }
          }
        }
      }
    }

    // Convert map back to CSS string
    const result: string[] = [];
    styleMap.forEach((value, prop) => {
      result.push(`${prop}: ${value}`);
    });
    return result.join("; ");
  }

  function addSourceFromItem(
    item:
      | string
      | StyleObject
      | Ref<string | StyleRef | StyleObject | undefined>
      | StyleRef
      | undefined,
  ) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push(item);
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
    __style_ref: true as const,
    _subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    toString() {
      return computeStyle();
    },
  };
}
