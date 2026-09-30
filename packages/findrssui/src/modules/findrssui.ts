// ⚠️ 本文件是从 findrss-reader 逐字迁出的**未标注类型的 JS**（原路径 frontend/src/components/），
// 这一轮只做「搬过来 + 换模块说明符 + 换样式表归属」，没有顺手补类型：原文件每个函数都是
// `function X(props = {})`，逐条标注等于把文件重写一遍，风险远大于收益。
// `@ts-nocheck` 让构建输出保持干净（否则这里会有上百条 TS2339）；代价是声明产物退化成宽泛签名，
// 使用方的类型提示因此有限。补类型是独立的一轮工作。
// @ts-nocheck
// FindRSS 的 Timeless UI：组件只渲染，交互状态由对应 ViewModel（Timeless vm core）维护。
// 需要 Portal / 全局宿主的组件（Dialog / DropdownMenu / Toast）在 findrssui-layer.ts。
import { Fragment, Img, Show, View, computed, ref, refobj, ui, vm } from "@timeless/timeless";

// 树走 `TreePrimitive`，不是顶层的具名导出。它有两种挂法，都要认：
//   - 主运行时把重建出的 Tree 挂在 `ui.TreePrimitive` 上；
//   - findrss 的宿主把 tree 重建包成独立运行时，只把结果挂到 `Timeless.FindRSSTree`
//     上（包在 build.js 的 tree 运行时里），主 bundle 的 `ui` 反而没有这一项。
// 所以先读 `FindRSSTree`、再退回 `ui` —— 与 findrss-reader/timeless/index.js 的
// `Timeless.FindRSSTree?.TreePrimitive || Timeless.ui?.TreePrimitive` 保持同一条链。
const host_Timeless =
  typeof globalThis === "undefined" ? undefined : globalThis.Timeless;
const TreePrimitive = host_Timeless?.FindRSSTree?.TreePrimitive || ui.TreePrimitive;

function source_value(value, fallback) {
  return value && typeof value === "object" && "value" in value
    ? value.value
    : value === undefined ? fallback : value;
}

function subscribe_source(source, handler) {
  return source && typeof source.subscribe === "function"
    ? source.subscribe({ onChange: handler })
    : null;
}

function dispose_all(unlistens) {
  for (const unlisten of unlistens) if (typeof unlisten === "function") unlisten();
}

/** 数组 / 单节点统一成 children 数组（Timeless 不展开嵌套数组）。 */
function as_children(value) {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value : [value];
}

let frui_uid = 0;
/** 给 label / input 关联用的稳定 id（模块级自增，跨渲染不变）。 */
function next_uid(prefix) {
  frui_uid += 1;
  return `${prefix}-${frui_uid}`;
}

/**
 * `autocomplete` 只认 on/off：布尔 false 被直接序列化成 `autocomplete="false"` 时，
 * 浏览器会按非法值处理、退回默认（= 开）。这里统一成合法值，`undefined` 表示不写属性。
 * @param {unknown} value
 * @returns {string | undefined}
 */
function normalize_autocomplete(value) {
  const resolved = source_value(value);
  if (resolved === undefined || resolved === null) return undefined;
  if (resolved === true) return "on";
  if (resolved === false) return "off";
  const text = String(resolved).trim();
  return text === "" ? undefined : text;
}

function ButtonViewModel(props = {}) {
  const store = props.store || new vm.ButtonCore({
    disabled: Boolean(source_value(props.disabled, false)),
    loading: Boolean(source_value(props.loading, false)),
    variant: props.variant || "default",
    size: props.size || "default",
  });
  if (props.store && props.disabled !== undefined) {
    source_value(props.disabled, false) ? store.disable() : store.enable();
  }
  if (props.store && props.loading !== undefined) {
    store.setLoading(Boolean(source_value(props.loading, false)));
  }
  const unlistens = [
    subscribe_source(props.disabled, (value) => value ? store.disable() : store.enable()),
    subscribe_source(props.loading, (value) => store.setLoading(Boolean(value))),
  ];
  return { store, destroy: () => dispose_all(unlistens) };
}

