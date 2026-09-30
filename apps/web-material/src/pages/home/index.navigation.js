import { CategoryPage } from "@/components/index.js";
import {
  DropdownMenuSection,
  ContextMenuSection,
  MenuSection,
  TabsSection,
  StepsSection,
} from "./sections.js";

export default function NavigationCategoryView() {
  return CategoryPage("导航", [
    DropdownMenuSection(),
    ContextMenuSection(),
    MenuSection(),
    TabsSection(),
    StepsSection(),
  ]);
}
