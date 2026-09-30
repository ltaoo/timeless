import { CategoryPage } from "@/components/index.js";
import { TabsSection, DropdownMenuSection } from "./sections.js";

export default function NavigationCategoryView() {
  return CategoryPage("导航", [TabsSection(), DropdownMenuSection()]);
}
