import { notifyMounted } from "@/pages/home/anchor.js";

/**
 * 由 Section 标题派生的稳定 DOM id，是左菜单（pages/home/categories.js）与页面区块之间
 * 唯一的契约 —— 两边都调用它，不手写字面量。
 */
export function sectionId(title) {
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // 纯中文标题（「设计规范」页的中文分组名）slug 会是空串 —— 返回空串而不是 "sec-"，
  // 免得页面上出现一堆重复的 id="sec-"。
  return slug ? "sec-" + slug : "";
}

/**
 * @param {string} title
 * @param {any} children
 * @param {{ id?: string }} [options]
 */
export function Section(title, children, options = {}) {
  const id = options.id || sectionId(title);
  // 标题里没有 a-z0-9（例如「设计规范」页的中文分组名）时 slug 为空串 —— 这时不写 id，
  // 否则一页里会出现一堆重复的 id=""。
  const anchor = id
    ? {
        attributes: { id },
        dataset: { section: id },
        onMounted() {
          notifyMounted(id);
        },
      }
    : {};
  return View(
    {
      ...anchor,
      style: {
        "margin-bottom": "32px",
      },
    },
    [
      View(
        {
          style: {
            "font-size": "var(--weui-FONT-SIZE-SM)",
            "font-weight": "600",
            color: "var(--weui-FG-1)",
            "text-transform": "uppercase",
            "letter-spacing": "0.5px",
            "margin-bottom": "12px",
          },
        },
        [title],
      ),
      View(
        {
          style: {
            "padding-left": "4px",
          },
        },
        children,
      ),
    ],
  );
}

export function Item(label, children) {
  return View(
    {
      style: {
        "margin-bottom": "16px",
      },
    },
    [
      View(
        {
          style: {
            "font-size": "var(--weui-FONT-SIZE-SM)",
            color: "var(--weui-FG-2)",
            "margin-bottom": "8px",
          },
        },
        [label],
      ),
      View(
        {
          style: {
            display: "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
            gap: "12px",
          },
        },
        children,
      ),
    ],
  );
}

/**
 * 一个分类页的骨架：滚动容器 + 页头 + 该分类的区块。
 * 页头只留标题 —— 分类跳转与暗色开关都在左侧菜单里（pages/home/index.js）。
 *
 * 高度写 100%（不是 100vh）：这一页会被 keep-alive 塞进 `position:absolute; inset:0`
 * 的盒子里，100vh 会与外层盒子双重滚动。
 *
 * @param {string} title
 * @param {TimelessElement[]} sections
 */
export function CategoryPage(title, sections) {
  const view$ = new Timeless.vm.ScrollViewCore({});
  return ScrollView(
    {
      store: view$,
      style: {
        padding: "16px",
        height: "100%",
        "overflow-y": "auto",
        // position:relative 必需：ScrollView 若是 static，页面里 position:absolute 的隐藏
        // 控件（Switch/Checkbox 的原生 input 等）会越过它、把 containing block 认成外层
        // .route-view（position:absolute），把 .route-view 的 scrollHeight 撑大几百像素 ——
        // 表现就是滚到底还能继续滚、露出一片空白（双重滚动）。
        position: "relative",
        background: "var(--weui-BG-1)",
      },
    },
    [
      View(
        {
          style: {
            "padding-bottom": "16px",
            "margin-bottom": "24px",
            "border-bottom": "1px solid var(--weui-SEPARATOR-1)",
          },
        },
        [
          View(
            {
              style: {
                "font-size": "20px",
                "font-weight": "700",
                color: "var(--weui-FG-0)",
              },
            },
            [title],
          ),
          View(
            {
              style: {
                "font-size": "13px",
                color: "var(--weui-FG-1)",
                "margin-top": "2px",
              },
            },
            ["同一套 headless 组件，仅 token 与 CSS 不同。"],
          ),
        ],
      ),
      ...sections,
    ],
  );
}
