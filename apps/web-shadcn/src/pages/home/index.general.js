/** 分类页：通用。 */
import { CategoryPage } from "@/components/index.js";
import { ButtonSection } from "./sections.general.js";

export default function GeneralCategoryView() {
  return CategoryPage("通用", () => [ButtonSection()]);
}