function Button(props = {}, children = []) {
  const {
    class: custom_class,
    attributes = {},
    store: provided_store,
    disabled,
    loading,
    variant = provided_store?.state.variant || "default",
    size = provided_store?.state.size || "default",
    href,
    icon,
    icon_position = "start",
    onClick,
    onUnmounted,
    ...rest
  } = props;
  const model = ButtonViewModel({ store: provided_store, disabled, loading, variant, size });
  const state_ = refobj(model.store.state);
  const unlisten = model.store.onStateChange((state) => state_.as(state));
  const loading_node = ui.ButtonPrimitive.Loading({ store: model.store }, [
    View({ class: "frui-button-loading", attributes: { n: "button-loading", "aria-hidden": "true" } }, [
      View({ class: "frui-spinner" }),
    ]),
  ]);
  const icon_node = icon === undefined
    ? null
    : View({ class: "frui-button-icon", attributes: { n: "button-icon", "aria-hidden": "true" } }, as_children(icon));
  const content_node = ui.ButtonPrimitive.Content({}, children);
  const slots = (icon_position === "end"
    ? [loading_node, content_node, icon_node]
    : [loading_node, icon_node, content_node]).filter(Boolean);
  const base_class = `frui-button frui-button-${variant} frui-button-${size}`;
  const class_name = custom_class && typeof custom_class.subscribe === "function"
    ? computed(custom_class, (value) => [base_class, value].filter(Boolean).join(" "))
    : [base_class, custom_class].filter(Boolean).join(" ");
  const clean_up = () => {
    unlisten?.();
    model.destroy();
    state_.destroy?.();
    class_name.destroy?.();
    onUnmounted?.();
  };

  if (href !== undefined) {
    // Timeless 没有 Slot / asChild 机制，`href` 是「长得像按钮的链接」的等价能力。
    // <a> 没有 disabled：只能 aria-disabled + CSS pointer-events。
    const { disabled: _drop, type: _type, ...anchor_attributes } = attributes;
    return View({
      ...rest,
      class: class_name,
      attributes: {
        n: attributes.n || "button",
        href: computed(href, (value) => String(source_value(value) ?? "")),
        ...anchor_attributes,
        "aria-disabled": computed(state_, (state) => state.disabled || state.loading ? "true" : undefined),
        "aria-busy": computed(state_, (state) => state.loading ? "true" : undefined),
      },
      onClick: provided_store ? undefined : onClick,
      onUnmounted: clean_up,
    }, slots);
  }

  return ui.ButtonPrimitive.Root({
    ...rest,
    onClick: provided_store ? undefined : onClick,
    store: model.store,
    class: class_name,
    attributes: {
      n: attributes.n || "button",
      type: attributes.type || "button",
      ...attributes,
      disabled: computed(state_, (state) => state.disabled || state.loading || undefined),
      "aria-busy": computed(state_, (state) => state.loading ? "true" : undefined),
    },
    onUnmounted: clean_up,
  }, slots);
}

function InputViewModel(props = {}) {
  const attributes = props.attributes || {};
  const value_source = props.value;
  const store = props.store || new vm.InputCore({
    defaultValue: source_value(value_source, props.defaultValue ?? ""),
    placeholder: source_value(props.placeholder, attributes.placeholder || ""),
    type: props.type || attributes.type || "text",
    disabled: Boolean(source_value(props.disabled, false)),
    allowClear: props.allowClear === true,
    ignoreEnterEvent: Boolean(props.onKeyDown) && !props.onEnter,
  });
  const unlistens = [
    store.onChange((value) => {
      if (value_source && typeof value_source.as === "function") value_source.as(value);
      else if (value_source && typeof value_source.set === "function") value_source.set(value);
      props.onChange?.(value);
      props.onInput?.({ target: { value } });
    }),
    props.onEnter ? store.onEnter(props.onEnter) : null,
    props.onKeyDown ? store.onKeyDown(props.onKeyDown) : null,
    props.onBlur ? store.onBlur(props.onBlur) : null,
    subscribe_source(value_source, (value) => {
      if (store.value !== value) store.setValue(value, { silence: true });
    }),
    subscribe_source(props.placeholder, (value) => store.setPlaceholder(String(value || ""))),
    subscribe_source(props.disabled, (value) => {
      store.disabled = Boolean(value);
      store.setValue(store.value, { silence: true });
    }),
  ];
  return { store, destroy: () => dispose_all(unlistens) };
}

/**
 * Input / Textarea 共用的属性组装：n 兜底、id，外加长度与 type 的归一。
 *
 * 长度与 `type` 必须走 attributes（`applyState` 会把它们逐字写到 DOM），不能交给 Timeless
 * 的 input 节点：它把 `maxLength` 落成非法属性 `max-length`（浏览器不认，等于没设），
 * `type` 更是根本不看、永远硬编码成 `text`。`autocomplete` 连 attributes 都不能留——
 * input 节点在 render 收尾会用节点状态里的 `autoComplete` 覆盖它，见 `apply_autocomplete`。
 * @param {object} attributes 调用方传入的属性表
 * @param {object} extra 组件自己补的属性（如 id、rows）
 * @param {object} [fields] `{ maxLength, minLength, type }`，均为可选
 */
function field_attributes(attributes, extra, fields = {}) {
  const merged = { n: attributes.n || "input", ...attributes, ...extra };
  delete merged.autocomplete;
  const { maxLength, minLength, type } = fields;
  if (maxLength !== undefined && Number(maxLength) > 0) merged.maxlength = Number(maxLength);
  if (minLength !== undefined && Number(minLength) > 0) merged.minlength = Number(minLength);
  if (type !== undefined) merged.type = type;
  return merged;
}

