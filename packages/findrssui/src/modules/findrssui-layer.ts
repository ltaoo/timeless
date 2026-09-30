// ⚠️ 本文件是从 findrss-reader 逐字迁出的**未标注类型的 JS**（原路径 frontend/src/components/），
// 这一轮只做「搬过来 + 换模块说明符 + 换样式表归属」，没有顺手补类型：原文件每个函数都是
// `function X(props = {})`，逐条标注等于把文件重写一遍，风险远大于收益。
// `@ts-nocheck` 让构建输出保持干净（否则这里会有上百条 TS2339）；代价是声明产物退化成宽泛签名，
// 使用方的类型提示因此有限。补类型是独立的一轮工作。
// @ts-nocheck
// 需要 Portal / 全局宿主 / 真实视口测量的三个组件：Dialog、DropdownMenu、Toast。
// 与 findrssui.js 同属组件库，只是这三者拿不到「纯展示」的定位：
//   - Dialog 依赖 Timeless 的 DialogCore + DismissableLayerCore（外部点击与层级管理）；
//   - DropdownMenu 需要真实视口坐标，自实现比接 MenuCore 的 popper 链更可控（见文件末尾说明）；
//   - Toast 是模块级队列 + 一个宿主组件，本质上是「全局状态上的渲染」。
import { For, Fragment, Show, View, computed, ref, refobj, ui, vm, type TimelessElement } from "@timeless/timeless";
import { as_children, dispose_all, source_value, subscribe_source } from "./findrssui";

// ---- Dialog ----

/**
 * 模态对话框。`open` 受控（ref 或普通值），`onClose` 在用户主动关闭（X / 遮罩 / Esc）时触发一次。
 *
 * 两个「能不能关」是分开的，与 Radix 一致：
 *   - `closable`：是否渲染右上角 X（默认 true）；
 *   - `maskClosable`：点遮罩 / 按 Esc 是否关闭（默认 true，映射到 DialogCore 的 `closeable`）。
 * Timeless 的 DismissableLayerCore 只监听 pointerdown（LayerManager 里没有键盘分支），
 * 所以 Esc 由本组件自己挂 document keydown 补上。
 *
 * 定位全在 CSS：遮罩 `position: fixed; inset: 0`，内容 `position: fixed` 居中——
 * 这与 Timeless weui 的 `.weui-dialog` 是同一套做法，不要改回 flex 居中
 * （Content 与 Overlay 是兄弟节点，不是父子，grid/flex 居中无从生效）。
 */
function Dialog(props = {}, children = []) {
  const {
    open,
    title,
    description,
    footer,
    closable = true,
    maskClosable = true,
    mask = true,
    class: custom_class,
    attributes = {},
    onClose,
    onUnmounted,
    ...rest
  } = props;

  const controlled = open !== undefined && (typeof open === "object" || typeof open === "boolean");
  // DialogCore 是 ES class（`xi=class extends _t`），必须 `new`——用 `vm.ButtonCore`/`vm.InputCore`
  // 的写法套过来会抛 "Class constructor xi cannot be invoked without 'new'"。
  // SwitchCore 是普通工厂函数（`function Sl(e)`），照旧不加 `new`。
  const store = new vm.DialogCore({
    open: Boolean(source_value(open, false)),
    title: source_value(title),
    footer: footer !== undefined,
    closeable: maskClosable !== false,
    mask: mask !== false,
  });
  const state_ = refobj(store.state);
  // notified：`onClose` 每次「开 → 关」只回调一次。DialogCore 的 StateChange 会因
  // enter/visible/exit 反复触发，必须自己去重，否则一次关闭能回调好几次。
  let notified = false;
  let syncing = false;

  const unlistens = [
    store.onStateChange((state) => {
      state_.as(state);
      if (state.open) {
        notified = false;
        return;
      }
      if (notified || syncing) return;
      notified = true;
      onClose?.();
    }),
  ];
  if (controlled) {
    unlistens.push(subscribe_source(open, (value) => {
      const next = Boolean(value);
      if (next === Boolean(store.state.open)) return;
      if (next) {
        store.show();
        return;
      }
      // 外部把 open 置回 false：由调用方发起的关闭，不再回头调 onClose。
      syncing = true;
      store.hide();
      syncing = false;
    }));
  }

  /** 用户主动关闭：收起内部 state，通知交给上面的 StateChange 分支统一发。 */
  function request_close() {
    store.hide();
  }

  function handle_keydown(event) {
    if (event.key !== "Escape" || !maskClosable) return;
    if (!store.state.open) return;
    event.stopPropagation();
    request_close();
  }
  if (typeof document !== "undefined") document.addEventListener("keydown", handle_keydown);

  const header = title === undefined && description === undefined
    ? null
    : ui.DialogPrimitive.Header({ class: "frui-dialog-header", attributes: { n: "dialog-header" } }, [
        ui.DialogPrimitive.Title({ class: "frui-dialog-title", attributes: { n: "dialog-title" } }, as_children(title)),
        description === undefined
          ? null
          : View({ class: "frui-dialog-description", attributes: { n: "dialog-description" } }, as_children(description)),
      ].filter(Boolean));

  return ui.DialogPrimitive.Root({
    store,
    onUnmounted() {
      if (typeof document !== "undefined") document.removeEventListener("keydown", handle_keydown);
      dispose_all(unlistens);
      store.destroy?.();
      store.presence?.destroy?.();
      state_.destroy?.();
      onUnmounted?.();
    },
  }, [
    mask
      ? ui.DialogPrimitive.Overlay({
          store,
          class: "frui-dialog-overlay",
          attributes: { n: "dialog-overlay", "aria-hidden": "true" },
        })
      : null,
    ui.DialogPrimitive.Content({
      store,
      class: ["frui-dialog-content", custom_class].filter(Boolean).join(" "),
      attributes: { n: attributes.n || "dialog", role: "dialog", "aria-modal": "true", tabindex: "-1", ...attributes },
      onMounted(event) {
        // Esc 挂在 document 上，焦点仍留在触发元素上时也能生效；主动把焦点收进来更好。
        const elm = event?.target?.get$elm ? event.target.get$elm() : null;
        elm?.focus?.();
      },
    }, [
      header,
      View({ class: "frui-dialog-body", attributes: { n: "dialog-body" } }, as_children(children)),
      footer === undefined
        ? null
        : ui.DialogPrimitive.Footer({ class: "frui-dialog-footer", attributes: { n: "dialog-footer" } }, as_children(footer)),
      closable
        ? View({
            class: "frui-dialog-close",
            attributes: { n: "dialog-close", role: "button", tabindex: "0", "aria-label": "关闭" },
            onClick: request_close,
            onKeyDown(event) {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              request_close();
            },
          }, ["×"])
        : null,
    ].filter(Boolean)),
  ].filter(Boolean));
}

