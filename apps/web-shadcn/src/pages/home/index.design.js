/**
 * @file 设计规范（shadcn/ui）——只读规范表 + 实时调参孤岛。
 *
 * 与 bootstrap / material / fluent 三个画廊的同名页面同源，但 shadcn 是**全局库**
 * （token 声明在 `:root`），且能力边界不同，故按本库实际情况裁剪：
 *
 *  · 可运行时寻址的只有颜色 + `--radius`。间距 / 尺寸 / 字阶 / 阴影在 shadcn 里
 *    是编译进 Tailwind 工具类的数值，没有可覆盖的变量，本页如实标注为不可调，
 *    而不是假装支持。
 *  · 孤岛内联变量对子树同样有效：`@theme inline` 把 `--color-primary` 直接展开成
 *    `var(--primary)`，所以 `bg-primary` 这类工具类会跟着孤岛的 `--primary` 走。
 *  · 孤岛 style 必须是**整对象 Ref**：宿主层把 style 序列化成 cssText 后整体赋值
 *    （packages/timeless-dom/src/host/style.ts、box.ts），逐 key 的 `style[k] = v`
 *    对自定义属性不生效。
 *  · 只写「被改过的」token，没动过的继续跟随亮/暗色声明，`重置` 即清空内联变量。
 *  · 标本一律用内联 `var()`，不用 Tailwind 工具类：本 app 的 Tailwind 是运行时
 *    `@tailwindcss/browser`，它不知道本包 `@theme inline` 的映射，运行时生成的
 *    `rounded-lg` / `bg-primary` 未必跟 token 走；内联 `var()` 精确且与库无关。
 */
import { Section } from "@/components/index.js";
import { app } from "@/store/index.js";

/* ================================================================== *
 * 1. 本 app 专属部分（移植到 material / fluent 时只改这一段）
 * ================================================================== */
const LIB_LABEL = "shadcn/ui";
/** 全局库：第二层别名声明在 `:root`。 */
const ALIAS_SELECTOR = ":root";
/** 暗色是 `.dark` / `[data-theme="dark"]` 上的另一套声明，单独扫出来做对照列。 */
const DARK_SELECTOR_RE = /(^|[\s,])\.dark\b|\[data-theme=["']?dark/;
/** 本库的「描边按钮」变体名。 */
const OUTLINE_VARIANT = "outline";
/**
 * 派生圆角阶梯：shadcn 在 `@theme inline` 里用 calc(var(--radius) * k) 派生，
 * 这里按同一组系数显式写进孤岛，效果不依赖 Tailwind 的解引用行为。
 */
const RADIUS_STEPS = {
  "--radius-sm": 0.6,
  "--radius-md": 0.8,
  "--radius-lg": 1,
  "--radius-xl": 1.4,
  "--radius-2xl": 1.8,
  "--radius-3xl": 2.2,
  "--radius-4xl": 2.6,
};
/** 改 --radius 时连带写派生阶梯（同一份系数，见上）。 */
const COMPANION_TOKENS = {
  "--radius": (v) =>
    Object.fromEntries(
      Object.entries(RADIUS_STEPS).map(([name, k]) => [
        name,
        k === 1 ? v : `calc(${v} * ${k})`,
      ]),
    ),
};

/** 预览孤岛：用真实组件消费 token，改一个 token 这里就能看见。 */
function PreviewIsland() {
  const button = (variant, label) =>
    Button({ store: new Timeless.vm.ButtonCore({ variant }) }, [label]);

  return View({ class: "flex flex-col gap-4 pb-6 border-b border-border" }, [
    View({ class: "flex flex-wrap items-center gap-3" }, [
      button("default", "Default"),
      button("secondary", "Secondary"),
      button("destructive", "Destructive"),
      button(OUTLINE_VARIANT, "Outline"),
      Badge({}, ["Badge"]),
      Badge({ variant: "secondary" }, ["Secondary"]),
    ]),
    View({ class: "flex flex-wrap items-center gap-3" }, [
      View({ class: "w-[220px]" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "输入一些文字",
            allowClear: true,
          }),
        }),
      ]),
      View({ class: "w-[220px]" }, [
        Slider({ value: 40, min: 0, max: 100 }),
      ]),
      Switch({ store: Timeless.vm.SwitchCore({ defaultValue: true }) }),
      View({ class: "w-[160px]" }, [Progress({ value: 60, max: 100 })]),
    ]),
    View({ class: "flex flex-wrap gap-4" }, [
      View({ class: "w-[280px]" }, [
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Card title"]),
            CardDescription({}, ["支持性描述文字，用弱化前景色。"]),
          ]),
          CardContent({}, [
            View({}, ["卡片正文使用 --foreground / --font-size / --line-height。"]),
          ]),
          CardFooter({}, [button("default", "Action")]),
        ]),
      ]),
      View({ class: "flex flex-1 min-w-[240px] flex-col gap-2" }, [
        Alert({}, [AlertDescription({}, ["Default alert —— 读 --background / --foreground。"])]),
        Alert({ variant: "destructive" }, [
          AlertDescription({}, ["Destructive alert —— 读 --destructive。"]),
        ]),
      ]),
    ]),
  ]);
}
/* ==================== 本 app 专属部分结束 ==================== */

