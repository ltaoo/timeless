/**
 * 左侧菜单的分类数据 —— 单一事实来源。
 *
 * key 必须与 store/index.js 里 home.children 的同名路由 key 一致（由 homeRoute() 派生
 * `root.home.<key>`，两边都不手写字面量）；anchor 必须等于 components/index.js 的
 * sectionId(该 Section 的标题)，同样不手写。
 *
 * 空分类（本 app 没有）直接不写在这里 —— 菜单与路由都不会出现空组。
 */
import { sectionId } from "@/components/index.js";

/** 与 store 的 children key 同一约定。 */
export const homeRoute = (key) => `root.home.${key}`;

const anchorOf = (label) => ({ label, anchor: sectionId(label) });

export const CATEGORIES = [
  {
    key: "general",
    title: "通用",
    items: [anchorOf("Button")],
  },
  {
    key: "layout",
    title: "布局",
    items: [anchorOf("Separator")],
  },
  {
    key: "navigation",
    title: "导航",
    items: [anchorOf("Tabs"), anchorOf("DropdownMenu")],
  },
  {
    key: "data_entry",
    title: "数据录入",
    items: [
      anchorOf("Input"),
      anchorOf("Textarea"),
      anchorOf("Checkbox"),
      anchorOf("Switch"),
      anchorOf("Toggle"),
      anchorOf("Select"),
    ],
  },
  {
    key: "data_display",
    title: "数据展示",
    items: [anchorOf("Gallery"), anchorOf("Badge"), anchorOf("Card"), anchorOf("Popover")],
  },
  {
    key: "feedback",
    title: "反馈",
    items: [
      anchorOf("Skeleton"),
      anchorOf("Dialog"),
      anchorOf("Sheet"),
      anchorOf("Toast"),
    ],
  },
  {
    key: "design",
    title: "设计规范",
    route: "root.home.design",
  },
];