// ---- DropdownMenu ----

/**
 * 下拉菜单。**自实现**，刻意不接 `vm.DropdownMenuCore`：
 * 那套 core 把开合、定位、子菜单都挂在 `MenuCore` 的 popper + Presence 上（Trigger 靠
 * `get$children()` 找第一个 view 当 reference），在无 hover 的桌面预览与静态截图环境里
 * 契约不成立、定位还依赖平台适配。这里只需要「一个按钮 + 一个贴边浮层」。
 *
 * 已知取舍（catalog 里也如实标注）：无子菜单、无方向键导航、无焦点陷阱。
 * @param {object} props `trigger` 节点；`items` 形如 `[{ id, label, icon?, disabled?, danger?, onClick }]`，
 *   传 `{ type: "separator" }` 即渲染一条分隔线；`align` = start/end，`side` = bottom/top。
 */
function DropdownMenu(props = {}): TimelessElement {
  const {
    trigger,
    items = [],
    align = "start",
    side = "bottom",
    class: custom_class,
    attributes = {},
    onOpenChange,
    onUnmounted,
    ...rest
  } = props;
  const open_ = ref(false);
  // 四个方向全给值（不用的写 "auto"）：Timeless 的 style ref 是按 Object.keys 逐条应用的，
  // 少给键会把上一轮的定位残留下来（例如 align 从 start 换到 end 后 left 还在）。
  const placement_ = ref({ top: "auto", bottom: "auto", left: "auto", right: "auto" });
  let trigger_elm = null;

  function place() {
    if (!trigger_elm || typeof window === "undefined") {
      return { top: "auto", bottom: "auto", left: "auto", right: "auto" };
    }
    const rect = trigger_elm.getBoundingClientRect();
    const next = { top: "auto", bottom: "auto", left: "auto", right: "auto" };
    if (side === "top") next.bottom = `${window.innerHeight - rect.top + 4}px`;
    else next.top = `${rect.bottom + 4}px`;
    if (align === "end") next.right = `${window.innerWidth - rect.right}px`;
    else next.left = `${rect.left}px`;
    return next;
  }

  function set_open(next) {
    const value = Boolean(next);
    if (value === open_.value) return;
    if (value) placement_.as(place());
    open_.as(value);
    onOpenChange?.(value);
  }

  function make_item(item) {
    if (item.type === "separator") {
      return View({
        class: "frui-dropdown-separator",
        attributes: { n: "dropdown-separator", role: "separator" },
      });
    }
    const disabled = Boolean(source_value(item.disabled, false));
    const item_attributes = { n: `dropdown-item-${item.id}`, role: "menuitem", tabindex: disabled ? "-1" : "0" };
    if (disabled) item_attributes["aria-disabled"] = "true";
    const run = () => {
      if (disabled) return;
      set_open(false);
      item.onClick?.(item.id);
    };
    return View({
      class: [
        "frui-dropdown-item",
        disabled ? "frui-dropdown-item-disabled" : null,
        item.danger ? "frui-dropdown-item-danger" : null,
      ].filter(Boolean).join(" "),
      attributes: item_attributes,
      onClick: run,
      onKeyDown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        run();
      },
    }, [
      item.icon === undefined
        ? null
        : View({ class: "frui-dropdown-item-icon", attributes: { n: "dropdown-item-icon", "aria-hidden": "true" } }, as_children(item.icon)),
      View({ class: "frui-dropdown-item-label", attributes: { n: "dropdown-item-label" } }, as_children(item.label)),
    ].filter(Boolean));
  }

  return Fragment({
    onUnmounted() {
      open_.destroy?.();
      placement_.destroy?.();
      onUnmounted?.();
    },
  }, [
    View({
      ...rest,
      class: ["frui-dropdown-trigger", custom_class].filter(Boolean).join(" "),
      attributes: {
        n: attributes.n || "dropdown-trigger",
        "aria-haspopup": "menu",
        "aria-expanded": computed(open_, (value) => value ? "true" : "false"),
        ...attributes,
      },
      onMounted(event) {
        trigger_elm = event?.target?.get$elm ? event.target.get$elm() : event?.target ?? null;
      },
      onClick() { set_open(!open_.value); },
      onKeyDown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        set_open(!open_.value);
      },
    }, as_children(trigger)),
    Show({
      when: open_,
      ok() {
        return [
          View({
            class: "frui-dropdown-mask",
            attributes: { n: "dropdown-mask" },
            onClick() { set_open(false); },
          }),
          View({
            class: "frui-dropdown-menu",
            style: placement_,
            attributes: { n: "dropdown-menu", role: "menu" },
          }, items.map(make_item)),
        ];
      },
    }),
  ]);
}

