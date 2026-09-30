/**
 * @file 设计规范（WeUI）——只读规范表 + 实时调参孤岛。
 *
 * 与 shadcn / bootstrap / material / fluent / animal 的同名页面同源，但 weui 是
 * **全局库**且有一套自己的主题派发方式，故按本库实际情况强制偏离：
 *
 *  · 取值根元素是 `document.body`，**不是** `<html>`：weui 的 `--weui-*` 声明在
 *    `body,.wx-root,page` 上（`style/base/theme/index.less`），读 `documentElement`
 *    只会得到空串。
 *  · 亮色选择器是**逗号组** `body,.wx-root,page`，精确 `===` 永远匹配不上 ——
 *    必须按 `,` 切分后逐项比对。
 *  · 本库没有第二层语义别名（`--weui-*` 就是组件直接消费的那一层），也没有
 *    calc 派生的圆角阶梯，所以没有 `LIB_KEY` / `ALIAS_SELECTOR` / `COMPANION_TOKENS`，
 *    规范表用「亮色声明 / 暗色声明」双声明列。
 *  · `app.setTheme()` 只写 `<html data-theme>`，而 weui 的调色板挂在 `<body
 *    data-weui-theme>` —— 暗色开关必须同时驱动两处，否则页面壳变了、组件没变。
 *  · 关怀模式（care）不额外开两列声明：4 套预设的差异用「当前」列已经能回答，
 *    多两列会把表宽翻倍。用一个开关切 `body[data-weui-mode]` 即可。
 *  · 孤岛是 `<body>` 的普通后代，覆盖只以**内联自定义属性**写在孤岛元素上，
 *    永不写到 `<body>` / `:root`，因此只影响孤岛子树。
 *  · 孤岛 style 必须是**整对象 Ref**：宿主层把 style 序列化成 cssText 后整体赋值，
 *    逐 key 的 `style[k] = v` 对自定义属性不生效。只写「被改过的」token。
 *
 * 旋钮一律用裸的 primitive `<input>`（`Timeless.Input`）：weui 自己的 `Input`
 * 会在外面套一层 weui chrome（allowClear / 图标），套在 range / color 上不成样子。
 */
import { app } from "@/store/index.js";

/* ================================================================== *
 * 1. 本 app 专属部分
 * ================================================================== */
const LIB_LABEL = "WeUI";
/** weui Button 只有 primary | default | warn | text，没有 outline。 */
const OUTLINE_VARIANT = "default";
/** weui 暗色声明挂在 `body[data-weui-theme='dark']`（care-dark 也是这个前缀）。 */
const DARK_SELECTOR_RE = /\[data-weui-theme=["']?dark/;
/** 亮色声明的选择器组（逗号组里的每一项）。 */
const LIGHT_SELECTORS = ["body", ".wx-root", "page"];

/** 逗号组里每一项都是亮色挂载点才算亮色声明。 */
function isLightSelector(text) {
  const parts = String(text)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 && parts.every((p) => LIGHT_SELECTORS.includes(p));
}

/** 预览孤岛：只用 weui 真实导出的组件（本库无 Slider / Progress / Alert）。 */
function PreviewIsland() {
  const button = (variant, label) =>
    Button({ store: new Timeless.vm.ButtonCore({ variant }) }, [label]);

  return View({ class: "weui-spec-preview" }, [
    View({ class: "weui-spec-preview-row" }, [
      button("primary", "Primary"),
      button("default", "Default"),
      button("warn", "Warn"),
      button("text", "Text"),
      Badge({}, ["Badge"]),
      Badge({ variant: "secondary" }, ["Secondary"]),
    ]),
    View({ class: "weui-spec-preview-row" }, [
      View({ class: "weui-spec-preview-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "输入一些文字",
            allowClear: true,
          }),
        }),
      ]),
      Switch({ store: Timeless.vm.SwitchCore({ defaultValue: true }) }),
      Checkbox({ store: new Timeless.vm.CheckboxCore({ defaultValue: true }) }),
      Toggle({ store: Timeless.vm.SwitchCore({ defaultValue: true }) }),
      View({ style: { display: "flex", "align-items": "center", height: "24px" } }, [
        Separator({ orientation: "vertical" }),
      ]),
    ]),
    View({ class: "weui-spec-preview-row" }, [
      View({ class: "weui-spec-preview-card" }, [
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Card title"]),
            CardDescription({}, ["支持性描述文字，用弱化前景色。"]),
          ]),
          CardContent({}, [
            View({}, ["卡片正文使用 --weui-FG-0 / --weui-BG-2 / --weui-SEPARATOR-1。"]),
          ]),
          CardFooter({}, [button("primary", "Action")]),
        ]),
      ]),
      View({ style: { flex: "1", "min-width": "240px" } }, [
        Tabs({
          store: new Timeless.vm.TabHeaderCore({
            key: "spec-tab",
            options: [
              { value: "a", label: "选项一" },
              { value: "b", label: "选项二" },
            ],
          }),
          items: [
            {
              value: "a",
              label: "选项一",
              content: [
                View(
                  { style: { padding: "16px", color: "var(--weui-FG-1)" } },
                  ["这是选项一的内容"],
                ),
              ],
            },
            {
              value: "b",
              label: "选项二",
              content: [
                View(
                  { style: { padding: "16px", color: "var(--weui-FG-1)" } },
                  ["这是选项二的内容"],
                ),
              ],
            },
          ],
        }),
      ]),
    ]),
    View({ class: "weui-spec-preview-row" }, [
      Skeleton({ style: { width: "120px", height: "14px" } }),
      Skeleton({ style: { width: "80px", height: "14px" } }),
    ]),
  ]);
}
/* ==================== 本 app 专属部分结束 ==================== */

