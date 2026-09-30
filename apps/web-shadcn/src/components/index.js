/* 文件树的引擎已提升到共享层（`Timeless.vm.TreeCore` + `Timeless.shadcn.Tree`），
   原来这里的 `tree.js` 随之删除；业务字段（图标 / 体积格式化）留在页面里。 */
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
      class: classNames(["space-y-3"]),
      ...anchor,
    },
    [
      View(
        {
          class: "text-sm font-semibold text-zinc-500 uppercase tracking-wider",
        },
        [title],
      ),
      View({ class: "space-y-4 pl-1" }, children),
    ],
  );
}

export function Item(label, children) {
  return View({ class: "space-y-2" }, [
    View({ class: "text-sm text-zinc-400" }, [label]),
    View({ class: "flex flex-wrap items-center gap-3" }, children),
  ]);
}

/**
 * 一个 antd 分类页：分类标题 + 该分类的全部 Section。
 *
 * `build(view$)` 拿到本页的 ScrollViewCore —— 少数 Section（Select / Dropdown Menu）
 * 要把它交给 popper，才能做「跟随滚动容器」的定位。
 *
 * @param {string} title
 * @param {(view$: any) => any[]} build
 */
export function CategoryPage(title, build) {
  const view$ = new Timeless.vm.ScrollViewCore({});
  // `relative` 必需：ScrollView 是 position:static，页面里那些 position:absolute 的
  // 隐藏控件（Switch 的原生 input、Select 的下拉等）会越过它、把 containing block 认成
  // 外层 .route-view（position:absolute），从而把 .route-view 的 scrollHeight 撑大
  // 几千像素 —— 表现就是滚到底还能继续滚、露出一片空白（双重滚动）。
  return ScrollView({ class: "p-6 relative", store: view$ }, [
    View({ class: "space-y-1" }, [
      View({ class: "text-2xl font-bold" }, [title]),
      View({ class: "text-sm text-zinc-500" }, [
        "同一套 headless 组件，仅 token 与 CSS 不同。",
      ]),
    ]),
    View({ class: "mt-8 space-y-8" }, build(view$)),
  ]);
}