// ---- Toast ----

// 模块级队列：Timeless 没有 hooks，宿主组件卸载后计时器也要能继续跑（Toast.show 在页面
// 别处被调用），所以状态必须活在模块作用域而不是某个 view 里。
const toast_items_ = ref([]);
let toast_seq = 0;

function find_toast(id) {
  return toast_items_.value.find((item) => item.id === id) || null;
}

function remove_toast(id) {
  const item = find_toast(id);
  if (!item) return;
  if (item.timer) clearTimeout(item.timer);
  toast_items_.as(toast_items_.value.filter((entry) => entry.id !== id));
}

function push_toast(message, options = {}) {
  const id = `toast-${++toast_seq}`;
  const duration = options.duration === undefined ? 3200 : Number(options.duration) || 0;
  const item = {
    id,
    message,
    type: options.type || "info",
    duration,
    remaining: duration,
    started_at: Date.now(),
    timer: null,
  };
  toast_items_.as([...toast_items_.value, item]);
  schedule(item);
  return id;
}

function schedule(item) {
  if (item.duration <= 0) return;
  item.started_at = Date.now();
  item.timer = setTimeout(() => remove_toast(item.id), Math.max(item.remaining, 0));
}

/** 鼠标悬停时暂停倒计时（否则「想看清」和「自动消失」会打架）。 */
function pause_toast(id) {
  const item = find_toast(id);
  if (!item || item.timer === null) return;
  clearTimeout(item.timer);
  item.timer = null;
  item.remaining -= Date.now() - item.started_at;
}

function resume_toast(id) {
  const item = find_toast(id);
  if (!item || item.timer !== null) return;
  schedule(item);
}

/**
 * Toast 宿主。**生产页面没有挂载它**（`pages/**` 本次零改动），所以 `Toast.show()` 目前
 * 只在组件库预览里可见——挂一行 `<Toast/>` 到页面根部即生效，属后续接线。
 * `duration <= 0` 表示不自动消失。
 */
function Toast(props = {}) {
  const { class: custom_class, attributes = {}, ...rest } = props;
  return View({
    ...rest,
    class: ["frui-toast-viewport", custom_class].filter(Boolean).join(" "),
    attributes: { n: attributes.n || "toast-viewport", role: "region", "aria-live": "polite", "aria-label": "通知", ...attributes },
  }, [
    For({
      key: "id",
      each: toast_items_,
      render(item_value) {
        const item = source_value(item_value);
        return View({
          class: `frui-toast frui-toast-${item.type}`,
          attributes: { n: `toast-${item.id}`, role: "status" },
          onMouseEnter() { pause_toast(item.id); },
          onMouseLeave() { resume_toast(item.id); },
        }, [
          View({ class: "frui-toast-message", attributes: { n: "toast-message" } }, [String(item.message ?? "")]),
          View({
            class: "frui-toast-close",
            attributes: { n: "toast-close", role: "button", tabindex: "0", "aria-label": "关闭" },
            onClick() { remove_toast(item.id); },
            onKeyDown(event) {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              remove_toast(item.id);
            },
          }, ["×"]),
        ]);
      },
    }),
  ]);
}

Toast.show = (message, options) => push_toast(message, options);
Toast.success = (message, options = {}) => push_toast(message, { ...options, type: "success" });
Toast.error = (message, options = {}) => push_toast(message, { ...options, type: "error" });
Toast.warning = (message, options = {}) => push_toast(message, { ...options, type: "warning" });
Toast.info = (message, options = {}) => push_toast(message, { ...options, type: "info" });
Toast.dismiss = (id) => remove_toast(id);
Toast.clear = () => {
  for (const item of toast_items_.value) if (item.timer) clearTimeout(item.timer);
  toast_items_.as([]);
};

export { Dialog, DropdownMenu, Toast };
