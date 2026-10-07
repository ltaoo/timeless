import { CategoryPage } from "@/components/index.js";
import { AffixSection, FlowSection } from "./sections.js";

export default function ExtensionCategoryView() {
  return CategoryPage("其他", [AffixSection(), FlowSection()]);
}
