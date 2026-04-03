import {
  VNode,
  ref,
  computed,
  sn,
  getRendererScheduler,
  CheckboxPrimitive,
} from "@timeless/timeless";

function buildAttrs(attributes?: Record<string, any>, dataset?: Record<string, any>) {
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

export function DomCheckboxRoot(props: any, children: any[]) {
  const scheduler = getRendererScheduler();
  const nodes: any[] = [];
  for (const child of children ?? []) {
    const vnode = VNode.mountChild(child, scheduler);
    if (vnode) nodes.push(vnode);
  }
  return VNode.createFragment(nodes);
}

export function DomCheckboxBox(props: any, children: any[]) {
  const { store, onClick, dataset, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const mergedDataset = {
    ...(dataset ?? {}),
    checked: computed(state$, (d: any) => (d?.checked ? "" : undefined)),
    disabled: computed(state$, (d: any) => (d?.disabled ? "" : undefined)),
  };

  const p = normalizeViewLikeProps({ ...rest, dataset: mergedDataset });
  const handleClick = (e: any) => {
    onClick?.(e);
    store?.toggle?.();
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

export function DomCheckboxIndicator(props: any, children: any[]) {
  const { store, style, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const mergedStyle = sn([
    style,
    {
      display: computed(state$, (d: any) => (d?.checked ? undefined : "none")),
    },
  ]);

  const p = normalizeViewLikeProps({ ...rest, style: mergedStyle });
  return VNode.h("span", p, children);
}

export function DomCheckboxInput(props: any) {
  const { store, id, onChange, style, ...rest } = props ?? {};
  const state$ = ref(store?.state ?? {});
  store?.onStateChange?.(() => state$.as(store.state));

  const mergedStyle = sn([
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
    store?.toggle?.();
  };

  return VNode.h(
    "input",
    {
      ...p,
      props: {
        ...(p.props ?? {}),
        id,
        type: "checkbox",
        checked: computed(state$, (d: any) => !!d?.checked),
        disabled: computed(state$, (d: any) => !!d?.disabled),
      },
      onChange: handleChange,
    },
    [],
  );
}

export function DomCheckboxLabel(props: any, children: any[]) {
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

export function DomCheckboxGroup(props: any, children: any[]) {
  const p = normalizeViewLikeProps(props ?? {});
  const tag = p.as ?? "div";
  return VNode.h(tag, p, children);
}

export function DomCheckboxGroupItem(props: any, children: any[]) {
  const { item, renderCheckbox, renderLabel, ...rest } = props ?? {};
  const p = normalizeViewLikeProps(rest ?? {});
  const tag = p.as ?? "div";
  const labelText = item?.label ?? "";

  const checkboxContent =
    typeof renderCheckbox === "function"
      ? renderCheckbox(item?.core)
      : VNode.h(CheckboxPrimitive.Box, { store: item?.core }, [
          VNode.h(CheckboxPrimitive.Indicator, { store: item?.core }, children),
        ]);

  const labelContent =
    typeof renderLabel === "function" ? renderLabel(labelText) : labelText;

  return VNode.h(tag, p, [checkboxContent, labelContent]);
}
