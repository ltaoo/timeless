import { CategoryPage } from "@/components/index.js";
import { ButtonSection } from "./sections.js";

export default function GeneralCategoryView() {
  return CategoryPage("通用", [ButtonSection()]);
}
