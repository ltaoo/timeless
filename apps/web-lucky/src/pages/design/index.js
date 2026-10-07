
import { Section } from "@/components/index.js";

/* ================================================================== *
 * 1. 本 app 专属部分（移植到 material / fluent 时只改这一段）
 * ================================================================== */
const LIB_KEY = "lucky";
const LIB_LABEL = "Lucky";

const OUTLINE_VARIANT = "outline";

const ALIAS_SELECTOR = `[data-tt-style="${LIB_KEY}"]`;

const COMPANION_TOKENS = {};


function PreviewIsland() {
  const button = (variant, label) =>
    Button({ store: new Timeless.vm.ButtonCore({ variant }) }, [label]);

  return View({ class: "gallery-spec-preview" }, [
    View({ class: "gallery-spec-preview-row" }, [
      Price({ amount: 2000 }),
      OptionChip({ store: new Timeless.vm.ButtonCore({}), selected: true }, ["标准冰"]),
      Card({ variant: "profile" }, [CardContent({}, ["我的 · 账户资产"])]),
      Card({ variant: "member" }, [CardContent({}, ["会员权益"])]),
    ]),
    View({ class: "gallery-spec-preview-row" }, [
      button("primary", "Primary"),
      button("secondary", "Secondary"),
      button("ghost", "Ghost"),
      button(OUTLINE_VARIANT, "Outline"),
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
          CardFooter({}, [button("primary", "Action")]),
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
          AlertDescription({}, ["Danger alert —— 读 --destructive。"]),
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
      { name: "--price", label: "价格橙", edit: true },
      { name: "--profile-surface", label: "我的背景", edit: true },
      { name: "--member-surface", label: "会员卡底", edit: true },
      { name: "--member-foreground", label: "会员金", edit: true },
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
      { name: "--radius-xl", label: "我的卡片圆角", edit: true },
      { name: "--option-radius", label: "选项圆角", edit: true },
      { name: "--radius-pill", label: "胶囊", edit: true },
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
    hint: "时长与缓动。上游只声明 fast / base / slow 三档与一条标准缓动，其余候选名会自动隐藏。",
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


function readRootToken(name) {
  try {
    return (
      getComputedStyle(document.documentElement).getPropertyValue(name) || ""
    ).trim();
  } catch {
    return "";
  }
}


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


function parseLength(text) {
  const m = NUMBER_RE.exec(String(text).trim());
  if (!m) return null;
  return { num: parseFloat(m[1]), unit: m[2] || "" };
}

function formatLength(num, unit) {
  return `${Math.round(num * 1000) / 1000}${unit}`;
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;


function detectControl(value) {
  if (HEX_RE.test(value)) return "color";
  if (parseLength(value)) return "number";
  return "text";
}


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
  
  const islandStyle = ref({});
  
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
    View(
      { class: "gallery-spec-panel-note" },
      [
        "Lucky 仅提供截图对应的浅色主题；未采集暗色页面，暗色切换暂不可用。",
      ],
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
      // 暗色按钮刻意保留但停用：上游只提供亮色 token，切了不会有任何变化，
      // 留一个 disabled 的按钮比直接删掉更能说明「这是已知的上游约束」。
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            variant: OUTLINE_VARIANT,
            disabled: true,
          }),
        },
        ["暗色（未采集）"],
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