/** `autocomplete` 的取值：attributes 优先于 props，`undefined` = 不写属性。 */
function field_autocomplete(autoComplete, attributes) {
  return normalize_autocomplete(attributes.autocomplete !== undefined ? attributes.autocomplete : autoComplete);
}

/**
 * `autocomplete` 只能在**挂载后**写：Timeless 的 input 节点在 render 收尾会无条件
 * `setAttribute("autocomplete", state.autoComplete)`，而 `state.autoComplete` 是节点构造期的
 * 硬编码默认值 `false`（props 里的 `autoComplete` 进不了节点状态，只有传 ref 才走 setProp），
 * 于是 attributes 里写什么都会被覆盖成非法值 `autocomplete="false"`——浏览器把非法值按
 * 「默认 = 开」处理，等于永远设不上。挂载钩子在 render 之后跑，所以这里补写是有效的。
 * @param {Element | null} element
 * @param {string | undefined} value `undefined` = 删掉该属性
 */
function apply_autocomplete(element, value) {
  if (!element || typeof element.setAttribute !== "function") return;
  if (value === undefined) element.removeAttribute("autocomplete");
  else element.setAttribute("autocomplete", value);
}

function Input(props = {}) {
  const {
    class: custom_class,
    rootClass,
    rootAttributes = {},
    attributes = {},
    value,
    onChange,
    onInput,
    onKeyDown,
    // 这四个由 field_attributes / apply_autocomplete 落到 DOM，不透传给 Timeless 的 input 节点。
    maxLength,
    minLength,
    type,
    autoComplete,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    status = "default",
    size = "default",
    label,
    help,
    error,
    showCount = false,
    onMounted,
    onUnmounted,
    ...rest
  } = props;
  const model = InputViewModel({ ...props, value, onChange, onInput, onKeyDown, attributes });
  const state_ = refobj(model.store.state);
  const unlisten = model.store.onStateChange((state) => state_.as(state));
  const input_id = attributes.id || next_uid("frui-input");
  const label_id = `${input_id}-label`;
  const help_id = `${input_id}-help`;
  const affixed = prefix !== undefined || suffix !== undefined || addonBefore !== undefined || addonAfter !== undefined;
  const input_attributes = field_attributes(attributes, { id: input_id }, { maxLength, minLength, type });
  const autocomplete = field_autocomplete(autoComplete, attributes);
  if (label !== undefined) input_attributes["aria-labelledby"] = label_id;
  if (help !== undefined || error !== undefined) input_attributes["aria-describedby"] = help_id;
  if (status === "error") input_attributes["aria-invalid"] = "true";
  const max_length = input_attributes.maxlength;

  const root_node = ui.InputPrimitive.Root({
    store: model.store,
    class: [
      "frui-input-root",
      affixed ? "frui-input-root-affixed" : null,
      status !== "default" ? `frui-input-root-${status}` : null,
      size !== "default" ? `frui-input-root-${size}` : null,
      rootClass,
    ].filter(Boolean).join(" "),
    attributes: { n: rootAttributes.n || `${attributes.n || "input"}-root`, ...rootAttributes },
    onUnmounted() {
      unlisten?.();
      model.destroy();
      state_.destroy?.();
      onUnmounted?.();
    },
  }, [
    addonBefore === undefined ? null : View({ class: "frui-input-addon", attributes: { n: "input-addon-before" } }, as_children(addonBefore)),
    prefix === undefined ? null : View({ class: "frui-input-affix", attributes: { n: "input-prefix" } }, as_children(prefix)),
    ui.InputPrimitive.Input({
      ...rest,
      store: model.store,
      class: ["frui-input", affixed ? "frui-input-bare" : null, size !== "default" ? `frui-input-${size}` : null, custom_class]
        .filter(Boolean).join(" "),
      attributes: input_attributes,
      onKeyDown(event) { model.store.handleKeyDown(event); },
      onMounted(event) {
        apply_autocomplete(event?.target?.get$elm ? event.target.get$elm() : event?.target ?? null, autocomplete);
        onMounted?.(event);
      },
    }),
    suffix === undefined ? null : View({ class: "frui-input-affix", attributes: { n: "input-suffix" } }, as_children(suffix)),
    addonAfter === undefined ? null : View({ class: "frui-input-addon", attributes: { n: "input-addon-after" } }, as_children(addonAfter)),
  ].filter(Boolean));

  if (label === undefined && help === undefined && error === undefined && !showCount) return root_node;
  return View({ class: "frui-field", attributes: { n: `${rootAttributes.n || attributes.n || "input"}-field` } }, [
    label === undefined ? null : View({ class: "frui-field-label", attributes: { n: "input-label", id: label_id } }, as_children(label)),
    root_node,
    error !== undefined
      ? View({ class: "frui-field-help frui-field-help-error", attributes: { n: "input-error", id: help_id } }, as_children(error))
      : (help === undefined ? null : View({ class: "frui-field-help", attributes: { n: "input-help", id: help_id } }, as_children(help))),
    showCount
      ? View({ class: "frui-field-count", attributes: { n: "input-count" } }, [
          computed(state_, (state) => `${String(state.value ?? "").length}/${max_length ?? "∞"}`),
        ])
      : null,
  ].filter(Boolean));
}

