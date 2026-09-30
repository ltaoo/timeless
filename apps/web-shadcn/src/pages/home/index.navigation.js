/** 分类页：导航。 */
import { CategoryPage } from "@/components/index.js";
import { StepsSection } from "./sections.data.js";
import { MenuSection } from "./sections.feedback.js";
import { TabsSection } from "./sections.nav.js";
import { DropdownMenuSection } from "./sections.overlay.js";

export default function NavigationCategoryView() {
  return CategoryPage("导航", (view$) => [
    StepsSection(),
    MenuSection(),
    TabsSection(),
    DropdownMenuSection(view$),
  ]);
}