/* ------------------------------------------------------------------ *
 * 2. token 目录（候选清单；真实声明与否启动时读 DOM 判定，缺则隐藏）
 *    来源：packages/weui/src/style/base/theme/vars/light.less
 * ------------------------------------------------------------------ */
const TOKEN_GROUPS = [
  {
    key: "color",
    title: "色板",
    hint: "单色别名是 -100 档的简写，组件直接消费这一层，改这里等于换肤；暗色另有一套声明。",
    specimen: "swatch",
    tokens: [
      { name: "--weui-BRAND", label: "品牌绿", edit: true },
      { name: "--weui-RED", label: "红", edit: true },
      { name: "--weui-ORANGERED", label: "橙红", edit: true },
      { name: "--weui-ORANGE", label: "橙", edit: true },
      { name: "--weui-YELLOW", label: "黄", edit: true },
      { name: "--weui-GREEN", label: "绿", edit: true },
      { name: "--weui-LIGHTGREEN", label: "浅绿", edit: true },
      { name: "--weui-TEXTGREEN", label: "文字绿", edit: true },
      { name: "--weui-BLUE", label: "蓝", edit: true },
      { name: "--weui-INDIGO", label: "靛蓝", edit: true },
      { name: "--weui-PURPLE", label: "紫", edit: true },
      { name: "--weui-LINK", label: "链接色", edit: true },
    ],
  },
  {
    key: "bg",
    title: "背景",
    hint: "层级底：0 最外、2 / 5 最内。BG-4 是深色浮层底（Toast / 遮罩上的卡片）。",
    specimen: "swatch",
    tokens: [
      { name: "--weui-BG", label: "背景基准", edit: true },
      { name: "--weui-BG-0", label: "层级 0（最外）", edit: true },
      { name: "--weui-BG-1", label: "层级 1", edit: true },
      { name: "--weui-BG-2", label: "层级 2（最内）", edit: true },
      { name: "--weui-BG-3", label: "层级 3", edit: true },
      { name: "--weui-BG-4", label: "层级 4（深）", edit: true },
      { name: "--weui-BG-5", label: "层级 5", edit: true },
      { name: "--weui-WHITE", label: "纯白", edit: true },
    ],
  },
  {
    key: "fg",
    title: "前景",
    hint: "FG-0 最强 → FG-5 最弱。FG-HALF / FG-0_5 是半强度档。",
    specimen: "swatch",
    tokens: [
      { name: "--weui-FG", label: "前景基准", edit: true },
      { name: "--weui-FG-0", label: "最强", edit: true },
      { name: "--weui-FG-0_5", label: "半档", edit: true },
      { name: "--weui-FG-1", label: "次级", edit: true },
      { name: "--weui-FG-2", label: "三级", edit: true },
      { name: "--weui-FG-3", label: "极弱", edit: true },
      { name: "--weui-FG-4", label: "更弱", edit: true },
      { name: "--weui-FG-5", label: "最弱", edit: true },
      { name: "--weui-FG-HALF", label: "半强度", edit: true },
    ],
  },
  {
    key: "border",
    title: "描边 / 遮罩",
    hint: "分隔线、次级底、遮罩与状态层。",
    specimen: "swatch",
    tokens: [
      { name: "--weui-SEPARATOR-0", label: "分隔线 0", edit: true },
      { name: "--weui-SEPARATOR-1", label: "分隔线 1", edit: true },
      { name: "--weui-SECONDARY-BG", label: "次级底", edit: true },
      { name: "--weui-OVERLAY", label: "遮罩", edit: true },
      { name: "--weui-STATELAYER-HOVERED", label: "悬停层", edit: true },
      { name: "--weui-STATELAYER-PRESSED", label: "按压层", edit: true },
    ],
  },
  {
    key: "component",
    title: "组件 token",
    hint: "跨组件共享的组件级 token（定义在 style/base/variable/*.less 的 body 作用域）。",
    specimen: "swatch",
    tokens: [
      { name: "--weui-BTN-ACTIVE-MASK", label: "按钮按压遮罩", edit: true },
      { name: "--weui-BTN-DEFAULT-ACTIVE-BG", label: "默认按钮按压底", edit: true },
      { name: "--weui-DIALOG-LINE-COLOR", label: "对话框分隔线", edit: true },
    ],
  },
  {
    key: "size",
    title: "尺寸",
    hint: "按钮高度三档。**无单位**（48 / 40 / 32），在 Less 里配合 calc 做算术；组件直接当长度用时声明会被丢弃 —— 见下方缺口。",
    specimen: "height",
    tokens: [
      // 无单位 → 只读展示，不给旋钮（滑块量程没有意义）。
      { name: "--weui-BTN-HEIGHT", label: "按钮高（大）", edit: false },
      { name: "--weui-BTN-HEIGHT-MEDIUM", label: "按钮高（中）", edit: false },
      { name: "--weui-BTN-HEIGHT-SMALL", label: "按钮高（小）", edit: false },
    ],
  },
  {
    key: "radius",
    title: "圆角",
    hint: "本库没有可覆盖的圆角 token；按钮圆角引用的是从未声明的 --weui-BTN-RADIUS。",
    specimen: "radius",
    tokens: [],
  },
  {
    key: "space",
    title: "间距",
    hint: "本库没有间距 token；单元格内边距引用的是从未声明的 --weui-CELL-GAP。",
    specimen: "spacing",
    tokens: [],
  },
  {
    key: "type",
    title: "字阶",
    hint: "本库没有字阶 token；组件引用的是从未声明的 --weui-FONT-SIZE* 系列。",
    specimen: "type",
    tokens: [],
  },
  {
    key: "shadow",
    title: "阴影",
    hint: "本库未使用 box-shadow 阴影 token。",
    specimen: "shadow",
    tokens: [],
  },
  {
    key: "motion",
    title: "动效",
    hint: "本库未声明动效时长 token（transition 时长写在组件内联样式里）。",
    specimen: "motion",
    tokens: [],
  },
];