function Textarea(props = {}) {
  const {
    class: custom_class,
    rootClass,
    rootAttributes = {},
    attributes = {},
    value,
    onChange,
    onInput,
    onKeyDown,
    autoSize,
    rows,
    showCount = false,
    label,
    help,
    // 同 Input：长度与 autocomplete 自己落到 DOM，不透传给 Timeless 的 textarea 节点。
    maxLength,
    minLength,
    autoComplete,
    onMounted,
    onUnmounted,
    ...rest
  } = props;
  const model = InputViewModel({ ...props, value, onChange, onInput, onKeyDown, attributes });
  const state_ = refobj(model.store.state);
  const unlisten = model.store.onStateChange((state) => state_.as(state));
  const textarea_id = attributes.id || next_uid("frui-textarea");
  const label_id = `${textarea_id}-label`;
  const help_id = `${textarea_id}-help`;
  const auto = autoSize === true || (autoSize && typeof autoSize === "object");
  const config = autoSize && typeof autoSize === "object" ? autoSize : {};
  const textarea_attributes = field_attributes(attributes, { id: textarea_id }, { maxLength, minLength });
  const autocomplete = field_autocomplete(autoComplete, attributes);
  if (label !== undefined) textarea_attributes["aria-labelledby"] = label_id;
  if (help !== undefined) textarea_attributes["aria-describedby"] = help_id;
  if (!auto && rows !== undefined) textarea_attributes.rows = rows;
  let element = null;

  /** autoSize：先归零高度再按 scrollHeight 夹到 [minRows, maxRows] 之间。纯 DOM 计算。 */
  function resize() {
    if (!auto || !element) return;
    const style = getComputedStyle(element);
    const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5 || 20;
    const chrome = Math.max(0, element.offsetHeight - element.clientHeight);
    const min_rows = Number(config.minRows) > 0 ? Number(config.minRows) : 0;
    const max_rows = Number(config.maxRows) > 0 ? Number(config.maxRows) : 0;
    element.style.minHeight = min_rows > 0 ? `${min_rows * line + chrome}px` : "0";
    element.style.height = "auto";
    const content = element.scrollHeight;
    const max_height = max_rows > 0 ? max_rows * line + chrome : Infinity;
    const next = Math.min(Math.max(content, min_rows > 0 ? min_rows * line + chrome : 0), max_height);
    element.style.height = `${next}px`;
    element.style.overflowY = content > max_height ? "auto" : "hidden";
  }

  if (auto) model.store.onChange(() => requestAnimationFrame(resize));

  const root_node = ui.TextareaPrimitive.Root({
    store: model.store,
    class: ["frui-textarea-root", size_class_of(rootClass)].filter(Boolean).join(" "),
    attributes: { n: rootAttributes.n || `${attributes.n || "textarea"}-root`, ...rootAttributes },
    onUnmounted() {
      unlisten?.();
      model.destroy();
      state_.destroy?.();
      onUnmounted?.();
    },
  }, [ui.TextareaPrimitive.Textarea({
    ...rest,
    store: model.store,
    class: ["frui-input", "frui-textarea", auto ? "frui-textarea-auto" : null, custom_class].filter(Boolean).join(" "),
    attributes: textarea_attributes,
    onKeyDown(event) { model.store.handleKeyDown(event); },
    onMounted(event) {
      element = event?.target?.get$elm ? event.target.get$elm() : event?.target ?? null;
      apply_autocomplete(element, autocomplete);
      onMounted?.(event);
      requestAnimationFrame(resize);
    },
  })]);

  if (label === undefined && help === undefined && !showCount) return root_node;
  return View({ class: "frui-field", attributes: { n: `${rootAttributes.n || attributes.n || "textarea"}-field` } }, [
    label === undefined ? null : View({ class: "frui-field-label", attributes: { n: "textarea-label", id: label_id } }, as_children(label)),
    root_node,
    help === undefined ? null : View({ class: "frui-field-help", attributes: { n: "textarea-help", id: help_id } }, as_children(help)),
    showCount
      ? View({ class: "frui-textarea-count", attributes: { n: "textarea-count" } }, [
          computed(state_, (state) => `${String(state.value ?? "").length}/${textarea_attributes.maxlength ?? "∞"}`),
        ])
      : null,
  ].filter(Boolean));
}

/** Textarea 没有 size prop，但保留 rootClass 透传（历史行为）。 */
function size_class_of(root_class) {
  return root_class;
}

