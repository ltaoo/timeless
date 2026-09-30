/**
 * 左菜单数据 —— 页面结构与菜单的唯一事实来源。
 *
 * 分类用 antd 官网的六类（通用 / 布局 / 导航 / 数据录入 / 数据展示 / 反馈）加第 7 组
 * 「其他」（antd 的「其他」+ Timeless 扩展组件）；「设计规范」是独立路由页，
 * 与各分类同级列在最后。**空组不写进来**，所以菜单里不会出现只有标题没有条目的分组。
 *
 * 条目两种形态：
 *   { label, anchor } → 本分类页内的区块；anchor 必须等于 Section 的标题经 sectionId()
 *                       派生出的 id（两边都调 sectionId，不手写字面量）。
 *   { label, route }  → 独立路由页（有自己的 store 路由，不是区块）。
 */
import { sectionId } from "@/components/index.js";

/** 与 store 的 children key 同一约定：root.home.<key>。 */
export const homeRoute = (key) => `root.home.${key}`;

/** 区块条目：锚点 id 由 Section 标题派生。 */
const anchorOf = (label) => ({ label, anchor: sectionId(label) });

export const CATEGORIES = [
  {
    key: "general",
    title: "通用",
    items: [anchorOf("Button"), anchorOf("Kbd / Link")],
  },
  {
    key: "layout",
    title: "布局",
    items: [
      anchorOf("Separator"),
      anchorOf("AspectRatio / ScrollArea"),
      anchorOf("ResizablePanels"),
      anchorOf("ScrollView"),
    ],
  },
  {
    key: "navigation",
    title: "导航",
    items: [
      anchorOf("DropdownMenu"),
      anchorOf("ContextMenu"),
      anchorOf("Menu"),
      anchorOf("Tabs"),
      anchorOf("Steps"),
    ],
  },
  {
    key: "data_entry",
    title: "数据录入",
    items: [
      anchorOf("Input"),
      anchorOf("Textarea"),
      anchorOf("Label / Checkbox"),
      anchorOf("CheckboxGroup"),
      anchorOf("Radio / RadioGroup"),
      anchorOf("Switch / Toggle"),
      anchorOf("Slider"),
      anchorOf("Select"),
      anchorOf("NumberInput"),
      anchorOf("Field"),
      anchorOf("SearchSelect"),
      anchorOf("FilePicker"),
      anchorOf("Form"),
      anchorOf("DatePicker"),
      anchorOf("DateRangePicker"),
      anchorOf("TimePicker"),
      anchorOf("DateTimePicker"),
      anchorOf("Cascader"),
    ],
  },
  {
    key: "data_display",
    title: "数据展示",
    items: [anchorOf("Gallery"), 
      anchorOf("Avatar / Badge"),
      anchorOf("Card"),
      anchorOf("Popover"),
      anchorOf("Tooltip"),
      anchorOf("Accordion"),
      anchorOf("Table"),
      anchorOf("Waterfall"),
      anchorOf("Tree"),
    ],
  },
  {
    key: "feedback",
    title: "反馈",
    items: [
      anchorOf("Progress"),
      anchorOf("Skeleton"),
      anchorOf("Alert"),
      anchorOf("Dialog"),
      anchorOf("Sheet"),
      anchorOf("Popconfirm"),
      anchorOf("Toast"),
    ],
  },
  {
    key: "extension",
    title: "其他",
    items: [anchorOf("Affix"), anchorOf("Flow")],
  },
  // 设计规范：独立路由页，与分类同级（不是区块）。
  { key: "design", title: "设计规范", route: "root.home.design" },
];