/** 被引用但从未声明的变量 —— 如实标注，不偷偷补 CSS（补了会改变 weui 组件视觉）。 */
const KNOWN_GAPS = [
  { name: "--weui-FONT-SIZE", note: "button / input / textarea / select / card / tabs / dialog" },
  { name: "--weui-FONT-SIZE-SM", note: "button / select / card / dialog" },
  { name: "--weui-FONT-SIZE-XS", note: "select / badge" },
  { name: "--weui-BTN-RADIUS", note: "button —— 圆角声明失效，按钮目前是直角" },
  { name: "--weui-CELL-GAP", note: "select / sheet / card —— 内边距声明失效" },
];

/* ------------------------------------------------------------------ *
 * 3. 取值 / 解析工具
 * ------------------------------------------------------------------ */

/**
 * 读 body 上某个 token 的当前计算值（var() 链已被浏览器解引用）。未声明 → ""。
 * weui 的 `--weui-*` 声明在 `body,.wx-root,page`，读 `<html>` 只会得到空串。
 */
function readRootToken(name) {
  try {
    return (
      getComputedStyle(document.body).getPropertyValue(name) || ""
    ).trim();
  } catch {
    return "";
  }
}

/**
 * 扫描样式表，收集「选择器命中 match(selectorText) 的规则」里声明的自定义属性。
 *
 * 注意：新版 Chrome 里 CSSStyleRule 也带（空）cssRules，所以「有 cssRules 就下钻」
 * 会把普通样式规则整个跳过 —— 必须同时看有没有 selectorText。
 */
