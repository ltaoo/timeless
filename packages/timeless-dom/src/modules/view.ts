import { VNode, isRef, ref, styleNames, isClassName } from "@timeless/timeless";

const { h } = VNode;

function toStylePresets(
  cls: unknown,
): string[] | ReturnType<typeof ref<string[]>> | undefined {
  const split = (v: unknown) =>
    String(v ?? "")
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);

  if (cls === undefined || cls === null || cls === false) return undefined;
  if (typeof cls === "string") return split(cls);

  if (isRef(cls)) {
    const src = cls;
    const out = ref<string[]>(split(src.value));
    src.subscribe({
      onChange(v: any) {
        out.set(split(v));
      },
    });
    return out;
  }

  if (isClassName(cls)) {
    const out = ref<string[]>(split(cls.toString()));
    cls.subscribe({
      onChange() {
        out.set(split(cls.toString()));
      },
    });
    return out;
  }

  return split(cls);
}

export function View(props: any, children: any[]) {
  const tag = props?.as ?? "div";

  const attrs: Record<string, any> = { ...(props?.attributes ?? {}) };
  const dataset = props?.dataset ?? {};
  for (const k of Object.keys(dataset)) {
    attrs[`data-${k}`] = dataset[k];
  }

  const style = styleNames([props?.style]);
  const stylePresets = toStylePresets(props?.class);

  const events: Record<string, any> = {};
  const excluded = new Set(["onMounted", "beforeUnmounted", "onUnmounted"]);
  if (props && typeof props === "object") {
    for (const k of Object.keys(props)) {
      if (!k.startsWith("on")) continue;
      if (excluded.has(k)) continue;
      const v = (props as any)[k];
      if (typeof v !== "function") continue;
      events[k] = v;
    }
  }

  return h(
    tag,
    {
      key: props?.key,
      draggable: props?.draggable,
      style,
      stylePresets,
      attrs,
      events,
    },
    children,
  );
}
