import { CategoryPage } from "@/components/index.js";
import { ButtonSection, KbdLinkSection, LuckyPatternsSection } from "./sections.js";

export default function GeneralCategoryView() {
  return CategoryPage("通用", [ButtonSection(), LuckyPatternsSection(), KbdLinkSection()]);
}
