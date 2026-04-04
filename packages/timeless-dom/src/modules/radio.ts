import {
  h,
  VNode,
  ref,
  computed,
  styleNames,
  getRendererScheduler,
  RadioPrimitive,
} from "@timeless/timeless";

function buildAttrs(
  attributes?: Record<string, any>,
  dataset?: Record<string, any>,
) {
  const attrs: Record<string, any> = { ...(attributes ?? {}) };
  if (dataset) {
    for (const k of Object.keys(dataset)) {
      attrs[`data-${k}`] = dataset[k];
    }
  }
  return attrs;
}

function normalizeViewLikeProps(input: any) {
  const attrs = buildAttrs(input.attributes, input.dataset);
  const props = { ...(input.props ?? {}) };
  if (input.class !== undefined) {
    props.className = input.class;
  }
  return { ...input, attrs, props };
}

export function DomRadioRoot(_props: any, children: any[]) {
  const scheduler = getRendererScheduler();
  const nodes: any[] = [];
  for (const child of children ?? []) {
    const vnode = VNode.mountChild(child, scheduler);
    if (vnode) nodes.push(vnode);
  }
  return VNode.createFragment(nodes);
}

export function DomRadioBox(props: any, children: any[]) {
  const { store, onClick, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const p = normalizeViewLikeProps(rest);
  const handleClick = (e: any) => {
    onClick?.(e);
    store?.check?.();
  };

  return VNode.h(
    "button",
    {
      ...p,
      props: { ...(p.props ?? {}), type: (p.props as any)?.type ?? "button" },
      onClick: handleClick,
    },
    children,
  );
}

export function DomRadioIndicator(props: any, children: any[]) {
  const { store, style, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const mergedStyle = styleNames([
    style,
    {
      display: computed(state$, (d: any) => (d?.checked ? undefined : "none")),
    },
  ]);

  const p = normalizeViewLikeProps({ ...rest, style: mergedStyle });
  return VNode.h("span", p, children);
}

export function DomRadioInput(props: any) {
  const { store, id, onChange, style, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const mergedStyle = styleNames([
    {
      position: "absolute",
      "pointer-events": "none",
      opacity: 0,
      margin: "0px",
      transform: "translateX(-100%)",
      width: "16px",
      height: "16px",
    },
    style,
  ]);

  const p = normalizeViewLikeProps({ ...rest, style: mergedStyle });

  const handleChange = (e: any) => {
    onChange?.(e);
    store?.check?.();
  };

  return VNode.h(
    "input",
    {
      ...p,
      props: {
        ...(p.props ?? {}),
        id,
        type: "radio",
        checked: computed(state$, (d: any) => !!d?.checked),
        disabled: computed(state$, (d: any) => !!d?.disabled),
      },
      onChange: handleChange,
    },
    [],
  );
}

export function DomRadioLabel(props: any, children: any[]) {
  const { for: htmlFor, ...rest } = props ?? {};
  const p = normalizeViewLikeProps(rest);
  return VNode.h(
    "label",
    {
      ...p,
      props: { ...(p.props ?? {}), htmlFor },
    },
    children,
  );
}

export function DomRadioGroup(props: any, children: any[]) {
  const p = normalizeViewLikeProps(props ?? {});
  const tag = p.as ?? "div";
  return VNode.h(tag, p, children);
}

export function DomRadioGroupItem(props: any, children: any[]) {
  const { item, renderRadio, renderLabel, ...rest } = props ?? {};
  const p = normalizeViewLikeProps(rest ?? {});
  const tag = p.as ?? "div";
  const labelText = item?.label ?? "";

  const radioContent =
    typeof renderRadio === "function"
      ? renderRadio(item?.core)
      : h(RadioPrimitive.Box, { store: item?.core }, [
          h(RadioPrimitive.Indicator, { store: item?.core }, children),
        ]);

  const labelContent =
    typeof renderLabel === "function" ? renderLabel(labelText) : labelText;

  return h(tag, p, [radioContent, labelContent]);
}
