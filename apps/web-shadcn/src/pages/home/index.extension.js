/** 分类页：其他（antd 归类之外的组件）。 */
import { CategoryPage } from "@/components/index.js";
import { AffixSection } from "./sections.data.js";
import { DownloadListSection } from "./sections.scroll.js";

export default function ExtensionCategoryView() {
  return CategoryPage("其他", () => [AffixSection(), DownloadListSection()]);
}
