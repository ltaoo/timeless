/** 分类页：反馈。 */
import { CategoryPage } from "@/components/index.js";
import { ProgressSection, SkeletonSection } from "./sections.data.js";
import {
  AlertSection,
  DialogSection,
  SheetSection,
  SonnerSection,
  TransitionSection,
} from "./sections.feedback.js";

export default function FeedbackCategoryView() {
  return CategoryPage("反馈", () => [
    ProgressSection(),
    SkeletonSection(),
    DialogSection(),
    SheetSection(),
    TransitionSection(),
    SonnerSection(),
    AlertSection(),
  ]);
}
