import { GallerySection } from "./gallery.js";
import { CategoryPage } from "@/components/index.js";
import {
  AvatarBadgeSection,
  CardSection,
  PopoverSection,
  TooltipSection,
  AccordionSection,
  TableSection,
  WaterfallSection,
  TreeSection,
} from "./sections.js";

export default function DataDisplayCategoryView() {
  return CategoryPage("数据展示", [
    AvatarBadgeSection(),
    CardSection(),
    GallerySection(),
    PopoverSection(),
    TooltipSection(),
    AccordionSection(),
    TableSection(),
    WaterfallSection(),
    TreeSection(),
  ]);
}