function component_view(class_name, props = {}, children = []) {
  const { class: custom_class, attributes = {}, ...rest } = props;
  return View({
    ...rest,
    class: [class_name, custom_class].filter(Boolean).join(" "),
    attributes: { n: attributes.n || class_name.split(" ")[0].replace("frui-", ""), ...attributes },
  }, children);
}

function Card(props = {}, children = []) {
  const {
    media,
    title,
    description,
    extra,
    footer,
    class: custom_class,
    attributes = {},
    ...rest
  } = props;
  const header = title === undefined && description === undefined && extra === undefined
    ? null
    : View({ class: "frui-card-header", attributes: { n: "card-header" } }, [
        View({ class: "frui-card-titles", attributes: { n: "card-titles" } }, [
          title === undefined ? null : View({ class: "frui-card-title", attributes: { n: "card-title" } }, as_children(title)),
          description === undefined ? null : View({ class: "frui-card-description", attributes: { n: "card-description" } }, as_children(description)),
        ].filter(Boolean)),
        extra === undefined ? null : View({ class: "frui-card-extra", attributes: { n: "card-extra" } }, as_children(extra)),
      ].filter(Boolean));
  return View({
    ...rest,
    class: ["frui-card", custom_class].filter(Boolean).join(" "),
    attributes: { n: attributes.n || "card", ...attributes },
  }, [
    media === undefined ? null : View({ class: "frui-card-media", attributes: { n: "card-media" } }, as_children(media)),
    header,
    View({ class: "frui-card-body", attributes: { n: "card-body" } }, children),
    footer === undefined ? null : View({ class: "frui-card-footer", attributes: { n: "card-footer" } }, as_children(footer)),
  ].filter(Boolean));
}

function Badge(props = {}, children = []) {
  const {
    tone = "neutral",
    variant = "soft",
    count,
    max = 99,
    dot = false,
    class: custom_class,
    attributes = {},
    ...rest
  } = props;
  const numeric = count !== undefined && count !== null;
  const classes = ["frui-badge", `frui-badge-${tone}`];
  if (variant !== "soft") classes.push(`frui-badge-${variant}`);
  if (dot) classes.push("frui-badge-dot");
  else if (numeric) classes.push("frui-badge-count");
  classes.push(custom_class);
  const shown = dot
    ? []
    : numeric
      ? [Number(count) > Number(max) ? `${max}+` : String(count)]
      : children;
  return View({
    ...rest,
    class: classes.filter(Boolean).join(" "),
    attributes: { n: attributes.n || "badge", ...attributes },
  }, shown);
}

function Alert(props = {}, children = []) {
  const {
    tone = "info",
    title,
    description,
    closable = false,
    onClose,
    role,
    class: custom_class,
    attributes = {},
    ...rest
  } = props;
  const hidden_ = ref(false);
  const body = description !== undefined ? description : children;
  const close = () => {
    if (hidden_.value) return;
    hidden_.as(true);
    onClose?.();
  };
  const content = [
    title === undefined ? null : View({ class: "frui-alert-title", attributes: { n: "alert-title" } }, as_children(title)),
    as_children(body).length === 0
      ? null
      : View({ class: "frui-alert-description", attributes: { n: "alert-description" } }, as_children(body)),
    closable
      ? View({
          class: "frui-alert-close",
          attributes: { n: "alert-close", role: "button", tabindex: "0", "aria-label": "关闭" },
          onClick: close,
          onKeyDown(event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            close();
          },
        }, ["×"])
      : null,
  ].filter(Boolean);
  return Show({
    when: computed(hidden_, (value) => !value),
    ok() {
      return View({
        ...rest,
        class: ["frui-alert", `frui-alert-${tone}`, closable ? "frui-alert-closable" : null, custom_class]
          .filter(Boolean).join(" "),
        attributes: {
          n: attributes.n || "alert",
          role: role || (tone === "danger" ? "alert" : "status"),
          "aria-live": tone === "danger" ? "assertive" : "polite",
          ...attributes,
        },
      }, content);
    },
  });
}

function Separator(props = {}, children = []) {
  const {
    orientation = "horizontal",
    class: custom_class,
    attributes = {},
    ...rest
  } = props;
  const base_attributes = {
    n: attributes.n || "separator",
    role: "separator",
    "aria-orientation": orientation,
    ...attributes,
  };
  if (as_children(children).length > 0) {
    return View({
      ...rest,
      class: ["frui-separator-labeled", custom_class].filter(Boolean).join(" "),
      attributes: base_attributes,
    }, [
      View({ class: "frui-separator-line", attributes: { n: "separator-line-start", "aria-hidden": "true" } }),
      View({ class: "frui-separator-label", attributes: { n: "separator-label" } }, as_children(children)),
      View({ class: "frui-separator-line", attributes: { n: "separator-line-end", "aria-hidden": "true" } }),
    ]);
  }
  return View({
    ...rest,
    class: ["frui-separator", orientation === "vertical" ? "frui-separator-vertical" : null, custom_class]
      .filter(Boolean).join(" "),
    attributes: base_attributes,
  });
}

