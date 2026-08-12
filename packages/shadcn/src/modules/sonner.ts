import { vm } from "@timeless/timeless";
import {
  computed,
  derive,
  DerivedRef,
  For,
  isElement,
  ref,
  Ref,
  refobj,
  Show,
  TimelessElement,
  View,
} from "@timeless/timeless";

type OffsetValue = number | string;
type Offset =
  | OffsetValue
  | {
      top?: OffsetValue;
      right?: OffsetValue;
      bottom?: OffsetValue;
      left?: OffsetValue;
    };

const TOAST_WIDTH = 356;
const GAP = 14;
const VIEWPORT_OFFSET = "24px";
const MOBILE_VIEWPORT_OFFSET = "16px";

const LIGHT_THEME_VARS = {
  "--gray1": "hsl(0, 0%, 99%)",
  "--gray2": "hsl(0, 0%, 97.3%)",
  "--gray3": "hsl(0, 0%, 95.1%)",
  "--gray4": "hsl(0, 0%, 93%)",
  "--gray5": "hsl(0, 0%, 90.9%)",
  "--gray6": "hsl(0, 0%, 88.7%)",
  "--gray7": "hsl(0, 0%, 85.8%)",
  "--gray8": "hsl(0, 0%, 78%)",
  "--gray9": "hsl(0, 0%, 56.1%)",
  "--gray10": "hsl(0, 0%, 52.3%)",
  "--gray11": "hsl(0, 0%, 43.5%)",
  "--gray12": "hsl(0, 0%, 9%)",
  "--normal-bg": "#fff",
  "--normal-border": "hsl(0, 0%, 93%)",
  "--normal-text": "hsl(0, 0%, 9%)",
  "--success-bg": "hsl(143, 85%, 96%)",
  "--success-border": "hsl(145, 92%, 87%)",
  "--success-text": "hsl(140, 100%, 27%)",
  "--info-bg": "hsl(208, 100%, 97%)",
  "--info-border": "hsl(221, 91%, 93%)",
  "--info-text": "hsl(210, 92%, 45%)",
  "--warning-bg": "hsl(49, 100%, 97%)",
  "--warning-border": "hsl(49, 91%, 84%)",
  "--warning-text": "hsl(31, 92%, 45%)",
  "--error-bg": "hsl(359, 100%, 97%)",
  "--error-border": "hsl(359, 100%, 94%)",
  "--error-text": "hsl(360, 100%, 45%)",
} as Record<string, string>;

const DARK_THEME_VARS = {
  "--gray1": "hsl(0, 0%, 99%)",
  "--gray2": "hsl(0, 0%, 97.3%)",
  "--gray3": "hsl(0, 0%, 95.1%)",
  "--gray4": "hsl(0, 0%, 93%)",
  "--gray5": "hsl(0, 0%, 90.9%)",
  "--gray6": "hsl(0, 0%, 88.7%)",
  "--gray7": "hsl(0, 0%, 85.8%)",
  "--gray8": "hsl(0, 0%, 78%)",
  "--gray9": "hsl(0, 0%, 56.1%)",
  "--gray10": "hsl(0, 0%, 52.3%)",
  "--gray11": "hsl(0, 0%, 43.5%)",
  "--gray12": "hsl(0, 0%, 9%)",
  "--normal-bg": "#000",
  "--normal-bg-hover": "hsl(0, 0%, 12%)",
  "--normal-border": "hsl(0, 0%, 20%)",
  "--normal-border-hover": "hsl(0, 0%, 25%)",
  "--normal-text": "hsl(0, 0%, 99%)",
  "--success-bg": "hsl(150, 100%, 6%)",
  "--success-border": "hsl(147, 100%, 12%)",
  "--success-text": "hsl(150, 86%, 65%)",
  "--info-bg": "hsl(215, 100%, 6%)",
  "--info-border": "hsl(223, 43%, 17%)",
  "--info-text": "hsl(216, 87%, 65%)",
  "--warning-bg": "hsl(64, 100%, 6%)",
  "--warning-border": "hsl(60, 100%, 9%)",
  "--warning-text": "hsl(46, 87%, 65%)",
  "--error-bg": "hsl(358, 76%, 10%)",
  "--error-border": "hsl(357, 89%, 16%)",
  "--error-text": "hsl(358, 100%, 81%)",
} as Record<string, string>;

