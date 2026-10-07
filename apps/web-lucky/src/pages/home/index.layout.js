import { CategoryPage } from "@/components/index.js";
import {
  SeparatorSection,
  AspectScrollSection,
  ResizablePanelsSection,
  ScrollViewSection,
} from "./sections.js";

export default function LayoutCategoryView() {
  return CategoryPage("布局", [
    SeparatorSection(),
    AspectScrollSection(),
    ResizablePanelsSection(),
    ScrollViewSection(),
  ]);
}
