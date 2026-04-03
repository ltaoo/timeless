import { VNode, ref, refobj, sn } from "@timeless/timeless";

function buildAttrs(attributes?: Record<string, any>, dataset?: Record<string, any>) {
  const attrs: Record<string, any> = { ...(attributes ?? {}) };
  if (dataset) {
    for (const k of Object.keys(dataset)) {
      attrs[`data-${k}`] = dataset[k];
    }
  }
  return attrs;
}

function buildElementProps(base: Record<string, any>, cls: any) {
  const props = { ...(base ?? {}) };
  if (cls !== undefined) {
    props.className = cls;
  }
  return props;
}

function normalizeViewLikeProps(input: any) {
  const attrs = buildAttrs(input.attributes, input.dataset);
  const props = buildElementProps(input.props, input.class);
  return { ...input, attrs, props };
}

export function DomInput(inputProps: any) {
  const {
    id,
    type = "text",
    value,
    placeholder,
    disabled,
    readonly,
    maxLength,
    minLength,
    pattern,
    required,
    autocomplete,
    autocorrect = "off",
    inputMode,
    name,
  } = inputProps ?? {};

  const props = normalizeViewLikeProps(inputProps ?? {});
  const elementProps = {
    ...props.props,
    id,
    type,
    value,
    placeholder,
    disabled,
    readOnly: readonly,
    maxLength,
    minLength,
    pattern,
    required,
    autocomplete,
    autocorrect,
    inputMode,
    name,
  };

  return VNode.h(
    "input",
    {
      ...props,
      props: elementProps,
    },
    [],
  );
}

export function DomInputRoot(props: any, children: any[]) {
  const p = normalizeViewLikeProps(props ?? {});
  const tag = p.as ?? "div";
  return VNode.h(tag, p, children);
}

export function DomInputField(props: any) {
  const { store, id, ...rest } = props ?? {};

  const value$ = refobj(store?.value ?? "");
  const placeholder$ = ref(store?.placeholder ?? "");
  const disabled$ = ref(store?.disabled ?? false);
  const type$ = ref(store?.type ?? "text");

  store?.onStateChange?.((state: any) => {
    value$.as(state?.value ?? "");
    placeholder$.as(state?.placeholder ?? "");
    disabled$.as(!!state?.disabled);
    type$.as(state?.tmpType ?? state?.type ?? "text");
  });

  const base = normalizeViewLikeProps(rest);
  const attrs = {
    ...(base.attrs ?? {}),
    autocomplete: store?.autoComplete ? "on" : "off",
    autocorrect: "off",
  };

  const onInput = (e: any) => {
    base.onInput?.(e);
    store?.handleChange?.(e);
  };

  const onKeyDown = (e: any) => {
    base.onKeyDown?.(e);
    store?.handleKeyDown?.({
      key: e?.key,
      preventDefault: () => e?.preventDefault?.(),
    });
  };

  const onFocus = (e: any) => {
    base.onFocus?.(e);
    store?.handleFocus?.();
  };

  const onBlur = (e: any) => {
    base.onBlur?.(e);
    store?.handleBlur?.();
  };

  const elementStyle = sn([rest.style]);
  const elementProps = {
    ...buildElementProps(base.props, base.class),
    id,
    value: value$,
    placeholder: placeholder$,
    disabled: disabled$,
    type: type$,
    autoFocus: store?.autoFocus,
  };

  return VNode.h(
    "input",
    {
      ...base,
      style: elementStyle,
      attrs,
      props: elementProps,
      onInput,
      onKeyDown,
      onFocus,
      onBlur,
    },
    [],
  );
}