/**
 * 将 offset 参数转化为 CSS 变量，与 sonner 原版 assignOffset 逻辑一致。
 */
function assignOffset(
  defaultOffset?: Offset,
  mobileOffset?: Offset,
): Record<string, string> {
  const styles: Record<string, string> = {};

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    function assignAll(val: OffsetValue) {
      ["top", "right", "bottom", "left"].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof val === "number" ? `${val}px` : val;
      });
    }

    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object" && offset !== null) {
      ["top", "right", "bottom", "left"].forEach((key) => {
        const v = (offset as Record<string, OffsetValue | undefined>)[key];
        if (v === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof v === "number" ? `${v}px` : v;
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}

/**
 * Toaster 容器的位置样式。
 *
 * 对应原版 CSS:
 *   [data-x-position='right']  → right: var(--offset-right)
 *   [data-x-position='left']   → left: var(--offset-left)
 *   [data-x-position='center'] → left: 50%; transform: translateX(-50%)
 *   [data-y-position='top']    → top: var(--offset-top)
 *   [data-y-position='bottom'] → bottom: var(--offset-bottom)
 */
function getToasterPositionStyles(position: string): Record<string, string> {
  const [y, x] = position.split("-");
  const styles: Record<string, string> = {};

  if (y === "top") {
    styles.top = "var(--offset-top)";
  } else {
    styles.bottom = "var(--offset-bottom)";
  }

  if (x === "right") {
    styles.right = "var(--offset-right)";
  } else if (x === "left") {
    styles.left = "var(--offset-left)";
  } else if (x === "center") {
    styles.left = "50%";
    styles.transform = "translateX(-50%)";
  }

  return styles;
}

/**
 * Toast 单条的位置样式。
 *
 * 对应原版 CSS:
 *   [data-y-position='top']    → top: 0
 *   [data-y-position='bottom'] → bottom: 0
 *   [data-x-position='right']  → right: 0
 *   [data-x-position='left']   → left: 0
 */
function getToastPositionStyles(
  position: string,
): Record<string, string | number> {
  const [y, x] = position.split("-");
  const styles: Record<string, string | number> = {};

  if (y === "top") {
    styles.top = 0;
  } else {
    styles.bottom = 0;
  }

  if (x === "right") {
    styles.right = 0;
  } else if (x === "left") {
    styles.left = 0;
  }

  return styles;
}

/** 记录每个 toast 的实际 DOM 高度，用于计算偏移量 */
type HeightEntry = { toastId: number; height: number; position: string };

type ToasterProps = {
  store: vm.ToasterModel;
  position?: string;
  theme?: "light" | "dark";
  gap?: number;
  offset?: Offset;
  mobileOffset?: Offset;
  /** 默认是否展开，false 时 toast 缩小层叠，hover 时展开 */
  expand?: boolean;
};

export function Toaster(props: ToasterProps) {
  const { store } = props;
  const default_position = props.position ?? "bottom-right";
  const theme = props.theme ?? "light";
  const gap = props.gap ?? GAP;
  const expandByDefault = props.expand ?? false;
  const themeVars = theme === "dark" ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const offsetVars = assignOffset(props.offset, props.mobileOffset);

  const state_ = refobj(store.state);
  const toasts_ = computed(state_, (t) => t.toasts);

  // expanded 状态：默认由 expand prop 决定，hover 时切换
  const expanded_ = ref(expandByDefault);

  // 维护一份 toast 高度表，由各 Toast onMounted 时回写
  const heights_ = ref<HeightEntry[]>([]);

  // 最新 toast（front）的高度，用于 collapsed 模式下统一非 front toast 的高度
  // heights 是 prepend 的，entries[0] 是最新的
  // const front_toast_height = computed(heights_, (entries) => {
  //   if (entries.length === 0) return 0;
  //   return entries[0]?.height ?? 0;
  // });
  const front_toast_height = ref(0);

  // 从所有 toasts 中收集去重的 position 列表
  // 与原版 possiblePositions 逻辑一致：默认 position + 各 toast 自身 position
  const positions_ = computed(toasts_, (toasts) => {
    const set = new Set<string>([default_position]);
    for (const t of toasts) {
      if (t.position) {
        set.add(t.position);
      }
    }
    return Array.from(set);
  });

  // 公共样式变量（不包含定位，定位由每个 position 容器自行设置）
  const sharedVars = {
    "--border-radius": "8px",
    "--width": `${TOAST_WIDTH}px`,
    "--gap": `${gap}px`,
    "--front-toast-height": "0px",
    "--toast-icon-margin-start": "-3px",
    "--toast-icon-margin-end": "4px",
    "--toast-svg-margin-start": "-1px",
    "--toast-svg-margin-end": "0px",
    "--toast-button-margin-start": "auto",
    "--toast-button-margin-end": "0",
    "--toast-close-button-start": "0",
    "--toast-close-button-end": "unset",
    "--toast-close-button-transform": "translate(-35%, -35%)",
    ...themeVars,
    ...offsetVars,
  };

  return View(
    {
      dataset: {
        "sonner-root": "",
      },
      attributes: {
        "tab-index": -1,
        "aria-live": "polite",
        "aria-relevant": "additions text",
        "aria-atomic": "false",
      },
      onMounted() {
        store.onStateChange((v) => {
          state_.as(v);
        });
      },
    },
    [
      // 为每个 position 渲染一个独立的 fixed 容器
      For({
        each: positions_,
        render(position) {
          // 过滤出属于该 position 的 toasts
          const toasts_in_position = computed(toasts_, (toasts) =>
            toasts.filter(
              (t) =>
                t.position === position ||
                (!t.position && default_position === position),
            ),
          );
          return ToasterGroup({
            store,
            position,
            gap,
            sharedVars,
            toasts: toasts_in_position,
            heights: heights_,
            expanded: expanded_,
            expandByDefault,
            frontToastHeight: front_toast_height,
          });
        },
      }),
    ],
  );
}

/**
 * 每个 position 对应一个独立的 fixed 容器 — 对应原版的 <ol data-sonner-toaster>
 */
function ToasterGroup(props: {
  store: vm.ToasterModel;
  position: string;
  gap: number;
  sharedVars: Record<string, string>;
  toasts: DerivedRef<vm.ToastModel[]>;
  heights: Ref<HeightEntry[]>;
  expanded: Ref<boolean>;
  expandByDefault: boolean;
  frontToastHeight: DerivedRef<number>;
}) {
  const {
    store,
    position,
    gap,
    sharedVars,
    toasts,
    heights,
    expanded,
    expandByDefault,
    frontToastHeight,
  } = props;

  // 容器高度：覆盖所有 toast 区域，让 mouseEnter/Leave 在间隙中也能触发
  const containerHeight_ = derive(
    [heights, expanded, toasts],
    (entries, isExpanded, toastList) => {
      const filtered = entries.filter((e) => e.position === position);
      if (filtered.length === 0) return "auto";
      if (isExpanded) {
        // expanded: 所有 toast 高度 + 间隙
        const total = filtered.reduce((sum, e) => sum + e.height, 0);
        return `${total + (filtered.length - 1) * gap}px`;
      }
      // collapsed: front toast 高度 + 层叠偏移（每个非 front toast 偏移 gap）
      const frontH = filtered[0]?.height ?? 0;
      const stacked = Math.min(toastList.length, filtered.length);
      return `${frontH + (stacked - 1) * gap}px`;
    },
  );

  return View(
    {
      style: {
        position: "fixed",
        width: `${TOAST_WIDTH}px`,
        ...sharedVars,
        "box-sizing": "border-box",
        padding: 0,
        margin: 0,
        outline: "none",
        "z-index": 999999999,
        transition: "transform 400ms ease",
        height: containerHeight_,
        ...getToasterPositionStyles(position),
      },
      attributes: {
        "tab-index": -1,
      },
      onMouseEnter() {
        expanded.as(true);
        store.pauseAllTimers();
      },
      onMouseLeave() {
        if (!expandByDefault) {
          expanded.as(false);
        }
        store.resumeAllTimers();
      },
    },
    [
      For({
        each: toasts,
        render(toast, idx) {
          return Toast({
            store: toast,
            position,
            gap,
            heights,
            expanded,
            frontToastHeight,
            toastCount: computed(toasts, (t) => t.length),
            idx,
          });
        },
      }),
    ],
  );
}

export function Toast(props: {
  store: vm.ToastModel;
  position: string;
  gap: number;
  heights: Ref<HeightEntry[]>;
  expanded: Ref<boolean>;
  frontToastHeight: DerivedRef<number>;
  toastCount: DerivedRef<number>;
  /** For 组件提供的当前列表位置索引（响应式） */
  idx: DerivedRef<number>;
}) {
  const {
    store,
    heights,
    position,
    gap,
    expanded,
    frontToastHeight,
    toastCount,
    idx,
  } = props;

  const [y_pos] = position.split("-");
  const lift = y_pos === "top" ? 1 : -1;

  const state_ = refobj(store.state);
  const removed_ = computed(state_, (t) => t.removed);

  // toastsBefore: 在当前 toast 前面（更靠近 front）的 toast 数量
  // front 是最新的 toast（列表末尾），toastsBefore = totalCount - 1 - idx
  const toasts_before_ = derive({ count: toastCount, idx }, (t) => {
    return Math.max(0, t.count - 1 - t.idx);
  });
  const is_front_ = computed(toasts_before_, (t) => t === 0);

  // 从共享的 heights 表中，按顺序累加该 toast 前面所有同 position toast 的高度
  const offset_ = derive({ heights, idx }, (t) => {
    let offset = 0;
    for (let i = 0; i < t.heights.length; i++) {
      if (t.heights[i].toastId === store.id) break;
      // 只累加同一个 position 的 toast
      if (t.heights[i].position === position) {
        offset += t.heights[i].height + gap;
      }
    }
    return offset;
  });

  const mounted_ = ref(false);
  const initial_height_ = ref(0);
  const offset_before_remove_ = ref(0);

  const cur_offset_ = derive(
    [offset_, removed_, offset_before_remove_],
    (offset, removed, obr) => {
      return removed ? obr : offset;
    },
  );

  const opacity_ = derive([mounted_, removed_], (mounted, removed) => {
    if (removed) return 0;
    return mounted ? 1 : 0;
  });

  const y_default = y_pos === "top" ? "translateY(-100%)" : "translateY(100%)";

  // 退出动画（与原版 CSS 一致）：
  //   front 退出: translateY(lift * -100%)  → 滑向屏幕外
  //   非 front + expanded 退出: translateY(lift * offset + lift * -100%)
  //   非 front + collapsed 退出: translateY(40%)  → 配合 opacity 200ms 快速消失
  // 进入 / 正常态：
  //   expanded: translateY(lift * offset)
  //   collapsed front: translateY(0)
  //   collapsed 非 front: translateY(lift * n * gap) scale(...)
  const transform_ = derive(
    [mounted_, cur_offset_, removed_, expanded, toasts_before_],
    (mounted, offset, removed, is_expanded, toasts_before) => {
      if (removed) {
        const is_front = toasts_before === 0;
        if (is_front) {
          // front: 向屏幕外滑出
          return `translateY(calc(${lift} * -100%))`;
        }
        if (is_expanded) {
          // 非 front + expanded: 从当前 offset 向屏幕外滑
          return `translateY(calc(${lift} * ${offset}px + ${lift} * -100%))`;
        }
        // 非 front + collapsed: 轻微下移 + 快速 fade（transition 200ms opacity）
        return `translateY(40%)`;
      }
      if (!mounted) {
        return y_default;
      }
      if (is_expanded) {
        return `translateY(calc(${lift} * ${offset}px))`;
      }
      if (toasts_before === 0) {
        return `translateY(0px)`;
      }
      const scale = 1 - toasts_before * 0.05;
      return `translateY(calc(${lift} * ${toasts_before} * ${gap}px)) scale(${scale})`;
    },
  );

  // 高度逻辑（与原版 CSS 一致）：
  //   collapsed + front: auto（自然高度）
  //   collapsed + 非 front: frontToastHeight（统一高度）
  //   expanded: initialHeight（防止展开/折叠切换时 reflow）
  const height_ = derive(
    [expanded, initial_height_, frontToastHeight],
    (is_expanded, initial_height, front_toast_height) => {
      if (is_expanded) {
        return initial_height > 0 ? `${initial_height}px` : "auto";
      }
      // collapsed: 所有 toast 统一使用 frontToastHeight，保证高度一致
      // if (front_toast_height > 0) return `${front_toast_height}px`;
      return initial_height > 0 ? `${initial_height}px` : "auto";
    },
  );

  // collapsed 模式下非 front toast 的内容隐藏
  const content_opacity_ = derive(
    [expanded, is_front_],
    (is_expanded, is_front) => {
      return is_expanded || is_front ? 1 : 0;
    },
  );

  // 退出时 opacity 200ms 快速消失，与原版一致
  // 非 front 折叠态退出：transform 500ms, opacity 200ms
  // front / 展开态退出：使用默认 400ms（DOM 在 200ms 后移除会截断动画）
  // 初始 mount 前：none，防止 height auto → Xpx 触发 CSS 过渡
  const transition_ = derive(
    [mounted_, removed_, is_front_, expanded],
    (mounted, removed, is_front, is_expanded) => {
      if (!mounted) {
        return "none";
      }
      if (removed && !is_front && !is_expanded) {
        return "transform 500ms, opacity 200ms";
      }
      return "transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms";
    },
  );

  return View(
    {
      style: {
        "--index": idx,
        "--toasts-before": toasts_before_,
        "--offset": computed(cur_offset_, (t) => `${t}px`),
        "--lift": lift,
        "--lift-amount": `calc(${lift} * ${gap}px)`,
        "--gap": `${gap}px`,
        "z-index": idx,
        position: "absolute",
        opacity: opacity_,
        transform: transform_,
        height: height_,
        "touch-action": "none",
        transition: transition_,
        "box-sizing": "border-box",
        outline: "none",
        overflow: "hidden",
        "overflow-wrap": "anywhere",
        // styled toast appearance
        padding: "16px",
        background: "var(--normal-bg)",
        border: "1px solid var(--normal-border)",
        color: "var(--normal-text)",
        "border-radius": "var(--border-radius, 8px)",
        "box-shadow": "0px 4px 12px rgba(0, 0, 0, 0.1)",
        width: "var(--width, 356px)",
        "font-size": "13px",
        display: "flex",
        "align-items": "center",
        gap: "6px",
        ...getToastPositionStyles(position),
      },
      onMounted(event: any) {
        const $elm = event.target as HTMLElement;
        if ($elm) {
          const height = Math.round($elm.getBoundingClientRect().height);
          // initial_height_.as(height);
          heights.as([
            { toastId: store.id, height, position },
            ...heights.value,
          ]);
        }
        // 订阅 vm.ToastModel 自身的状态变化（removed 等）
        store.onStateChange((v) => {
          state_.as(v);
        });
        requestAnimationFrame(() => {
          mounted_.as(true);
        });
      },
      beforeUnmounted() {
        offset_before_remove_.as(offset_.value);
        heights.as(heights.value.filter((h) => h.toastId !== store.id));
      },
    },
    [
      height_,
      View(
        {
          style: {
            opacity: content_opacity_,
            transition: "opacity 400ms",
          },
        },
        [
          Show({
            when: isElement(store.content),
            ok() {
              return [store.content as TimelessElement];
            },
            else() {
              return [
                View(
                  {
                    style: {
                      display: "flex",
                      "flex-direction": "column",
                      gap: "2px",
                    },
                  },
                  [
                    View(
                      {
                        style: {
                          "font-weight": 500,
                          "line-height": 1.5,
                          color: "inherit",
                        },
                      },
                      [store.content as string],
                    ),
                  ],
                ),
              ];
            },
          }),
        ],
      ),
    ],
  );
}