function collectDeclared(match) {
  const out = {};
  const visit = (rules) => {
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (!rule.selectorText || !rule.style) {
        if (rule.cssRules) {
          try {
            visit(rule.cssRules);
          } catch {
            /* 跨域或 @import 失败，跳过 */
          }
        }
        continue;
      }
      if (!match(String(rule.selectorText))) continue;
      for (let j = 0; j < rule.style.length; j += 1) {
        const prop = rule.style[j];
        if (prop.slice(0, 2) !== "--") continue;
        if (out[prop] === undefined) {
          out[prop] = rule.style.getPropertyValue(prop).trim();
        }
      }
    }
  };
  const sheets = document.styleSheets;
  for (let i = 0; i < sheets.length; i += 1) {
    try {
      if (sheets[i].cssRules) visit(sheets[i].cssRules);
    } catch {
      /* 忽略不可读的样式表 */
    }
  }
  return out;
}

const NUMBER_RE = /^(-?\d*\.?\d+)(px|rem|em|%)?$/;

/** "0.375rem" → { num: 0.375, unit: "rem" }；解析不出来返回 null。 */
function parseLength(text) {
  const m = NUMBER_RE.exec(String(text || "").trim());
  if (!m) return null;
  return { num: Number(m[1]), unit: m[2] || "" };
}

