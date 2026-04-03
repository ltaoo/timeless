import { VNode } from "@timeless/timeless";

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

export function DomButtonRoot(props: any, children: any[]) {
  const { store, onClick, ...rest } = props ?? {};
  const p = normalizeViewLikeProps(rest);

  const handleClick = (e: any) => {
    onClick?.(e);
    store?.click?.();
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