// ---- Checkbox / Radio ----

/** Checkbox / Radio 共用的布尔状态；View 只负责把状态同步到原生 input。 */
function ChoiceViewModel(props = {}) {
  const checked_source = props.checked;
  const checked_ = ref(Boolean(source_value(checked_source, props.defaultChecked ?? false)));
  const disabled_ = ref(Boolean(source_value(props.disabled, false)));
  const unlistens = [
    subscribe_source(checked_source, (value) => checked_.as(Boolean(value))),
    subscribe_source(props.disabled, (value) => disabled_.as(Boolean(value))),
  ];

  function set_checked(value) {
    if (disabled_.value) return false;
    const next = Boolean(value);
    if (next === checked_.value) return false;
    checked_.as(next);
    if (checked_source && typeof checked_source.as === "function") checked_source.as(next);
    else if (checked_source && typeof checked_source.set === "function") checked_source.set(next);
    props.onChange?.(next, props.value);
    return true;
  }

  return {
    state: { checked: checked_, disabled: disabled_ },
    methods: { set_checked },
    destroy() {
      dispose_all(unlistens);
      checked_.destroy?.();
      disabled_.destroy?.();
    },
  };
}

function ChoiceView(kind, props = {}, children = []) {
  const {
    checked,
    defaultChecked,
    disabled,
    value,
    name,
    label,
    onChange,
    class: custom_class,
    rootClass,
    attributes = {},
    rootAttributes = {},
    onMounted,
    onUnmounted,
    ...rest
  } = props;
  const model = ChoiceViewModel({ checked, defaultChecked, disabled, value, onChange });
  const semantic_name = attributes.n || kind;
  let element = null;

  function sync_element() {
    if (!element) return;
    element.checked = model.state.checked.value;
    element.disabled = model.state.disabled.value;
  }

  const unlistens = [
    model.state.checked.subscribe({ onChange: sync_element }),
    model.state.disabled.subscribe({ onChange: sync_element }),
  ];
  const content = label === undefined ? children : as_children(label);

  return View({
    as: "label",
    class: ["frui-choice", `frui-${kind}`, rootClass].filter(Boolean).join(" "),
    attributes: {
      n: rootAttributes.n || `${semantic_name}-field`,
      "aria-disabled": computed(model.state.disabled, (state) => state ? "true" : "false"),
      ...rootAttributes,
    },
    onUnmounted() {
      dispose_all(unlistens);
      model.destroy();
      onUnmounted?.();
    },
  }, [
    View({
      ...rest,
      as: "input",
      class: ["frui-choice-input", `frui-${kind}-input`, custom_class].filter(Boolean).join(" "),
      attributes: {
        n: semantic_name,
        ...attributes,
        type: kind,
        name,
        value,
      },
      onChange(event) {
        model.methods.set_checked(Boolean(event.target?.checked));
      },
      onMounted(event) {
        element = event?.target?.get$elm ? event.target.get$elm() : event?.target ?? null;
        sync_element();
        onMounted?.(event);
      },
    }),
    content.length === 0
      ? null
      : View({ class: "frui-choice-label", attributes: { n: `${semantic_name}-label` } }, content),
  ].filter(Boolean));
}

function Checkbox(props = {}, children = []) {
  return ChoiceView("checkbox", props, children);
}

function Radio(props = {}, children = []) {
  return ChoiceView("radio", props, children);
}

// ---- Switch ----

/**
 * 开关。状态交给 `vm.SwitchCore`，但轨道节点是**自己渲染**的——
 * Timeless 的 `ui.SwitchPrimitive.Root` 有两处会直接把开关做坏（都已实测）：
 *   1. 挂载期它把布尔属性 `String()` 化：`disabled: false` 落成 `disabled="false"`，
 *      而 `<button>` 只要出现 `disabled` 属性就真的禁用 —— 页面一加载所有开关都点不动；
 *   2. 它的 `dataset` 挂载期不写、patch 期又漏掉 `data-` 前缀（写成 `checked=""`），
 *      于是 `data-checked` 永远停在初始值，点开关视觉状态不变。
 * 自己写反而更短，而且走的是标准 ARIA 模式：`<div role="switch" tabindex="0">` +
 * `aria-checked` 字符串（`"true"/"false"`，挂载与 patch 都正确）+ `aria-disabled`，
 * 禁用**不用 `disabled` 属性**（`toggle()` 里自己挡），因为 `<div>` 上的 `disabled` 本来
 * 就没有语义、只会把「属性该不该存在」这件事搞复杂。视觉状态由 CSS 读 `[aria-checked="true"]`。
 * @param {object} props `checked` / `disabled` 可以是 ref；`label` 是纯文本，**不绑点击**
 *   （避免与轨道自身的 onClick 双触发），需要「点文字也能切」请调用方包一层自行防冒泡。
 */
