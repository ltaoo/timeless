/** 分类页：布局。 */
import { CategoryPage } from "@/components/index.js";
import { SeparatorSection } from "./sections.general.js";
import { AspectRatioSection, ScrollAreaSection } from "./sections.data.js";
import { ScrollViewSection } from "./sections.scroll.js";

export default function LayoutCategoryView() {
  return CategoryPage("布局", () => [
    SeparatorSection(),
    AspectRatioSection(),
    ScrollAreaSection(),
    ScrollViewSection(),
  ]);
}
