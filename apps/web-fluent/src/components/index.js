/**
 * 画廊排版辅助组件。仅使用 Timeless 语义别名 token（--foreground / --muted-foreground
 * / --font-size 等），因此同一套排版代码可复用到 material / fluent / animal 的示例应用。
 */
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
      class: "gallery-section",
      ...anchor,
    },
    [
      View({ class: "gallery-section-title" }, [title]),
      View({ class: "gallery-section-body" }, children),
    ],
  );
}

export function Item(label, children) {
  return View({ class: "gallery-item" }, [
    View({ class: "gallery-item-label" }, [label]),
    View({ class: "gallery-item-body" }, children),
  ]);
}

/**
 * 一个分类页的骨架：滚动的 .gallery-root + 页头 + 该分类的区块。
 * 页头只留标题 —— 跳转与暗色开关都在左侧菜单里。
 *
 * @param {string} title
 * @param {TimelessElement[]} sections
 */
export function CategoryPage(title, sections) {
  return ScrollArea({ class: "gallery-root" }, [
    View({ class: "gallery-page" }, [
      View({ class: "gallery-header" }, [
        View({ class: "gallery-header-text" }, [
          View({ class: "gallery-title" }, [title]),
        ]),
      ]),
      ...sections,
    ]),
  ]);
}

