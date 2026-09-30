/**
 * 左菜单数据（单一事实来源）。
 *
 * 按 antd 官网的组件分类组织：每个分类 = 一个 key（= store 里 `index` 的子路由名）
 * + 组内条目。条目有两种：
 *   - `{ label, anchor }`：该分类页里的一个区块（anchor 由 sectionId(label) 派生）；
 *   - `{ label, route }`：独立路由页（保持各自现有实现），点了直接跳转。
 *
 * 路由名一律由 homeRoute(key) 派生，避免手写字面量漂移。
 */
import { sectionId } from "@/components/index.js";

/** 分类页的路由名（= store/index.js 里 `index` 的 children key）。 */
export const homeRoute = (key) => `root.home_layout.index.${key}`;

const anchorOf = (label) => ({ label, anchor: sectionId(label) });
const routeOf = (label, key) => ({ label, route: homeRoute(key) });

export const CATEGORIES = [
  {
    key: "general",
    title: "通用",
    items: [anchorOf("Button")],
  },
  {
    key: "layout",
    title: "布局",
    items: [
      anchorOf("Separator"),
      anchorOf("AspectRatio"),
      anchorOf("ScrollArea"),
      anchorOf("ScrollView"),
    ],
  },
  {
    key: "navigation",
    title: "导航",
    items: [
      anchorOf("Steps"),
      anchorOf("Menu"),
      anchorOf("Tabs"),
      anchorOf("Dropdown Menu"),
    ],
  },
  {
    key: "data_entry",
    title: "数据录入",
    items: [
      anchorOf("Input"),
      anchorOf("FileInput"),
      anchorOf("FileDropZone"),
      anchorOf("NumberInput"),
      anchorOf("Textarea"),
      anchorOf("Label"),
      anchorOf("Select"),
      anchorOf("Cascader"),
      anchorOf("DatePicker"),
      anchorOf("DateRangePicker"),
      anchorOf("TimePicker"),
      anchorOf("DateTimePicker"),
      anchorOf("Checkbox"),
      anchorOf("CheckboxGroup"),
      anchorOf("RadioGroup"),
      anchorOf("Switch"),
      anchorOf("Slider"),
      anchorOf("Dialog Form"),
      routeOf("Validate", "validate"),
    ],
  },
  {
    key: "data_display",
    title: "数据展示",
    items: [anchorOf("Gallery"), 
      anchorOf("Badge"),
      anchorOf("Avatar"),
      anchorOf("Card"),
      anchorOf("Popover"),
      anchorOf("Accordion"),
      anchorOf("Table"),
      anchorOf("Virtual List (Waterfall)"),
      anchorOf("Popover + Virtual List"),
      routeOf("Tree", "tree"),
    ],
  },
  {
    key: "feedback",
    title: "反馈",
    items: [
      anchorOf("Progress"),
      anchorOf("Skeleton"),
      anchorOf("Dialog"),
      anchorOf("Sheet"),
      anchorOf("transition"),
      anchorOf("Sonner"),
      anchorOf("Alert"),
    ],
  },
  {
    key: "extension",
    title: "其他",
    items: [
      anchorOf("Affix"),
      anchorOf("Download List"),
      routeOf("Design Spec", "design"),
      routeOf("Flow", "flow"),
      routeOf("Kanban", "kanban"),
      routeOf("LLM", "llm"),
      routeOf("Command Palette", "command"),
      routeOf("Download Task", "download_task"),
      routeOf("Lifecycle", "lifecycle"),
      routeOf("Debug", "debug"),
      routeOf("Locale", "locale"),
    ],
  },
];
