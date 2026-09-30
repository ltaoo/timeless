/**
 * 设计规范（Design Spec）页面 —— Bootstrap 5.3 画廊。
 *
 * 三件事：
 *   1. 只读规范表：色板 / 圆角 / 间距 / 尺寸 / 字阶 / 阴影 / 动效。
 *      token 目录是「候选清单」，启动时逐个读 getComputedStyle(documentElement)，
 *      空的（本库未声明）直接隐藏 —— 所以一份表服务四个库，且默认值不手抄。
 *   2. 实时调参：改一个 token 只影响右侧「预览孤岛」。
 *      孤岛的 style 是一个 Ref<object>，内容是 { "--primary": "#f00", ... }
 *      这样的内联 CSS 变量。为什么必须整对象替换：宿主层把 style 序列化成
 *      cssText 后整体赋值（viewStyleToCssText → $elm.style.cssText），而
 *      el.style["--x"] = v 在浏览器里对自定义属性无效（只有 setProperty /
 *      cssText / setAttribute("style") 生效）。所以「对象建一次 + 每个 key 是
 *      ref」这条常规写法在这里不成立，必须整对象换。
 *   3. 孤岛只写「被改过」的 token。没改的保持继承，因此切暗色时未覆盖的 token
 *      仍然跟随暗色（内联值优先级高于 [data-tt-style] 与暗色下的别名声明）。
 *
 * 作用域库不需要给孤岛挂 data-tt-style：库组件 CSS 写的是后代选择器，
 * <html data-tt-style="bootstrap"> 的后代本来就匹配，孤岛只要内联覆盖别名即可。
 */
import { app } from "@/store/index.js";
import { Section } from "@/components/index.js";

/* ================================================================== *
 * 1. 本 app 专属部分（移植到 material / fluent 时只改这一段）
 * ================================================================== */
const LIB_KEY = "material";
const LIB_LABEL = "Material 3";
/** 本库的「描边按钮」变体名（各库命名不同）。 */
const OUTLINE_VARIANT = "outlined";
/** 第二层语义别名所在的宿主选择器；层 1 原始名从这里的声明文本里取。 */
const ALIAS_SELECTOR = `[data-tt-style="${LIB_KEY}"]`;
/**
 * 组件真正消费的别名若不是本页暴露的那一个，在这里补齐兄弟别名。
 * 例：Fluent 的按钮读 --brand-fill（与 --primary 同源），只改 --primary 按钮不会变，
 * 所以调主色要连带写 --brand-fill 系列；其余库组件直接读第二层别名，故为空。
 */
const COMPANION_TOKENS = {};

/** 预览孤岛：用真实组件消费 token，改一个 token 这里就能看见。 */
function PreviewIsland() {
  const button = (variant, label) =>
    Button({ store: new Timeless.vm.ButtonCore({ variant }) }, [label]);

  return View({ class: "gallery-spec-preview" }, [
    View({ class: "gallery-spec-preview-row" }, [
      button("filled", "Filled"),
      button("tonal", "Tonal"),
      button("elevated", "Elevated"),
      button(OUTLINE_VARIANT, "Outlined"),
      Badge({}, ["Badge"]),
      Badge({ variant: "success" }, ["Success"]),
    ]),
    View({ class: "gallery-spec-preview-row" }, [
      View({ class: "gallery-spec-preview-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "输入一些文字",
            allowClear: true,
          }),
        }),
      ]),
      View({ class: "gallery-spec-preview-field" }, [
        Slider({ value: 40, min: 0, max: 100 }),
      ]),
      Switch({ store: Timeless.vm.SwitchCore({ defaultValue: true }) }),
      View({ class: "gallery-spec-preview-progress" }, [
        Progress({ value: 60, max: 100 }),
      ]),
    ]),
    View({ class: "gallery-spec-preview-row" }, [
      View({ class: "gallery-spec-preview-card" }, [
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Card title"]),
            CardDescription({}, ["支持性描述文字，用弱化前景色。"]),
          ]),
          CardContent({}, [
            View({}, ["卡片正文使用 --foreground / --font-size / --line-height。"]),
          ]),
          CardFooter({}, [button("filled", "Action")]),
        ]),
      ]),
      View({ class: "gallery-spec-preview-stack" }, [
        Alert({ variant: "primary" }, [
          AlertDescription({}, ["Primary alert —— 读 --primary。"]),
        ]),
        Alert({ variant: "warning" }, [
          AlertDescription({}, ["Warning alert。"]),
        ]),
        Alert({ variant: "danger" }, [
          AlertDescription({}, ["Error alert —— 读 --destructive。"]),
        ]),
      ]),
    ]),
  ]);
}
/* ==================== 本 app 专属部分结束 ==================== */
/* ------------------------------------------------------------------ *
 * 2. token 目录（候选清单；只列第二层语义别名，绝不暴露 --bs-* 等原始 token）
 * ------------------------------------------------------------------ */
