import { GallerySection } from "./gallery.js";
/** 分类页：数据展示。 */
import { CategoryPage } from "@/components/index.js";
import {
  AvatarSection,
  BadgeSection,
  CardSection,
} from "./sections.general.js";
import { AccordionSection } from "./sections.nav.js";
import { TableSection } from "./sections.data.js";
import { PopoverSection } from "./sections.feedback.js";
import {
  PopoverVirtualListSection,
  VirtualListSection,
} from "./sections.scroll.js";

export default function DataDisplayCategoryView() {
  return CategoryPage("数据展示", () => [
    BadgeSection(),
    AvatarSection(),
    CardSection(),
    GallerySection(),
    PopoverSection(),
    AccordionSection(),
    TableSection(),
    VirtualListSection(),
    PopoverVirtualListSection(),
  ]);
}
