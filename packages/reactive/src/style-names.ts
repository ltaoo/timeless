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

export function styleNames(
  items: (string | Ref<string | StyleRef | undefined> | StyleRef | undefined)[],
): StyleRef {
  const sources: (
    | string
    | Ref<string | StyleRef | undefined>
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
        }
      } else if (isStyleRef(source)) {
        styleText = source.toString();
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
    item: string | Ref<string | StyleRef | undefined> | StyleRef | undefined,
  ) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push(item);
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
      sources.push(item as Ref<string | StyleRef | undefined>);
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