const TOKEN_GROUPS = [
  {
    key: "color",
    title: "色板",
    hint: "语义色别名。组件 CSS 只读这一层，改这里等于换肤。",
    specimen: "swatch",
    tokens: [
      { name: "--primary", label: "主色", edit: true },
      { name: "--secondary", label: "次色", edit: true },
      { name: "--destructive", label: "危险", edit: true },
      { name: "--background", label: "背景", edit: true },
      { name: "--foreground", label: "正文", edit: true },
      { name: "--muted", label: "弱化底", edit: true },
      { name: "--muted-foreground", label: "弱化文字", edit: true },
      { name: "--border", label: "边框", edit: true },
      { name: "--primary-foreground", label: "主色前景" },
      { name: "--secondary-foreground", label: "次色前景" },
      { name: "--card", label: "卡片底" },
      { name: "--card-foreground", label: "卡片文字" },
      { name: "--accent", label: "强调底" },
      { name: "--accent-foreground", label: "强调文字" },
      { name: "--input", label: "输入框描边" },
      { name: "--ring", label: "焦点环" },
      { name: "--success", label: "成功" },
      { name: "--warning", label: "警告" },
      { name: "--info", label: "信息" },
    ],
  },
  {
    key: "radius",
    title: "圆角",
    hint: "形状阶梯。每档都是独立声明，改一档不会联动其它档 —— 这是各库自己的设计。",
    specimen: "radius",
    tokens: [
      { name: "--radius", label: "基础圆角", edit: true },
      { name: "--radius-sm", label: "小圆角", edit: true },
      { name: "--radius-md", label: "中圆角", edit: true },
      { name: "--radius-lg", label: "大圆角", edit: true },
      { name: "--radius-xl", label: "超大圆角" },
      { name: "--radius-pill", label: "胶囊" },
    ],
  },
  {
    key: "space",
    title: "间距",
    hint: "间距基准。组件内部的 gap / padding 从这里派生。",
    specimen: "spacing",
    tokens: [
      { name: "--spacer", label: "间距基准", edit: true },
      { name: "--spacer-sm", label: "小间距", edit: true },
      { name: "--spacer-lg", label: "大间距", edit: true },
    ],
  },
  {
    key: "size",
    title: "尺寸",
    hint: "控件高度阶梯。输入框 / 按钮 / 下拉的高度都取这里。",
    specimen: "height",
    tokens: [
      { name: "--control-height", label: "控件高度", edit: true },
      { name: "--control-height-sm", label: "小控件高度", edit: true },
      { name: "--control-height-lg", label: "大控件高度", edit: true },
    ],
  },
  {
    key: "type",
    title: "字阶",
    hint: "正文档位。行高无单位（倍率），控件自动切到倍率模式。",
    specimen: "type",
    tokens: [
      { name: "--font-size", label: "正文字号", edit: true },
      { name: "--line-height", label: "正例行高", edit: true, specimen: "none" },
      { name: "--font-size-sm", label: "小号字号" },
      { name: "--font-size-xs", label: "超小字号", specimen: "none" },
    ],
  },
  {
    key: "shadow",
    title: "阴影",
    hint: "自下而上的高度感。值是复合声明，用文本输入编辑。",
    specimen: "shadow",
    tokens: [
      { name: "--shadow", label: "基础阴影", edit: true },
      { name: "--shadow-sm", label: "小阴影", edit: true },
      { name: "--shadow-lg", label: "大阴影", edit: true },
    ],
  },
  {
    key: "motion",
    title: "动效",
    hint: "时长与缓动。Bootstrap 未声明动效 token，所以这一组在本库为空。",
    specimen: "motion",
    tokens: [
      { name: "--duration-faster", label: "极快", edit: true },
      { name: "--duration-fast", label: "快", edit: true },
      { name: "--duration-normal", label: "标准", edit: true },
      { name: "--duration-slow", label: "慢", edit: true },
      { name: "--duration-short", label: "短", edit: true },
      { name: "--duration-medium", label: "中", edit: true },
      { name: "--duration-long", label: "长", edit: true },
      { name: "--easing-standard", label: "标准缓动", edit: true },
      { name: "--easing-emphasized", label: "强调缓动" },
      { name: "--easing-decelerate", label: "减速缓动" },
      { name: "--easing-accelerate", label: "加速缓动" },
    ],
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
 * 扫描样式表，取出「第二层别名 → 第一层原始声明」的映射，
 * 用于规范表的「层 1 原始名」列（如 --primary → var(--bs-primary)）。
 *
 * 两个坑：
 *  · 新版 Chrome 里 CSSStyleRule 也带（空）cssRules，所以「有 cssRules 就下钻」
 *    会把普通样式规则整个跳过 —— 必须同时看有没有 selectorText。
 *  · 暗色块的选择器是 `.dark [data-tt-style=...]`，也包含目标串。精确等于目标
 *    选择器的规则优先，拿到的才是亮色基线声明。
 */
function collectAliasSources(selector) {
  const exact = {};
  const loose = {};
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
      const text = String(rule.selectorText).trim();
      const isExact = text === selector;
      if (!isExact && text.indexOf(selector) === -1) continue;
      const bucket = isExact ? exact : loose;
      for (let j = 0; j < rule.style.length; j += 1) {
        const prop = rule.style[j];
        if (prop.slice(0, 2) !== "--") continue;
        if (bucket[prop] === undefined) {
          bucket[prop] = rule.style.getPropertyValue(prop).trim();
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
  return Object.assign({}, loose, exact);
}

const NUMBER_RE = /^(-?\d*\.?\d+)(px|rem|em|%)?$/;

/** "0.375rem" → { num: 0.375, unit: "rem" }；解析不出来返回 null。 */
function parseLength(text) {
  const m = NUMBER_RE.exec(String(text).trim());
  if (!m) return null;
  return { num: parseFloat(m[1]), unit: m[2] || "" };
}

function formatLength(num, unit) {
  return `${Math.round(num * 1000) / 1000}${unit}`;
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

/** 按当前值自动判控件：十六进制色 → 取色器；纯数值 → 滑块；其余 → 文本输入。 */
function detectControl(value) {
  if (HEX_RE.test(value)) return "color";
  if (parseLength(value)) return "number";
  return "text";
}

/**
 * 给滑块一个「以当前值为基准」的合理量程。
 * rem / em 一律换算到 px 空间再拖（0.375rem 这类值在 rem 网格上根本对不齐），
 * 读数时再除回去；scale 就是换算比。
 */
function rangeFor(num, unit) {
  if (unit === "rem" || unit === "em") {
    const px = num * 16;
    const step = px >= 24 ? 2 : px >= 8 ? 1 : 0.5;
    return { min: 0, max: Math.max(Math.ceil((px * 3) / step) * step, step * 20), step, scale: 16 };
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
 * 5. 规范表
 * ------------------------------------------------------------------ */
function specimenOf(group, name, label, kind, style) {
  switch (kind) {
    case "swatch":
      return View({ class: "gallery-spec-swatch", style });
    case "radius":
      return View({ class: "gallery-spec-radius", style });
    case "spacing":
      return View({ class: "gallery-spec-bar", style });
    case "height":
      return View({ class: "gallery-spec-height", style });
    case "type":
      return View({ class: "gallery-spec-type", style }, ["Ag"]);
    case "shadow":
      return View({ class: "gallery-spec-shadow", style });
    case "motion":
      return View({ class: "gallery-spec-motion", style }, ["A"]);
    case "none":
      return View({ class: "gallery-spec-code" }, [label]);
    default:
      return View({ class: "gallery-spec-code" }, [`var(${name})`]);
  }
}

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

function SpecTable(group, sources, readCurrent) {
  const head = View({ class: "gallery-spec-tr is-head" }, [
    View({}, ["token"]),
    View({}, ["层 1 原始名"]),
    View({}, ["默认"]),
    View({}, ["当前"]),
    View({}, ["标本"]),
  ]);

  const rows = group.entries.map((entry) => {
    const v = `var(${entry.name})`;
    const make = SPECIMEN_STYLE[entry.specimen];
    return View({ class: "gallery-spec-tr" }, [
      View({}, [
        View({ class: "gallery-spec-token" }, [entry.name]),
        View({ class: "gallery-spec-token-label" }, [entry.label]),
      ]),
      View({ class: "gallery-spec-code" }, [sources[entry.name] || "—"]),
      View({ class: "gallery-spec-code" }, [entry.baseline]),
      View({ class: "gallery-spec-value" }, [readCurrent(entry.name)]),
      View(
        { class: "gallery-spec-cell-specimen" },
        [specimenOf(group, entry.name, entry.label, entry.specimen, make ? make(v) : {})],
      ),
    ]);
  });

  return View({ class: "gallery-spec-table" }, [head, ...rows]);
}

/* ------------------------------------------------------------------ *
 * 6. 页面
 * ------------------------------------------------------------------ */
export default function DesignSpecView() {
  const sources = collectAliasSources(ALIAS_SELECTOR);

  // --- 6.1 过滤出本库真实声明的 token ---
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

  // --- 6.2 孤岛与调参状态 ---
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
      if (companions) companions.forEach((name) => { style[name] = v; });
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
    const str$ = ref(entry.baseline);
    return {
      kind: entry.control === "color" ? "color" : "text",
      value$: str$,
      text: str$,
      set: (v) => {
        str$.as(v);
        onChange();
      },
      reset: () => str$.as(entry.baseline),
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

  // --- 6.3 控件渲染 ---
  const Knob = (entry) => {
    const s = state[entry.name];
    let control;
    if (s.ctrl.kind === "number") {
      control = Slider({
        class: "gallery-spec-slider",
        value: s.ctrl.value$,
        min: s.ctrl.min,
        max: s.ctrl.max,
        step: s.ctrl.step,
        onChange: (v) => s.ctrl.set(v),
      });
    } else if (s.ctrl.kind === "color") {
      control = Timeless.Input({
        class: "gallery-spec-color",
        attributes: { type: "color" },
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    } else {
      control = Timeless.Input({
        class: "gallery-spec-text-input",
        value: s.ctrl.value$,
        onInput: (e) => s.ctrl.set(e.target.value),
      });
    }
    return View({ class: "gallery-spec-knob" }, [
      View({ class: "gallery-spec-knob-head" }, [
        View({ class: "gallery-spec-knob-label" }, [entry.label]),
        View({ class: "gallery-spec-knob-name" }, [entry.name]),
      ]),
      View({ class: "gallery-spec-knob-body" }, [
        control,
        View({ class: "gallery-spec-knob-value" }, [Text(s.ctrl.text)]),
      ]),
    ]);
  };

  const Panel = View({ class: "gallery-spec-panel" }, [
    View({ class: "gallery-spec-panel-title" }, ["实时调参"]),
    View(
      { class: "gallery-spec-panel-note" },
      ["只改第二层语义别名，只影响右侧预览孤岛，画廊外壳与其它页面不受影响。"],
    ),
    ...groups.map((group) =>
      View({ class: "gallery-spec-group" }, [
        View({ class: "gallery-spec-group-title" }, [group.title]),
        ...(group.entries.some((e) => e.edit)
          ? group.entries.filter((e) => e.edit).map(Knob)
          : [
              View({ class: "gallery-spec-group-empty" }, [
                "该库未声明可调 token（编译期烘焙或本库无此概念）。",
              ]),
            ]),
      ]),
    ),
    View({ class: "gallery-spec-actions" }, [
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
              const next = app.toggleTheme ? app.toggleTheme() : "light";
              app.setTheme(next);
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
    ]),
  ]);

  // --- 6.4 孤岛：内联变量 + 预览 + 规范表 ---
  const Island = View(
    {
      class: computed(fullscreen, (f) =>
        `gallery-spec-canvas${f ? " is-fullscreen" : ""}`,
      ),
      style: islandStyle,
      onMounted(event) {
        // event.target 是宿主 VNode 包装（有 addEventListener / getBoundingClientRect），
        // 要读计算样式得拿到底层真元素。
        const host = event.target;
        islandEl.current =
          host && typeof host.get$elm === "function" ? host.get$elm() : host;
        tick.as(tick.value + 1);
        // 主题切换会改 <html> 上的 data-theme / class / colorScheme，
        // 未覆盖的 token 因此变化，读数需要跟着刷新。
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
        { class: "gallery-spec-tables" },
        groups.map((group) =>
          group.entries.length
            ? Section(
                group.title,
                [
                  View({ class: "gallery-spec-hint" }, [group.hint]),
                  SpecTable(group, sources, (name) =>
                    Text(computed(tick, () => readCurrent(name) || "—")),
                  ),
                ],
              )
            : Section(group.title, [
                View({ class: "gallery-spec-notice" }, [
                  `本库未声明「${group.title}」相关 token —— ${group.hint}`,
                ]),
              ]),
        ),
      ),
    ],
  );

  // --- 6.5 页面骨架 ---
  return ScrollArea({ class: "gallery-root" }, [
    View({ class: "gallery-page gallery-page-wide" }, [
      // 页头只留标题 / 副标题 —— 跳转与暗色开关都在左侧菜单里。
      View({ class: "gallery-header" }, [
        View({ class: "gallery-header-text" }, [
          View({ class: "gallery-title" }, [`Timeless · ${LIB_LABEL} · 设计规范`]),
          View(
            { class: "gallery-subtitle" },
            ["Token 目录从真实样式表读出来；改一个 token，右侧孤岛立刻变，页面其余部分不动。"],
          ),
        ]),
      ]),
      View({ class: "gallery-spec" }, [Panel, Island]),
    ]),
  ]);
}