function Switch(props = {}) {
  const {
    checked,
    disabled,
    label,
    size = "default",
    onChange,
    class: custom_class,
    attributes = {},
    onUnmounted,
    ...rest
  } = props;
  const store = vm.SwitchCore({
    defaultValue: Boolean(source_value(checked, props.defaultChecked ?? false)),
    disabled: Boolean(source_value(disabled, false)),
  });
  const state_ = refobj(store.state);
  const unlistens = [
    store.onStateChange((state) => state_.as(state)),
    store.onChange((value) => onChange?.(value)),
    subscribe_source(checked, (value) => {
      if (Boolean(value) !== Boolean(store.state.checked)) store.setValue(Boolean(value));
    }),
    subscribe_source(disabled, (value) => value ? store.disable() : store.enable()),
  ];
  const is_on_ = computed(state_, (state) => Boolean(state.checked));
  const is_disabled_ = computed(state_, (state) => Boolean(state.disabled));

  function toggle() {
    if (is_disabled_.value) return;
    store.setValue(!store.state.checked);
  }

  const root_node = View({
    ...rest,
    class: ["frui-switch", size !== "default" ? `frui-switch-${size}` : null, custom_class].filter(Boolean).join(" "),
    attributes: {
      role: "switch",
      tabindex: "0",
      "aria-checked": computed(is_on_, (on) => (on ? "true" : "false")),
      "aria-disabled": computed(is_disabled_, (value) => (value ? "true" : "false")),
    },
    onClick() { toggle(); },
    onKeyDown(event) {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      toggle();
    },
    onUnmounted() {
      dispose_all(unlistens);
      state_.destroy?.();
      is_on_.destroy?.();
      is_disabled_.destroy?.();
      onUnmounted?.();
    },
  }, [View({ class: "frui-switch-thumb", attributes: { n: "switch-thumb", "aria-hidden": "true" } })]);
  if (label === undefined) {
    return View({ class: "frui-switch-field", attributes: { n: attributes.n || "switch" } }, [root_node]);
  }
  return View({ class: "frui-switch-field", attributes: { n: attributes.n || "switch" } }, [
    root_node,
    View({ class: "frui-switch-label", attributes: { n: "switch-label" } }, as_children(label)),
  ]);
}

// ---- Avatar ----

const avatar_hues = [8, 32, 152, 200, 262, 316];

/** 由名字稳定映射到一个色相（首字底色）。 */
function avatar_hue(name) {
  const text = String(name || "");
  if (text === "") return avatar_hues[0];
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return avatar_hues[hash % avatar_hues.length];
}

function Avatar(props = {}) {
  const {
    src,
    name = "",
    size = "default",
    shape = "circle",
    class: custom_class,
    attributes = {},
    onUnmounted,
    ...rest
  } = props;
  const failed_ = ref(false);
  const text = String(source_value(name) ?? "").trim();
  const label = text || "用户";
  const unlistens = [];
  if (src && typeof src === "object" && src.__is_ref && typeof src.subscribe === "function") {
    unlistens.push(src.subscribe({ onChange: () => failed_.as(false) }));
  }
  const has_image_ = computed(failed_, (failed) => Boolean(String(source_value(src) ?? "").trim()) && !failed);
  const style = { "--frui-avatar-hue": String(avatar_hue(text)), ...(rest.style || {}) };
  return View({
    ...rest,
    class: [
      "frui-avatar",
      shape === "square" ? "frui-avatar-square" : null,
      size !== "default" ? `frui-avatar-${size}` : null,
      custom_class,
    ].filter(Boolean).join(" "),
    style,
    attributes: { n: attributes.n || "avatar", role: "img", "aria-label": label, ...attributes },
    onUnmounted() {
      dispose_all(unlistens);
      failed_.destroy?.();
      has_image_.destroy?.();
      onUnmounted?.();
    },
  }, [
    Show({
      when: has_image_,
      ok() {
        return Img({
          class: "frui-avatar-image",
          src,
          attributes: { n: "avatar-image", alt: "" },
          onError() { failed_.as(true); },
        });
      },
      else() {
        return View({ class: "frui-avatar-initial", attributes: { n: "avatar-initial", "aria-hidden": "true" } }, [
          label.slice(0, 1).toUpperCase(),
        ]);
      },
    }),
  ]);
}

// ---- Tabs ----
// 刻意不接 vm.TabHeaderCore：它的滑动指示条要测量每个 tab 的 getBoundingClientRect，
// 在预览 / 无布局环境里是额外风险；Tabs 的本质只是「当前选中项」。

