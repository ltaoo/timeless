import { GallerySection } from "./gallery.js";
import { CategoryPage } from "@/components/index.js";
import { BadgeSection, CardSection, PopoverSection } from "./sections.js";

export default function DataDisplayCategoryView() {
  return CategoryPage("数据展示", [
    BadgeSection(),
    CardSection(),
    GallerySection(),
    PopoverSection(),
  ]);
}