/* ------------------------------------------------------------------ *
 * 2. token 目录（候选清单；真实声明与否启动时读 DOM 判定，缺则隐藏）
 * ------------------------------------------------------------------ */
const TOKEN_GROUPS = [
  {
    key: "color",
    title: "色板",
    hint: "shadcn 的颜色全是 :root 上的自定义属性，可运行时覆盖；暗色另有一套声明。",
    specimen: "swatch",
    tokens: [
      { name: "--background", label: "背景", edit: true },
      { name: "--foreground", label: "前景", edit: true },
      { name: "--card", label: "卡片底", edit: true },
      { name: "--card-foreground", label: "卡片前景", edit: true },
      { name: "--popover", label: "浮层底", edit: true },
      { name: "--primary", label: "主色", edit: true },
      { name: "--primary-foreground", label: "主色前景", edit: true },
      { name: "--secondary", label: "次色", edit: true },
      { name: "--secondary-foreground", label: "次色前景", edit: true },
      { name: "--muted", label: "弱化底", edit: true },
      { name: "--muted-foreground", label: "弱化前景", edit: true },
      { name: "--accent", label: "强调底", edit: true },
      { name: "--accent-foreground", label: "强调前景", edit: true },
      { name: "--destructive", label: "危险色", edit: true },
      { name: "--destructive-foreground", label: "危险前景", edit: true },
      { name: "--border", label: "描边", edit: true },
      { name: "--input", label: "输入框描边", edit: true },
      { name: "--ring", label: "聚焦环", edit: true },
      { name: "--chart-1", label: "图表 1", edit: true },
      { name: "--chart-2", label: "图表 2", edit: true },
      { name: "--chart-3", label: "图表 3", edit: true },
      { name: "--chart-4", label: "图表 4", edit: true },
      { name: "--chart-5", label: "图表 5", edit: true },
      { name: "--sidebar", label: "侧栏底", edit: true },
      { name: "--sidebar-primary", label: "侧栏主色", edit: true },
      { name: "--sidebar-accent", label: "侧栏强调", edit: true },
      { name: "--sidebar-border", label: "侧栏描边", edit: true },
      { name: "--sidebar-ring", label: "侧栏聚焦环", edit: true },
    ],
  },
  {
    key: "radius",
    title: "圆角",
    hint: "只有 --radius 是源头；其余阶梯由它在 @theme inline 里 calc 派生。",
    specimen: "radius",
    tokens: [
      { name: "--radius", label: "基础圆角", edit: true },
      { name: "--radius-sm", label: "sm（×0.6）" },
      { name: "--radius-md", label: "md（×0.8）" },
      { name: "--radius-lg", label: "lg（×1）" },
      { name: "--radius-xl", label: "xl（×1.4）" },
      { name: "--radius-2xl", label: "2xl（×1.8）" },
      { name: "--radius-3xl", label: "3xl（×2.2）" },
      { name: "--radius-4xl", label: "4xl（×2.6）" },
    ],
  },
  {
    key: "space",
    title: "间距",
    hint: "间距是 Tailwind 工具类的编译期数值，没有可覆盖的变量。",
    specimen: "spacing",
    tokens: [{ name: "--spacer", label: "间距基准", edit: true }],
  },
  {
    key: "size",
    title: "尺寸",
    hint: "控件高度写在各组件的工具类里（h-9 / size-4 …），没有统一变量。",
    specimen: "height",
    tokens: [{ name: "--control-height", label: "控件高度", edit: true }],
  },
  {
    key: "type",
    title: "字阶",
    hint: "字号 / 行高来自 Tailwind 的 text-* / leading-* 工具类。",
    specimen: "type",
    tokens: [
      { name: "--font-size", label: "正文字号", edit: true },
      { name: "--line-height", label: "正例行高", specimen: "none" },
    ],
  },
  {
    key: "shadow",
    title: "阴影",
    hint: "阴影是 shadow-* 工具类的编译期数值。",
    specimen: "shadow",
    tokens: [{ name: "--shadow", label: "基础阴影", edit: true, specimen: "text" }],
  },
  {
    key: "motion",
    title: "动效",
    hint: "动效来自 tw-animate-css 与 duration-* 工具类。",
    specimen: "motion",
    tokens: [{ name: "--duration-short", label: "短时长", edit: true }],
  },
];