function Tabs(props = {}) {
  const {
    items = [],
    value,
    onChange,
    class: custom_class,
    attributes = {},
    onUnmounted,
    ...rest
  } = props;
  const fallback = items.length > 0 ? items[0].id : "";
  const current_ = ref(source_value(value, fallback) ?? fallback);
  const unlistens = [
    subscribe_source(value, (next) => { if (next !== current_.value) current_.as(next); }),
  ];

  function select(id) {
    if (id === current_.value) return;
    current_.as(id);
    if (value && typeof value.as === "function") value.as(id);
    else if (value && typeof value.set === "function") value.set(id);
    onChange?.(id);
  }

  const tabs = items.map((item) => {
    const active_ = computed(current_, (id) => id === item.id);
    return View({
      class: computed(active_, (active) => active ? "frui-tabs-tab frui-tabs-tab-active" : "frui-tabs-tab"),
      attributes: {
        n: `tab-${item.id}`,
        role: "tab",
        tabindex: "0",
        "aria-selected": computed(active_, (active) => active ? "true" : "false"),
      },
      onClick() { select(item.id); },
      onKeyDown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        select(item.id);
      },
    }, as_children(item.label));
  });

  // 每个面板各自 Show：Show 只在「真值变假值」时重建，用整块切换会拿不到内容更新。
  const panels = items.map((item) => Show({
    when: computed(current_, (id) => id === item.id),
    ok() {
      return View({ class: "frui-tabs-panel", attributes: { n: `tabs-panel-${item.id}`, role: "tabpanel" } }, as_children(item.content));
    },
  }));

  return View({
    ...rest,
    class: ["frui-tabs", custom_class].filter(Boolean).join(" "),
    attributes: { n: attributes.n || "tabs", ...attributes },
    onUnmounted() {
      dispose_all(unlistens);
      current_.destroy?.();
      onUnmounted?.();
    },
  }, [
    View({ class: "frui-tabs-list", attributes: { n: "tabs-list", role: "tablist" } }, tabs),
    ...panels,
  ]);
}

// ---- Tree ----

const tree_classes = {
  root: "frui-tree",
  scroll: "frui-tree-scroll",
  row: "frui-tree-row",
  rowSelected: "selected",
  rowDisabled: "disabled",
  /** 拖拽：被拖起的原位影子 + 落点是「移入本目录」。名字沿用 .is-* 契约（见 THEME_PACKAGE_GUIDE §4.6）。 */
  rowLifted: "is-lifted",
  rowInto: "is-drop-into",
  /** 落点指示线：line 是线本体，lineBefore/After 只在对应落点时出现。 */
  line: "frui-tree-line",
  lineBefore: "is-before",
  lineAfter: "is-after",
  /** 跟手浮层（Portal 渲染在树外）。 */
  ghost: "frui-tree-ghost",
  ghostTitle: "frui-tree-ghost-title",
  caret: "frui-tree-caret",
  caretIcon: "frui-tree-caret-icon",
  icon: "frui-tree-icon",
  title: "frui-tree-title",
  meta: "frui-tree-meta",
  /** 层级引导线：祖先缩进槽里的竖线，位置由 TreePrimitive 算好（内联 left）。 */
  guide: "frui-tree-guide",
  empty: "frui-tree-empty",
  hint: "frui-tree-hint",
};

/** Timeless Tree 的 FindRSS 主题入口；树状态与虚拟列表完全复用 TreeCore/TreePrimitive。 */
function Tree(props = {}) {
  const {
    class: custom_class,
    classes,
    itemHeight = 46,
    indent = 18,
    // 跟手浮层 = 被拖行的整行快照（头像 / 未读角标 / 缩进都跟着走，宽高与原行一致）。
    // 本库的行业务字段多（头像、未读、错误态），紧凑卡片表达不出来，所以默认打开。
    ghostRow = true,
    ...rest
  } = props;
  return TreePrimitive.Root({
    ...rest,
    itemHeight,
    indent,
    ghostRow,
    classes: {
      ...tree_classes,
      ...classes,
      root: [tree_classes.root, custom_class, classes?.root].filter(Boolean).join(" "),
    },
  });
}

/** 自定义业务行只填槽位，不重写 Timeless Tree 的行交互。 */
function TreeRow(props = {}) {
  return TreePrimitive.Row({
    ...props,
    classes: { ...tree_classes, ...(props.classes || {}) },
  });
}
Tree.Row = TreeRow;

export {
  Alert, Avatar, Badge, Button, ButtonViewModel, Card, Checkbox, ChoiceViewModel, Input, InputViewModel,
  Radio, Separator, Switch, Tabs, Tree,
  Textarea,
  Alert as FRAlert, Badge as FRBadge, Button as FRButton, Card as FRCard,
  Input as FRInput, Separator as FRSeparator,
  // 供 findrssui-layer.ts 复用的内部工具（不经 src/index.ts 暴露）。
  Fragment, as_children, dispose_all, normalize_autocomplete, source_value, subscribe_source,
};