function formatLength(num, unit) {
  return `${Math.round(num * 1000) / 1000}${unit}`;
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
/** weui 的颜色有 hex 与 rgba() 两种写法。 */
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\()/i;
/** 带 alpha 的颜色（rgba(...) / #rrggbbaa）：取色器表示不了 alpha，退回文本输入。 */
const ALPHA_RE = /\/|rgba\(|hsla\(|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{8}\b/;

/**
 * 把任意 CSS 颜色转成 hex —— 只因为 <input type="color"> 只认 hex。
 * 画一像素再读回像素值（画布后备存储是 sRGB），转不了返回 null，调用方退回文本输入。
 */
function toHex(cssColor) {
  if (HEX_RE.test(cssColor)) return cssColor;
  if (!globalThis.CSS || !CSS.supports("color", cssColor)) return null;
  if (ALPHA_RE.test(cssColor)) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const hex = (n) => n.toString(16).padStart(2, "0");
    return `#${hex(d[0])}${hex(d[1])}${hex(d[2])}`;
  } catch {
    return null;
  }
}

/** 按当前值自动判控件：颜色 → 取色器；纯数值 → 滑块；其余 → 文本输入。 */
function detectControl(value) {
  if (COLOR_RE.test(value)) return "color";
  if (parseLength(value)) return "number";
  return "text";
}

/**
 * 给滑块一个「以当前值为基准」的合理量程。
 * rem / em 一律换算到 px 空间再拖，读数时再除回去；scale 就是换算比。
 */
function rangeFor(num, unit) {
  if (unit === "rem" || unit === "em") {
    const px = num * 16;
    const step = px >= 24 ? 2 : px >= 8 ? 1 : 0.5;
    return {
      min: 0,
      max: Math.max(Math.ceil((px * 3) / step) * step, step * 20),
      step,
      scale: 16,
    };
  }
  if (unit === "%") return { min: 0, max: 100, step: 1, scale: 1 };
  const step =
    unit === "" ? 0.05 : num >= 64 ? 4 : num >= 24 ? 2 : num >= 8 ? 1 : 0.25;
  return {
    min: 0,
    max: Math.max(Math.ceil((num * 3) / step) * step, step * 20),
    step,
    scale: 1,
  };
}

/* ------------------------------------------------------------------ *
 * 4. 规范表
 */

// 注意：宿主层把 style 序列化成 cssText 后整体赋值，而 cssText 只认 kebab-case
// 属性名（camelCase 的 borderRadius 会被整条丢弃），所以这里必须写连字符形式。
const SPECIMEN_STYLE = {
  swatch: (v) => ({ background: v }),
  radius: (v) => ({ "border-radius": v }),
  spacing: (v) => ({ width: v }),
  height: (v) => ({ height: v }),
  type: (v) => ({ "font-size": v }),
  shadow: (v) => ({ "box-shadow": v }),
  motion: (v) => ({ "transition-duration": v }),
};

function specimenOf(name, label, kind, style) {
  switch (kind) {
    case "swatch":
      return View({ class: "weui-spec-swatch", style });
    case "radius":
      return View({ class: "weui-spec-radius", style });
    case "spacing":
      return View({ class: "weui-spec-bar", style });
    case "height":
      return View({ class: "weui-spec-height", style });
    case "type":
      return View({ class: "weui-spec-type", style }, ["Ag"]);
    case "shadow":
      return View({ class: "weui-spec-shadow", style });
    case "motion":
      return View({ class: "weui-spec-motion", style }, ["A"]);
    default:
      return View({ class: "weui-spec-code" }, [`var(${name})`]);
  }
}

function SpecTable(group, light, dark, readCurrent) {
  const head = View({ class: "weui-spec-tr is-head" }, [
    View({}, ["token"]),
    View({}, ["亮色声明"]),
    View({}, ["暗色声明"]),
    View({}, ["当前"]),
    View({}, ["标本"]),
  ]);

  const rows = group.entries.map((entry) => {
    const v = `var(${entry.name})`;
    const make = SPECIMEN_STYLE[entry.specimen];
    return View({ class: "weui-spec-tr" }, [
      View({}, [
        View({ class: "weui-spec-token" }, [entry.name]),
        View({ class: "weui-spec-token-label" }, [entry.label]),
      ]),
      View({ class: "weui-spec-code" }, [light[entry.name] || "—"]),
      View({ class: "weui-spec-code" }, [dark[entry.name] || "—"]),
      View({ class: "weui-spec-value" }, [readCurrent(entry.name)]),
      View(
        { class: "weui-spec-cell" },
        [specimenOf(entry.name, entry.label, entry.specimen, make ? make(v) : {})],
      ),
    ]);
  });

  return View({ class: "weui-spec-table" }, [head, ...rows]);
}

/* ------------------------------------------------------------------ *
 * 5. 页面
 */
export default function DesignSpecView() {
  const light = collectDeclared(isLightSelector);
  const dark = collectDeclared((s) => DARK_SELECTOR_RE.test(s));

  // --- 5.1 过滤出本库真实声明的 token ---
  /** @type {any[]} */
  const entries = [];
  const groups = TOKEN_GROUPS.map((group) => {
    const list = [];
    group.tokens.forEach((t) => {
      const baseline = readRootToken(t.name);
      if (!baseline) return; // 未声明 → 隐藏
      const entry = {
        name: t.name,
        label: t.label,
        edit: !!t.edit,
        specimen: t.specimen || group.specimen,
        baseline,
        control: detectControl(baseline),
      };
      list.push(entry);
      entries.push(entry);
    });
    return { key: group.key, title: group.title, hint: group.hint, entries: list };
  });

  // --- 5.2 孤岛与调参状态 ---
  const islandEl = { current: null };
  /** 孤岛的内联变量集合；整对象替换（见文件头注释）。 */
  const islandStyle = ref({});
  /** 任何会影响读数的变化（覆盖值 / 主题 / 关怀模式）都 bump 一次，驱动表格重新读 DOM。 */
  const tick = ref(0);
  const state = {};

  const readCurrent = (name) => {
    const el = islandEl.current;
    if (!el) return readRootToken(name);
    try {
      return (getComputedStyle(el).getPropertyValue(name) || "").trim();
    } catch {
      return "";
    }
  };

  const sync = () => {
    const style = {};
    entries.forEach((e) => {
      const s = state[e.name];
      if (!e.edit || !s || !s.dirty.value) return;
      style[e.name] = s.ctrl.text.value;
    });
    islandStyle.as(style);
    tick.as(tick.value + 1);
  };

  /** 控件适配器：数值型走滑块（值域用原单位），其余走取色器 / 文本框。 */
  const makeControl = (entry) => {
    const onChange = () => {
      state[entry.name].dirty.as(true);
      sync();
    };
    const parsed = parseLength(entry.baseline);
    if (parsed) {
      const { min, max, step, scale } = rangeFor(parsed.num, parsed.unit);
      const num$ = ref(parsed.num * scale);
      return {
        kind: "number",
        min,
        max,
        step,
        value$: num$,
        text: computed(num$, (n) => formatLength(n / scale, parsed.unit)),
        set: (n) => {
          num$.as(n);
          onChange();
        },
        reset: () => num$.as(parsed.num * scale),
      };
    }
    // 取色器只认 hex：rgba() 值先转成 hex 喂给它；转不了就退回文本输入。
    const hex = entry.control === "color" ? toHex(entry.baseline) : null;
    const initial = hex || entry.baseline;
    const str$ = ref(initial);
    return {
      kind: hex ? "color" : "text",
      value$: str$,
      text: str$,
      set: (v) => {
        str$.as(v);
        onChange();
      },
      reset: () => str$.as(initial),
    };
  };

  entries.forEach((e) => {
    if (!e.edit) return;
    state[e.name] = { dirty: ref(false), ctrl: makeControl(e) };
  });

  const resetAll = () => {
    entries.forEach((e) => {
      if (!e.edit) return;
      state[e.name].ctrl.reset();
      state[e.name].dirty.as(false);
    });
    sync();
  };

  // --- 5.3 孤岛 / 页面级别的主题动作 ---
  /** weui 的调色板挂在 body，provider-web 的 setTheme 挂在 html —— 两处都要写。 */
  const toggleTheme = () => {
    const cur = app.getTheme ? app.getTheme() : "light";
    const next = cur === "dark" ? "light" : "dark";
    app.setTheme(next);
    document.body.setAttribute("data-weui-theme", next);
    tick.as(tick.value + 1);
  };

  const toggleCare = () => {
    if (document.body.dataset.weuiMode === "care") {
      delete document.body.dataset.weuiMode;
    } else {
      document.body.dataset.weuiMode = "care";
    }
    tick.as(tick.value + 1);
  };

  // --- 5.4 控件渲染 ---
  const Knob = (entry) => {
    const s = state[entry.name];
    let control;
    if (s.ctrl.kind === "number") {
      control = Timeless.Input({
        class: "weui-spec-knob-range",
        attributes: {
          type: "range",
          min: s.ctrl.min,
          max: s.ctrl.max,
          step: s.ctrl.step,
        },
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(Number(e.target.value)),
      });
    } else if (s.ctrl.kind === "color") {
      control = Timeless.Input({
        class: "weui-spec-knob-color",
        attributes: { type: "color" },
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    } else {
      control = Timeless.Input({
        class: "weui-spec-knob-text",
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    }
    return View({ class: "weui-spec-knob" }, [
      View({ class: "weui-spec-knob-head" }, [
        View({ class: "weui-spec-knob-label" }, [entry.label]),
        View({ class: "weui-spec-knob-name" }, [entry.name]),
      ]),
      View({ class: "weui-spec-knob-body" }, [
        control,
        View({ class: "weui-spec-knob-value" }, [Text(s.ctrl.text)]),
      ]),
    ]);
  };

  const Panel = View({ class: "weui-spec-panel" }, [
    View({ class: "weui-spec-panel-title" }, ["实时调参"]),
    View(
      { class: "weui-spec-panel-note" },
      ["只改组件直接消费的 --weui-* 变量，只影响右侧预览孤岛；页面外壳与画廊不受影响。"],
    ),
    View(
      { class: "weui-spec-panel-note" },
      [
        "关怀模式只做开关 + 「当前」列实时读数：4 套预设的差异用「当前」列已经能回答，" +
          "再开 care-light / care-dark 两列会把表宽翻倍。",
      ],
    ),
    ...groups.map((group) =>
      View({ class: "weui-spec-group" }, [
        View({ class: "weui-spec-group-title" }, [group.title]),
        ...(group.entries.some((e) => e.edit)
          ? group.entries.filter((e) => e.edit).map(Knob)
          : [
              View({ class: "weui-spec-group-empty" }, [
                "该组没有可运行时覆盖的 token。",
              ]),
            ]),
      ]),
    ),
    View({ class: "weui-spec-actions" }, [
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            variant: OUTLINE_VARIANT,
            onClick: resetAll,
          }),
        },
        ["重置"],
      ),
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            variant: OUTLINE_VARIANT,
            onClick: toggleTheme,
          }),
        },
        ["切换暗色"],
      ),
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            variant: OUTLINE_VARIANT,
            onClick: toggleCare,
          }),
        },
        ["关怀模式"],
      ),
    ]),
  ]);

  // --- 5.5 孤岛：内联变量 + 预览 + 规范表 + 缺口提示 ---
  const Island = View(
    {
      class: "weui-spec-canvas",
      style: islandStyle,
      onMounted(event) {
        // event.target 是宿主 VNode 包装，要读计算样式得拿到底层真元素。
        const host = event.target;
        islandEl.current =
          host && typeof host.get$elm === "function" ? host.get$elm() : host;
        tick.as(tick.value + 1);
        const bump = () => tick.as(tick.value + 1);
        // weui 的调色板挂 body（data-weui-theme / data-weui-mode / class / style），
        // provider-web 的 setTheme 挂 html —— 两处都要盯。
        const bodyObserver = new MutationObserver(bump);
        bodyObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["data-weui-theme", "data-weui-mode", "class", "style"],
        });
        const htmlObserver = new MutationObserver(bump);
        htmlObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme", "class", "style"],
        });
        return () => {
          bodyObserver.disconnect();
          htmlObserver.disconnect();
          islandEl.current = null;
        };
      },
    },
    [
      PreviewIsland(),
      View(
        { class: "weui-spec-tables" },
        groups.map((group) =>
          View({ class: "weui-spec-section" }, [
            View({ class: "weui-spec-section-title" }, [group.title]),
            View({ class: "weui-spec-hint" }, [group.hint]),
            group.entries.length
              ? SpecTable(group, light, dark, (name) =>
                  Text(computed(tick, () => readCurrent(name) || "—")),
                )
              : View({ class: "weui-spec-notice" }, [
                  `本库未声明「${group.title}」相关 token —— ${group.hint}`,
                ]),
          ]),
        ),
      ),
      View({ class: "weui-spec-gaps" }, [
        View({ class: "weui-spec-gaps-title" }, [
          "⚠️ 被引用但从未声明的变量（上游缺口）",
        ]),
        View({}, [
          "以下 token 被 src/modules/*.ts 的内联 style 引用，但在 vars/** 与 variable/** 中从未定义，" +
            "浏览器会把声明当无效值丢弃。本页如实标注，**不偷偷补 CSS**（补了会改变 weui 组件视觉）。" +
            "详见 packages/weui/THEME_DESIGN.md §7。",
        ]),
        ...KNOWN_GAPS.map((gap) =>
          View({ style: { "margin-top": "4px" } }, [
            View({ class: "weui-spec-code" }, [gap.name]),
            View({ class: "weui-spec-code" }, [`  ← ${gap.note}`]),
          ]),
        ),
        View({ style: { "margin-top": "6px" } }, [
          "另：--weui-BTN-HEIGHT / -MEDIUM / -SMALL 是无单位数字，" +
            "组件直接当长度用时（height: var(--weui-BTN-HEIGHT)）同样会被丢弃。",
        ]),
      ]),
    ],
  );

  // --- 5.6 页面骨架 ---
  return ScrollView(
    { class: "weui-spec-root", store: new Timeless.vm.ScrollViewCore({}) },
    [
      View({ class: "weui-spec-page" }, [
        View({ class: "weui-spec-header" }, [
          View({ class: "weui-spec-header-text" }, [
            View({ class: "weui-spec-title" }, [
              `Timeless · ${LIB_LABEL} · 设计规范`,
            ]),
            View({ class: "weui-spec-subtitle" }, [
              "token 目录从真实样式表读出来；改一个 token，右侧孤岛立刻变，页面其余部分不动。",
            ]),
          ]),
        ]),
        View({ class: "weui-spec-body" }, [Panel, Island]),
      ]),
    ],
  );
}