/* ------------------------------------------------------------------ *
 * 3. 取值 / 解析工具
 * ------------------------------------------------------------------ */

/** 读 <html> 上某个 token 的当前计算值（var() 链已被浏览器解引用）。未声明 → ""。 */
function readRootToken(name) {
  try {
    return (
      getComputedStyle(document.documentElement).getPropertyValue(name) || ""
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
/** shadcn 的颜色默认是 oklch()，不是 hex，所以颜色判定要放得比 hex 宽。 */
const COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|color\()/i;
/** 带 alpha 的颜色（oklch(1 0 0 / 10%) 这类）：取色器表示不了 alpha，退回文本输入。 */
const ALPHA_RE = /\/|rgba\(|hsla\(|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{8}\b/;

/**
 * 把任意 CSS 颜色转成 hex —— 只因为 <input type="color"> 只认 hex。
 * 不走 getComputedStyle：这个 Chrome 会把 oklch 原样回吐，根本不转 sRGB；
 * canvas 的 fillStyle 同样保留色彩空间。可靠的做法是画一像素再读回像素值，
 * 画布的后备存储是 sRGB，读回来的一定是 sRGB 字节。
 * 转不了返回 null，调用方退回文本输入。
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
 * rem / em 一律换算到 px 空间再拖（0.625rem 这类值在 rem 网格上根本对不齐），
 * 读数时再除回去；scale 就是换算比。
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

// 标本一律内联 var()（见文件头注释），不用 Tailwind 工具类。
function specimenOf(name, label, kind, style) {
  switch (kind) {
    case "swatch":
      return View({
        class: "size-7 rounded-md border border-border",
        style,
      });
    case "radius":
      return View({
        class: "h-7 w-14 border border-border bg-muted",
        style,
      });
    case "spacing":
      return View({ class: "h-3 max-w-full rounded-sm bg-primary", style });
    case "height":
      return View({ class: "w-14 border border-border bg-muted", style });
    case "type":
      return View({ class: "leading-none", style }, ["Ag"]);
    case "shadow":
      return View({ class: "size-7 rounded-md bg-card", style });
    case "motion":
      return View(
        {
          class:
            "flex size-7 items-center justify-center rounded-md bg-muted text-[0.625rem] text-muted-foreground",
          style,
        },
        ["A"],
      );
    case "none":
      return View(
        { class: "font-mono text-[0.6875rem] text-muted-foreground" },
        [label],
      );
    default:
      return View(
        { class: "font-mono text-[0.6875rem] text-muted-foreground break-all" },
        [`var(${name})`],
      );
  }
}

function cell(text, extra) {
  return View(
    {
      class: classNames([
        "shrink-0 font-mono text-[0.6875rem] text-muted-foreground break-all",
        extra,
      ]),
    },
    [text],
  );
}

const CELL_W = {
  token: "w-[190px]",
  source: "w-[200px]",
  current: "w-[190px]",
  specimen: "w-[64px]",
};

function SpecTable(group, light, dark, readCurrent) {
  const head = View(
    {
      class:
        "flex items-center gap-3 border-b-2 border-border py-2 text-[0.6875rem] uppercase tracking-[0.06em] text-muted-foreground",
    },
    [
      View({ class: `shrink-0 ${CELL_W.token}` }, ["token"]),
      View({ class: `shrink-0 ${CELL_W.source}` }, ["亮色声明"]),
      View({ class: `shrink-0 ${CELL_W.source}` }, ["暗色声明"]),
      View({ class: `shrink-0 ${CELL_W.current}` }, ["当前"]),
      View({ class: `shrink-0 ${CELL_W.specimen}` }, ["标本"]),
    ],
  );

  const rows = group.entries.map((entry) => {
    const v = `var(${entry.name})`;
    const make = SPECIMEN_STYLE[entry.specimen];
    return View(
      {
        class:
          "flex items-center gap-3 border-b border-border py-2 text-[0.8125rem]",
      },
      [
        View({ class: `shrink-0 ${CELL_W.token}` }, [
          View({ class: "font-mono text-xs" }, [entry.name]),
          View(
            { class: "text-[0.6875rem] text-muted-foreground" },
            [entry.label],
          ),
        ]),
        cell(light[entry.name] || "—", CELL_W.source),
        cell(dark[entry.name] || "—", CELL_W.source),
        View({ class: `shrink-0 ${CELL_W.current} break-all font-mono text-[0.6875rem]` }, [
          readCurrent(entry.name),
        ]),
        View({ class: `flex shrink-0 items-center ${CELL_W.specimen}` }, [
          specimenOf(
            entry.name,
            entry.label,
            entry.specimen,
            make ? make(v) : {},
          ),
        ]),
      ],
    );
  });

  return View({ class: "flex flex-col" }, [head, ...rows]);
}

/* ------------------------------------------------------------------ *
 * 5. 页面
 */
export default function DesignSpecView() {
  const light = collectDeclared((s) => s.trim() === ALIAS_SELECTOR);
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
  /** 任何会影响读数的变化（覆盖值 / 主题）都 bump 一次，驱动表格重新读 DOM。 */
  const tick = ref(0);
  const state = {};
  const fullscreen = ref(false);

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
      const v = s.ctrl.text.value;
      style[e.name] = v;
      const companions = COMPANION_TOKENS[e.name];
      if (companions) Object.assign(style, companions(v));
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
    // 取色器只认 hex：oklch 值先转成 hex 喂给它；转不了就退回文本输入，
    // 让用户直接写 oklch()/color-mix() 这类值。
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

  // --- 5.3 控件渲染 ---
  const Knob = (entry) => {
    const s = state[entry.name];
    let control;
    if (s.ctrl.kind === "number") {
      control = Slider({
        class: "flex-1 min-w-0",
        value: s.ctrl.value$,
        min: s.ctrl.min,
        max: s.ctrl.max,
        step: s.ctrl.step,
        onChange: (v) => s.ctrl.set(v),
      });
    } else if (s.ctrl.kind === "color") {
      control = Timeless.Input({
        class:
          "h-[30px] w-11 cursor-pointer rounded-md border border-border bg-background p-0",
        attributes: { type: "color" },
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    } else {
      control = Timeless.Input({
        class:
          "h-[30px] min-w-0 flex-1 rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground",
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    }
    return View({ class: "mb-3.5" }, [
      View({ class: "flex items-baseline justify-between gap-2" }, [
        View({ class: "text-[0.8125rem]" }, [entry.label]),
        View(
          { class: "font-mono text-[0.6875rem] text-muted-foreground" },
          [entry.name],
        ),
      ]),
      View({ class: "mt-0.5 flex items-center gap-2" }, [
        control,
        View(
          {
            class:
              "min-w-[4.5rem] break-all text-right font-mono text-[0.6875rem] text-muted-foreground",
          },
          [Text(s.ctrl.text)],
        ),
      ]),
    ]);
  };

  const Panel = View(
    {
      class:
        "sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-card p-4 text-card-foreground",
    },
    [
      View(
        {
          class:
            "text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        },
        ["实时调参"],
      ),
      View({ class: "mt-2 text-xs text-muted-foreground" }, [
        "只改第二层语义别名，只影响右侧预览孤岛；本页其它区域与画廊外壳不受影响。",
      ]),
      View({ class: "mt-1 text-xs text-muted-foreground" }, [
        "本库颜色默认写成 oklch()，而取色器只认 hex —— 取了色即按 hex 覆盖；要先写 oklch() 就改完再手填。",
      ]),
      ...groups.map((group) =>
        View({ class: "mt-[1.125rem]" }, [
          View({ class: "mb-2 text-[0.8125rem] font-semibold" }, [group.title]),
          ...(group.entries.some((e) => e.edit)
            ? group.entries.filter((e) => e.edit).map(Knob)
            : [
                View({ class: "text-xs text-muted-foreground" }, [
                  "该库不暴露此类 token（编译期烘焙）。",
                ]),
              ]),
        ]),
      ),
      View(
        { class: "mt-5 flex flex-wrap gap-2 border-t border-border pt-4" },
        [
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
                onClick: () => {
                  const cur = app.getTheme ? app.getTheme() : "light";
                  app.setTheme(cur === "dark" ? "light" : "dark");
                },
              }),
            },
            ["切换暗色"],
          ),
          Button(
            {
              store: new Timeless.vm.ButtonCore({
                size: "sm",
                variant: OUTLINE_VARIANT,
                onClick: () => fullscreen.as(!fullscreen.value),
              }),
            },
            ["全屏预览"],
          ),
        ],
      ),
    ],
  );

  // --- 5.4 孤岛：内联变量 + 预览 + 规范表 ---
  const Island = View(
    {
      // class 用模板串而不是 classNames()：computed 的返回值必须是字符串，
      // 而 classNames() 返回的是 ClassNameRef（其 .value 是数组）。
      class: computed(fullscreen, (f) =>
        [
          "rounded-lg border border-border bg-background p-6 text-foreground",
          f ? "fixed inset-0 z-50 overflow-y-auto rounded-none" : "",
        ].join(" "),
      ),
      style: islandStyle,
      onMounted(event) {
        // event.target 是宿主 VNode 包装（有 addEventListener / getBoundingClientRect），
        // 要读计算样式得拿到底层真元素。
        const host = event.target;
        islandEl.current =
          host && typeof host.get$elm === "function" ? host.get$elm() : host;
        tick.as(tick.value + 1);
        // 主题切换会改 <html> 上的 class / data-theme，未覆盖的 token 因此变化，
        // 读数需要跟着刷新。
        const observer = new MutationObserver(() => tick.as(tick.value + 1));
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme", "class", "style"],
        });
        return () => {
          observer.disconnect();
          islandEl.current = null;
        };
      },
    },
    [
      PreviewIsland(),
      View(
        { class: "mt-6 flex flex-col gap-6" },
        groups.map((group) =>
          Section(group.title, [
            View({ class: "text-xs text-muted-foreground" }, [group.hint]),
            group.entries.length
              ? SpecTable(
                  group,
                  light,
                  dark,
                  (name) => Text(computed(tick, () => readCurrent(name) || "—")),
                )
              : View(
                  {
                    class:
                      "rounded-lg border border-dashed border-border p-3 text-[0.8125rem] text-muted-foreground",
                  },
                  [`本库未声明「${group.title}」相关 token —— ${group.hint}`],
                ),
          ]),
        ),
      ),
    ],
  );

  // --- 5.5 页面骨架 ---
  return ScrollView(
    { class: "p-6 h-screen", store: new Timeless.vm.ScrollViewCore({}) },
    [
      View({ class: "flex flex-col gap-6" }, [
        View(
          {
            class:
              "flex items-center justify-between gap-4 border-b border-border pb-6",
          },
          [
            View({}, [
              View({ class: "text-2xl font-semibold" }, [
                `Timeless · ${LIB_LABEL} · 设计规范`,
              ]),
              View({ class: "mt-1 text-sm text-muted-foreground" }, [
                "token 目录从真实样式表读出来；改一个 token，右侧孤岛立刻变，页面其余部分不动。",
              ]),
            ]),
          ],
        ),
        View(
          {
            class:
              "grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]",
          },
          [Panel, Island],
        ),
      ]),
    ],
  );
}
